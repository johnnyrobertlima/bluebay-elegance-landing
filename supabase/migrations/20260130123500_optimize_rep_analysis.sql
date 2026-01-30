-- Migration: High-Performance Representative Analysis (FIXED)
-- Date: 2026-01-30
-- Description: Corrected column casing and added composite indexes.

-- 1. ADICIONAR ÍNDICES DE PERFORMANCE COMPOSTOS
-- Estes índices são o "segredo" para acabar com os Timeouts em grandes volumes.
CREATE INDEX IF NOT EXISTS idx_bluebay_pedido_rep_data ON "public"."BLUEBAY_PEDIDO" ("REPRESENTANTE", "DATA_PEDIDO") INCLUDE ("PES_CODIGO", "QTDE_PEDIDA", "VALOR_UNITARIO", "STATUS");
CREATE INDEX IF NOT EXISTS idx_bluebay_faturamento_rep_data ON "public"."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" ("representante", "data_emissao") INCLUDE ("pes_codigo", "valor_nota", "quantidade");

-- 2. get_product_stats_v2 (FIXED CASING)
CREATE OR REPLACE FUNCTION get_product_stats_v2(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP,
    p_centro_custo TEXT DEFAULT NULL,
    p_representante INT[] DEFAULT NULL,
    p_cliente INT[] DEFAULT NULL,
    p_produto TEXT[] DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    WITH filtered_orders AS (
        SELECT 
            p."PED_NUMPEDIDO",
            p."DATA_PEDIDO",
            p."ITEM_CODIGO",
            p."QTDE_PEDIDA",
            p."VALOR_UNITARIO",
            p."QTDE_ENTREGUE",
            p."PES_CODIGO",
            (COALESCE(p."QTDE_PEDIDA", 0) * COALESCE(p."VALOR_UNITARIO", 0)) as valor_total,
            (COALESCE(p."QTDE_ENTREGUE", 0) * COALESCE(p."VALOR_UNITARIO", 0)) as valor_faturado
        FROM "BLUEBAY_PEDIDO" p
        WHERE p."DATA_PEDIDO" BETWEEN p_start_date AND p_end_date
          AND p."STATUS" != '4'
          AND (p_centro_custo IS NULL OR 
               (p_centro_custo = 'Não identificado' AND p."CENTROCUSTO" IS NULL) OR 
               (p_centro_custo != 'Não identificado' AND p."CENTROCUSTO" = p_centro_custo))
          AND (p_representante IS NULL OR p."REPRESENTANTE" = ANY(p_representante))
          AND (p_cliente IS NULL OR p."PES_CODIGO" = ANY(p_cliente))
          AND (p_produto IS NULL OR p."ITEM_CODIGO" = ANY(p_produto))
    ),
    item_totals AS (
        SELECT 
            fo."ITEM_CODIGO",
            SUM(fo.valor_total) as val_ped,
            SUM(fo."QTDE_PEDIDA") as qtd_ped,
            SUM(fo.valor_faturado) as val_fat,
            SUM(fo."QTDE_ENTREGUE") as qtd_fat,
            jsonb_agg(
                jsonb_build_object(
                    'PED_NUMPEDIDO', fo."PED_NUMPEDIDO",
                    'APELIDO', COALESCE(pe."APELIDO", pe."RAZAOSOCIAL", 'Desconhecido'),
                    'DATA_PEDIDO', fo."DATA_PEDIDO",
                    'QTDE_PEDIDA', fo."QTDE_PEDIDA",
                    'VALOR_UNITARIO', fo."VALOR_UNITARIO",
                    'VALOR_TOTAL', fo.valor_total,
                    'QTDE_ENTREGUE', fo."QTDE_ENTREGUE",
                    'VALOR_FATURADO', fo.valor_faturado
                ) ORDER BY fo.valor_total DESC
            ) FILTER (WHERE fo.valor_total > 0) as order_details
        FROM filtered_orders fo
        LEFT JOIN "BLUEBAY_PESSOA" pe ON fo."PES_CODIGO" = pe."PES_CODIGO"
        GROUP BY fo."ITEM_CODIGO"
    ),
    category_summary AS (
        SELECT 
            COALESCE(i."GRU_DESCRICAO", 'OUTROS') as gru_desc,
            SUM(it.val_ped) as cat_val_ped,
            SUM(it.qtd_ped) as cat_qtd_ped,
            SUM(it.val_fat) as cat_val_fat,
            SUM(it.qtd_fat) as cat_qtd_fat,
            jsonb_agg(
                jsonb_build_object(
                    'ITEM_CODIGO', it."ITEM_CODIGO",
                    'DESCRICAO', COALESCE(i."DESCRICAO", 'SEM CADASTRO'),
                    'VALOR_PEDIDO', it.val_ped,
                    'QTDE_ITENS', it.qtd_ped,
                    'VALOR_FATURADO', it.val_fat,
                    'QTDE_FATURADA', it.qtd_fat,
                    'TM', CASE WHEN it.qtd_ped > 0 THEN it.val_ped / it.qtd_ped ELSE 0 END,
                    'orders', COALESCE(it.order_details, '[]'::jsonb)
                ) ORDER BY it.val_ped DESC
            ) as items_json
        FROM item_totals it
        LEFT JOIN "BLUEBAY_ITEM" i ON it."ITEM_CODIGO" = i."ITEM_CODIGO"
        GROUP BY 1
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'GRU_DESCRICAO', gru_desc,
            'VALOR_PEDIDO', cat_val_ped,
            'QTDE_ITENS', cat_qtd_ped,
            'VALOR_FATURADO', cat_val_fat,
            'QTDE_FATURADA', cat_qtd_fat,
            'TM', CASE WHEN cat_qtd_ped > 0 THEN cat_val_ped / cat_qtd_ped ELSE 0 END,
            'items', items_json
        ) ORDER BY cat_val_ped DESC
    ) INTO v_result
    FROM category_summary;

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- 3. get_client_stats_v2 (FIXED CASING)
CREATE OR REPLACE FUNCTION get_client_stats_v2(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP,
    p_centro_custo TEXT DEFAULT NULL,
    p_representante INT[] DEFAULT NULL,
    p_cliente INT[] DEFAULT NULL,
    p_produto TEXT[] DEFAULT NULL
)
RETURNS TABLE (
    pes_codigo INT,
    apelido TEXT,
    nome_categoria TEXT,
    total_faturado NUMERIC,
    total_itens_faturados NUMERIC,
    ticket_medio_faturado NUMERIC,
    total_pedidos NUMERIC,
    total_itens_pedidos NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH filtered_invoices AS (
        SELECT 
            f.pes_codigo,
            SUM(f.valor_nota) as sum_val_nota,
            SUM(f.quantidade) as sum_qtd
        FROM "MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" f
        WHERE f.data_emissao BETWEEN p_start_date AND p_end_date
          AND f.status_faturamento != '2'
          AND (p_centro_custo IS NULL OR 
               (p_centro_custo = 'Não identificado' AND f.centrocusto IS NULL) OR 
               (p_centro_custo != 'Não identificado' AND f.centrocusto = p_centro_custo))
          AND (p_representante IS NULL OR f.representante = ANY(p_representante))
          AND (p_cliente IS NULL OR f.pes_codigo = ANY(p_cliente))
        GROUP BY f.pes_codigo
    ),
    filtered_orders AS (
        SELECT 
            p."PES_CODIGO",
            SUM(COALESCE(p."QTDE_PEDIDA", 0) * COALESCE(p."VALOR_UNITARIO", 0)) as sum_val_ped,
            SUM(COALESCE(p."QTDE_PEDIDA", 0)) as sum_qtd_ped
        FROM "BLUEBAY_PEDIDO" p
        WHERE p."DATA_PEDIDO" BETWEEN p_start_date AND p_end_date
          AND p."STATUS" != '4'
          AND (p_centro_custo IS NULL OR 
               (p_centro_custo = 'Não identificado' AND p."CENTROCUSTO" IS NULL) OR 
               (p_centro_custo != 'Não identificado' AND p."CENTROCUSTO" = p_centro_custo))
          AND (p_representante IS NULL OR p."REPRESENTANTE" = ANY(p_representante))
          AND (p_cliente IS NULL OR p."PES_CODIGO" = ANY(p_cliente))
          AND (p_produto IS NULL OR p."ITEM_CODIGO" = ANY(p_produto))
        GROUP BY p."PES_CODIGO"
    ),
    combined AS (
        SELECT 
            COALESCE(i.pes_codigo, o."PES_CODIGO") as pid,
            COALESCE(i.sum_val_nota, 0) as tf,
            COALESCE(i.sum_qtd, 0) as tif,
            COALESCE(o.sum_val_ped, 0) as tp,
            COALESCE(o.sum_qtd_ped, 0) as tip
        FROM filtered_invoices i
        FULL OUTER JOIN filtered_orders o ON i.pes_codigo = o."PES_CODIGO"
    )
    SELECT 
        c.pid,
        COALESCE(pe."APELIDO", pe."RAZAOSOCIAL", 'Desconhecido') as apelido,
        pe."NOME_CATEGORIA" as nome_categoria,
        c.tf::NUMERIC,
        c.tif::NUMERIC,
        CASE WHEN c.tif > 0 THEN (c.tf / c.tif)::NUMERIC ELSE 0 END,
        c.tp::NUMERIC,
        c.tip::NUMERIC
    FROM combined c
    LEFT JOIN "BLUEBAY_PESSOA" pe ON c.pid = pe."PES_CODIGO"
    ORDER BY c.tp DESC;
END;
$$;

-- 4. OTIMIZAR MÉTRICAS DE CLIENTES (get_representative_client_metrics)
CREATE OR REPLACE FUNCTION get_representative_client_metrics(
  p_rep_id INT,
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  WITH last_orders AS (
      SELECT "PES_CODIGO", MIN("DATA_PEDIDO") as primeira_data
      FROM "BLUEBAY_PEDIDO"
      WHERE "REPRESENTANTE" = p_rep_id AND "STATUS" != '4'
      GROUP BY "PES_CODIGO"
  ),
  period_stats AS (
      SELECT 
          COUNT(DISTINCT CASE WHEN p."DATA_PEDIDO" BETWEEN p_start_date AND p_end_date THEN p."PES_CODIGO" END) as active_clients,
          COUNT(DISTINCT CASE WHEN p."DATA_PEDIDO" >= (NOW() - INTERVAL '3 years') THEN p."PES_CODIGO" END) as portfolio_clients,
          COUNT(DISTINCT CASE WHEN p."DATA_PEDIDO" BETWEEN p_start_date AND p_end_date AND lo.primeira_data BETWEEN p_start_date AND p_end_date THEN p."PES_CODIGO" END) as new_clients
      FROM "BLUEBAY_PEDIDO" p
      LEFT JOIN last_orders lo ON p."PES_CODIGO" = lo."PES_CODIGO"
      WHERE p."REPRESENTANTE" = p_rep_id AND p."STATUS" != '4'
  )
  SELECT json_build_object(
    'active_clients', active_clients,
    'portfolio_clients', portfolio_clients,
    'new_clients', new_clients
  ) INTO v_result
  FROM period_stats;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
