-- Migration: Update Dashboard V2 with Representative, Client and Product Filters
-- Date: 2026-01-27 17:00:00

CREATE OR REPLACE FUNCTION get_commercial_dashboard_stats_v2(
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP,
  p_centro_custo TEXT DEFAULT NULL,
  p_representante TEXT DEFAULT NULL,
  p_cliente TEXT DEFAULT NULL,
  p_produto TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- 1. Invoices Base
  CREATE TEMPORARY TABLE IF NOT EXISTS tmp_fat_base AS
  SELECT 
    data_emissao::DATE as data,
    valor_nota,
    quantidade,
    centrocusto,
    representante,
    pes_codigo,
    item_codigo,
    nota,
    transacao,
    tipo
  FROM public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO"
  WHERE data_emissao BETWEEN p_start_date AND p_end_date
    AND status_faturamento != '2';

  -- Filtra transações desativadas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'BLUEBAY_REPORT_TYPE_CONFIG') THEN
      DELETE FROM tmp_fat_base
      WHERE tipo NOT IN (
        SELECT tipo 
        FROM public."BLUEBAY_REPORT_TYPE_CONFIG" 
        WHERE report_dashboard_comercial = true
      );
  END IF;

  -- 2. Orders Base
  CREATE TEMPORARY TABLE IF NOT EXISTS tmp_ped_base AS
  SELECT 
    "DATA_PEDIDO"::DATE as data,
    ("QTDE_PEDIDA" * "VALOR_UNITARIO") as valor_total,
    "QTDE_PEDIDA" as quantidade,
    "CENTROCUSTO",
    "REPRESENTANTE",
    "PES_CODIGO",
    "ITEM_CODIGO",
    "PED_NUMPEDIDO"
  FROM "BLUEBAY_PEDIDO"
  WHERE "DATA_PEDIDO" BETWEEN p_start_date AND p_end_date
    AND "STATUS" != '4';

  -- 3. Apply Filters
  
  -- Centro de Custo
  IF p_centro_custo IS NOT NULL AND p_centro_custo != 'none' THEN
    IF p_centro_custo = 'Não identificado' THEN
      DELETE FROM tmp_fat_base WHERE centrocusto IS NOT NULL;
      DELETE FROM tmp_ped_base WHERE "CENTROCUSTO" IS NOT NULL;
    ELSE
      DELETE FROM tmp_fat_base WHERE centrocusto != p_centro_custo;
      DELETE FROM tmp_ped_base WHERE "CENTROCUSTO" != p_centro_custo;
    END IF;
  END IF;

  -- Representante
  IF p_representante IS NOT NULL AND p_representante != 'none' THEN
    IF p_representante = '0' OR p_representante = 'Não identificado' THEN
      DELETE FROM tmp_fat_base WHERE representante IS NOT NULL AND representante != '0';
      DELETE FROM tmp_ped_base WHERE "REPRESENTANTE" IS NOT NULL AND "REPRESENTANTE" != 0;
    ELSE
      DELETE FROM tmp_fat_base WHERE representante::text != p_representante;
      DELETE FROM tmp_ped_base WHERE "REPRESENTANTE"::text != p_representante;
    END IF;
  END IF;

  -- Cliente
  IF p_cliente IS NOT NULL AND p_cliente != 'none' THEN
    DELETE FROM tmp_fat_base WHERE pes_codigo::text != p_cliente;
    DELETE FROM tmp_ped_base WHERE "PES_CODIGO"::text != p_cliente;
  END IF;

  -- Produto
  IF p_produto IS NOT NULL AND p_produto != 'none' THEN
    DELETE FROM tmp_fat_base WHERE item_codigo != p_produto;
    DELETE FROM tmp_ped_base WHERE "ITEM_CODIGO" != p_produto;
  END IF;

  -- 4. Aggregations
  
  -- Daily
  WITH daily_stats AS (
    SELECT
      data,
      SUM(valor_nota) as total_valor,
      SUM(quantidade) as total_qtde,
      COUNT(DISTINCT nota) as doc_count
    FROM tmp_fat_base
    GROUP BY data
  ),
  daily_pedidos AS (
    SELECT
      data,
      SUM(valor_total) as total_valor,
      SUM(quantidade) as total_qtde,
      COUNT(DISTINCT "PED_NUMPEDIDO") as doc_count
    FROM tmp_ped_base
    GROUP BY data
  ),
  -- Monthly
  monthly_stats AS (
    SELECT
      TO_CHAR(data, 'YYYY-MM') as month,
      SUM(valor_nota) as total_valor,
      SUM(quantidade) as total_qtde
    FROM tmp_fat_base
    GROUP BY 1
  ),
  -- Cost Centers
  cc_metrics AS (
    SELECT 
        COALESCE(centrocusto, 'Não identificado') as cost_center,
        SUM(valor_nota) as fat_val,
        SUM(quantidade) as fat_qtd
    FROM tmp_fat_base
    GROUP BY 1
  ),
  cc_ped_metrics AS (
    SELECT 
        COALESCE("CENTROCUSTO", 'Não identificado') as cost_center,
        SUM(valor_total) as ped_val,
        SUM(quantidade) as ped_qtd
    FROM tmp_ped_base
    GROUP BY 1
  ),
  final_cc AS (
     SELECT
        COALESCE(a.cost_center, b.cost_center) as centro_custo,
        SUM(COALESCE(a.fat_val, 0)) as total_faturado,
        SUM(COALESCE(a.fat_qtd, 0)) as total_itens,
        SUM(COALESCE(b.ped_val, 0)) as total_pedido,
        SUM(COALESCE(b.ped_qtd, 0)) as itens_pedidos
     FROM cc_metrics a
     FULL OUTER JOIN cc_ped_metrics b ON a.cost_center = b.cost_center
     GROUP BY 1
  ),
  -- Representatives
  rep_metrics AS (
    SELECT 
        COALESCE(representante::text, '0') as rep_id,
        SUM(valor_nota) as fat_val,
        SUM(quantidade) as fat_qtd
    FROM tmp_fat_base
    GROUP BY 1
  ),
  rep_ped_metrics AS (
    SELECT 
        COALESCE("REPRESENTANTE"::text, '0') as rep_id,
        SUM(valor_total) as ped_val,
        SUM(quantidade) as ped_qtd
    FROM tmp_ped_base
    GROUP BY 1
  ),
  final_rep AS (
     SELECT
        COALESCE(a.rep_id, b.rep_id) as rep_id,
        SUM(COALESCE(a.fat_val, 0)) as total_faturado,
        SUM(COALESCE(a.fat_qtd, 0)) as total_itens,
        SUM(COALESCE(b.ped_val, 0)) as total_pedido,
        SUM(COALESCE(b.ped_qtd, 0)) as itens_pedidos
     FROM rep_metrics a
     FULL OUTER JOIN rep_ped_metrics b ON a.rep_id = b.rep_id
     GROUP BY 1
  ),
  -- Global Totals
  total_metrics AS (
      SELECT 
        COALESCE(SUM(valor_nota), 0) as fat_val,
        COALESCE(SUM(quantidade), 0) as fat_qtd
      FROM tmp_fat_base
  ),
  total_ped_metrics AS (
      SELECT 
        COALESCE(SUM(valor_total), 0) as ped_val,
        COALESCE(SUM(quantidade), 0) as ped_qtd
      FROM tmp_ped_base
  ),
  -- Daily Final
  final_daily AS (
    SELECT
      COALESCE(d.data, p.data) as date,
      COALESCE(d.total_valor, 0) as total,
      COALESCE(d.doc_count, 0) as "faturamentoCount",
      COALESCE(p.total_valor, 0) as "pedidoTotal",
      COALESCE(p.doc_count, 0) as "pedidoCount",
      TO_CHAR(COALESCE(d.data, p.data), 'DD/MM/YYYY') as "formattedDate"
    FROM daily_stats d
    FULL OUTER JOIN daily_pedidos p ON d.data = p.data
  )
  
  SELECT json_build_object(
    'daily', (
      SELECT json_agg(fd ORDER BY fd.date DESC)
      FROM final_daily fd
    ),
    'monthly', (
      SELECT json_agg(json_build_object(
        'month', m.month,
        'total', m.total_valor,
        'quantidade', m.total_qtde
      ) ORDER BY m.month DESC)
      FROM monthly_stats m
    ),
    'totals', (
      SELECT json_build_object(
        'totalFaturado', (SELECT fat_val FROM total_metrics),
        'totalItens', (SELECT fat_qtd FROM total_metrics),
        'mediaValorItem', (
           SELECT CASE 
             WHEN fat_qtd > 0 THEN fat_val / fat_qtd
             ELSE 0 
           END
           FROM total_metrics
        ),
        'totalPedidosValue', (SELECT ped_val FROM total_ped_metrics),
        'totalPedidosQty', (SELECT ped_qtd FROM total_ped_metrics)
      )
    ),
    'costCenters', (
      SELECT json_agg(json_build_object(
        'centroCusto', c.centro_custo,
        'nome', COALESCE(c.centro_custo, 'Não identificado'),
        'totalFaturado', COALESCE(c.total_faturado, 0),
        'totalItensFaturados', COALESCE(c.total_itens, 0),
        'ticketMedioFaturado', CASE 
            WHEN c.total_itens > 0 THEN c.total_faturado / c.total_itens
            ELSE 0 
          END,
        'totalPedidos', COALESCE(c.total_pedido, 0),
        'totalItensPedidos', COALESCE(c.itens_pedidos, 0)
      ) ORDER BY c.total_faturado DESC)
      FROM final_cc c
    ),
    'representatives', (
      SELECT json_agg(json_build_object(
        'id', r.rep_id,
        'totalFaturado', COALESCE(r.total_faturado, 0),
        'totalItensFaturados', COALESCE(r.total_itens, 0),
        'ticketMedioFaturado', CASE 
            WHEN r.total_itens > 0 THEN r.total_faturado / r.total_itens
            ELSE 0 
          END,
        'totalPedidos', COALESCE(r.total_pedido, 0),
        'totalItensPedidos', COALESCE(r.itens_pedidos, 0)
      ) ORDER BY r.total_faturado DESC)
      FROM final_rep r
    )
  ) INTO result;

  DROP TABLE IF EXISTS tmp_fat_base;
  DROP TABLE IF EXISTS tmp_ped_base;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
