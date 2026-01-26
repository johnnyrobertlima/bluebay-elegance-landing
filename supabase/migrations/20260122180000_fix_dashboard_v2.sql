-- Migration: Fix Dashboard V2 (Idempotent)
-- Date: 2026-01-22 18:00:00
-- Purpose: 
-- 1. Ensure Config Table exists (idempotent).
-- 2. Ensure Policy exists (handled via DROP/CREATE).
-- 3. Deploy get_commercial_dashboard_stats_v2.

-- 1. Table Config
CREATE TABLE IF NOT EXISTS public."BLUEBAY_REPORT_TYPE_CONFIG" (
    "tipo" TEXT PRIMARY KEY,
    "description" TEXT,
    "report_dashboard_comercial" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Policy (Drop first to avoid collision)
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public."BLUEBAY_REPORT_TYPE_CONFIG";

ALTER TABLE public."BLUEBAY_REPORT_TYPE_CONFIG" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access for authenticated users" ON public."BLUEBAY_REPORT_TYPE_CONFIG"
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Seed Data
INSERT INTO public."BLUEBAY_REPORT_TYPE_CONFIG" ("tipo", "description")
SELECT DISTINCT f."TIPO", 'Tipo ' || f."TIPO"
FROM public."BLUEBAY_FATURAMENTO" f
WHERE f."TIPO" IS NOT NULL
ON CONFLICT ("tipo") DO NOTHING;

-- 4. Deploy Function V2
CREATE OR REPLACE FUNCTION get_commercial_dashboard_stats_v2(
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP,
  p_centro_custo TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Tabela temporária lendo da MV CORRETA (com aspas)
  CREATE TEMPORARY TABLE IF NOT EXISTS tmp_fat_base AS
  SELECT 
    data_emissao::DATE as data,
    valor_nota,
    quantidade,
    centrocusto,
    nota,
    transacao,
    tipo
  FROM public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO"
  WHERE data_emissao BETWEEN p_start_date AND p_end_date
    AND status_faturamento != '2';

  -- Filtra transações desativadas (Safety check)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'BLUEBAY_REPORT_TYPE_CONFIG') THEN
      DELETE FROM tmp_fat_base
      WHERE transacao::TEXT NOT IN (
        SELECT transacao::TEXT 
        FROM public."BLUEBAY_REPORT_TYPE_CONFIG" 
        WHERE report_dashboard_comercial = true
      );

      DELETE FROM tmp_fat_base
      WHERE tipo NOT IN (
        SELECT tipo 
        FROM public."BLUEBAY_REPORT_TYPE_CONFIG" 
        WHERE report_dashboard_comercial = true
      );
  END IF;

  CREATE TEMPORARY TABLE IF NOT EXISTS tmp_ped_base AS
  SELECT 
    "DATA_PEDIDO"::DATE as data,
    ("QTDE_PEDIDA" * "VALOR_UNITARIO") as valor_total,
    "QTDE_PEDIDA" as quantidade,
    "CENTROCUSTO",
    "PED_NUMPEDIDO"
  FROM "BLUEBAY_PEDIDO"
  WHERE "DATA_PEDIDO" BETWEEN p_start_date AND p_end_date
    AND "STATUS" != '4';

  IF p_centro_custo IS NOT NULL AND p_centro_custo != 'none' THEN
    DELETE FROM tmp_fat_base WHERE centrocusto != p_centro_custo;
    DELETE FROM tmp_ped_base WHERE "CENTROCUSTO" != p_centro_custo;
  ELSEIF p_centro_custo = 'Não identificado' THEN
    DELETE FROM tmp_fat_base WHERE centrocusto IS NOT NULL;
    DELETE FROM tmp_ped_base WHERE "CENTROCUSTO" IS NOT NULL;
  END IF;

  WITH daily_stats AS (
    SELECT
      data,
      SUM(valor_nota) as total_valor,
      SUM(quantidade) as total_qtde,
      COUNT(DISTINCT nota) as doc_count,
      'faturamento' as type
    FROM tmp_fat_base
    GROUP BY data
  ),
  daily_pedidos AS (
    SELECT
      data,
      SUM(valor_total) as total_valor,
      SUM(quantidade) as total_qtde,
      COUNT(DISTINCT "PED_NUMPEDIDO") as doc_count,
      'pedido' as type
    FROM tmp_ped_base
    GROUP BY data
  ),
  monthly_stats AS (
    SELECT
      TO_CHAR(data, 'YYYY-MM') as month,
      SUM(valor_nota) as total_valor,
      SUM(quantidade) as total_qtde
    FROM tmp_fat_base
    GROUP BY 1
  ),
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
    )
  ) INTO result;

  DROP TABLE IF EXISTS tmp_fat_base;
  DROP TABLE IF EXISTS tmp_ped_base;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
