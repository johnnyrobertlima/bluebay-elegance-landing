-- Migration: Fix Dashboard RPC Calculation to use Qty * UnitPrice
-- Date: 2026-01-28 16:30:00

CREATE OR REPLACE FUNCTION get_commercial_dashboard_stats_v3(
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
  -- Fix: Source from MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO
  -- Fix: Calculate Total as (Quantidade * Valor_Unitario) instead of using valor_nota
  CREATE TEMPORARY TABLE IF NOT EXISTS tmp_fat_base_v3 AS
  SELECT 
    data_emissao::DATE as data,
    COALESCE(valor_nota, 0) as valor_nota_orig, 
    COALESCE(quantidade, 0) as quantidade,
    COALESCE(valor_unitario, 0) as valor_unitario,
    (COALESCE(quantidade, 0) * COALESCE(valor_unitario, 0)) as valor_total_calc, -- Calculated Total
    centrocusto,
    representante::text as representante, -- Ensure text
    pes_codigo,
    item_codigo,
    nota,
    transacao,
    tipo,
    status_faturamento as status
  FROM public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO"
  WHERE data_emissao BETWEEN p_start_date AND p_end_date
    AND status_faturamento != '2';

  -- Filtra transações desativadas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'BLUEBAY_REPORT_TYPE_CONFIG') THEN
      DELETE FROM tmp_fat_base_v3
      WHERE tipo NOT IN (
        SELECT tipo 
        FROM public."BLUEBAY_REPORT_TYPE_CONFIG" 
        WHERE report_dashboard_comercial = true
      );
  END IF;

  -- FALLBACK STRATEGY: 
  -- If Representative is NULL/0/Empty in the Invoices, try to find the "Active Representative" from the Client's history.
  UPDATE tmp_fat_base_v3 f
  SET representante = sub.rep
  FROM (
      SELECT DISTINCT ON (p."PES_CODIGO")
          p."PES_CODIGO",
          CAST(p."REPRESENTANTE" AS TEXT) as rep
      FROM "BLUEBAY_PEDIDO" p
      WHERE p."REPRESENTANTE" IS NOT NULL
        AND p."REPRESENTANTE" != 0
      ORDER BY p."PES_CODIGO", p."DATA_PEDIDO" DESC
  ) sub
  WHERE CAST(f.pes_codigo AS TEXT) = CAST(sub."PES_CODIGO" AS TEXT)
    AND (f.representante IS NULL OR f.representante = '0' OR f.representante = '');

  -- 2. Orders Base
  CREATE TEMPORARY TABLE IF NOT EXISTS tmp_ped_base_v3 AS
  SELECT 
    "DATA_PEDIDO"::DATE as data,
    (COALESCE("QTDE_PEDIDA", 0) * COALESCE("VALOR_UNITARIO", 0)) as valor_total,
    COALESCE("QTDE_PEDIDA", 0) as quantidade,
    "CENTROCUSTO",
    CAST("REPRESENTANTE" AS TEXT) as "REPRESENTANTE",
    "PES_CODIGO",
    "ITEM_CODIGO",
    "PED_NUMPEDIDO"
  FROM public."BLUEBAY_PEDIDO"
  WHERE "DATA_PEDIDO" BETWEEN p_start_date AND p_end_date
    AND "STATUS" != '4';

  -- 3. Apply Filters

  -- Centro de Custo
  IF p_centro_custo IS NOT NULL AND p_centro_custo != 'none' THEN
    IF p_centro_custo = 'Não identificado' THEN
      DELETE FROM tmp_fat_base_v3 WHERE centrocusto IS NOT NULL;
      DELETE FROM tmp_ped_base_v3 WHERE "CENTROCUSTO" IS NOT NULL;
    ELSE
      DELETE FROM tmp_fat_base_v3 WHERE centrocusto IS DISTINCT FROM p_centro_custo;
      DELETE FROM tmp_ped_base_v3 WHERE "CENTROCUSTO" IS DISTINCT FROM p_centro_custo;
    END IF;
  END IF;

  -- Representante
  IF p_representante IS NOT NULL AND p_representante != 'none' THEN
    IF p_representante = '0' OR p_representante = 'Não identificado' THEN
      DELETE FROM tmp_fat_base_v3 WHERE representante IS NOT NULL AND representante != '0';
      DELETE FROM tmp_ped_base_v3 WHERE "REPRESENTANTE" IS NOT NULL AND "REPRESENTANTE" != '0';
    ELSE
      DELETE FROM tmp_fat_base_v3 WHERE representante IS DISTINCT FROM p_representante;
      DELETE FROM tmp_ped_base_v3 WHERE "REPRESENTANTE" IS DISTINCT FROM p_representante;
    END IF;
  END IF;

  -- Cliente
  IF p_cliente IS NOT NULL AND p_cliente != 'none' THEN
    DELETE FROM tmp_fat_base_v3 WHERE pes_codigo::text IS DISTINCT FROM p_cliente;
    DELETE FROM tmp_ped_base_v3 WHERE "PES_CODIGO"::text IS DISTINCT FROM p_cliente;
  END IF;

  -- Produto
  IF p_produto IS NOT NULL AND p_produto != 'none' THEN
    DELETE FROM tmp_fat_base_v3 WHERE item_codigo IS DISTINCT FROM p_produto;
    DELETE FROM tmp_ped_base_v3 WHERE "ITEM_CODIGO" IS DISTINCT FROM p_produto;
  END IF;

  -- 4. Aggregations (Using valor_total_calc)
  
  -- Daily
  WITH daily_stats AS (
    SELECT
      data,
      SUM(valor_total_calc) as total_valor,
      SUM(quantidade) as total_qtde,
      COUNT(DISTINCT nota) as doc_count
    FROM tmp_fat_base_v3
    GROUP BY data
  ),
  daily_pedidos AS (
    SELECT
      data,
      SUM(valor_total) as total_valor,
      SUM(quantidade) as total_qtde,
      COUNT(DISTINCT "PED_NUMPEDIDO") as doc_count
    FROM tmp_ped_base_v3
    GROUP BY data
  ),
  -- Monthly
  monthly_stats AS (
    SELECT
      TO_CHAR(data, 'YYYY-MM') as month,
      SUM(valor_total_calc) as total_valor,
      SUM(quantidade) as total_qtde
    FROM tmp_fat_base_v3
    GROUP BY 1
  ),
  -- Cost Centers
  cc_metrics AS (
    SELECT 
        COALESCE(centrocusto, 'Não identificado') as cost_center,
        SUM(valor_total_calc) as fat_val,
        SUM(quantidade) as fat_qtd
    FROM tmp_fat_base_v3
    GROUP BY 1
  ),
  cc_ped_metrics AS (
    SELECT 
        COALESCE("CENTROCUSTO", 'Não identificado') as cost_center,
        SUM(valor_total) as ped_val,
        SUM(quantidade) as ped_qtd
    FROM tmp_ped_base_v3
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
        COALESCE(representante, '0') as rep_id,
        SUM(valor_total_calc) as fat_val,
        SUM(quantidade) as fat_qtd
    FROM tmp_fat_base_v3
    GROUP BY 1
  ),
  rep_ped_metrics AS (
    SELECT 
        COALESCE("REPRESENTANTE", '0') as rep_id,
        SUM(valor_total) as ped_val,
        SUM(quantidade) as ped_qtd
    FROM tmp_ped_base_v3
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
        COALESCE(SUM(valor_total_calc), 0) as fat_val,
        COALESCE(SUM(quantidade), 0) as fat_qtd
      FROM tmp_fat_base_v3
  ),
  total_ped_metrics AS (
      SELECT 
        COALESCE(SUM(valor_total), 0) as ped_val,
        COALESCE(SUM(quantidade), 0) as ped_qtd
      FROM tmp_ped_base_v3
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

  DROP TABLE IF EXISTS tmp_fat_base_v3;
  DROP TABLE IF EXISTS tmp_ped_base_v3;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
