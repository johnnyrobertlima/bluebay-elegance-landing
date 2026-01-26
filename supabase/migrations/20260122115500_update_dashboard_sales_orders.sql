
-- Migration: Update RPC with Counts
-- Date: 2026-01-22
-- Purpose: Include "faturamentoCount" and "pedidoCount" in get_commercial_dashboard_stats.

CREATE OR REPLACE FUNCTION public.get_commercial_dashboard_stats(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP,
    p_centro_custo TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result JSONB;
    v_daily JSONB;
    v_monthly JSONB;
    v_totals JSONB;
    v_cost_centers JSONB;
BEGIN

    -- 1. DROP temp tables if they exist
    DROP TABLE IF EXISTS tmp_fat_base;
    DROP TABLE IF EXISTS tmp_ped_base;

    -- 2. Create and Populate Temp Table for Faturamento
    CREATE TEMP TABLE tmp_fat_base AS
    SELECT 
        COALESCE(centrocusto, 'Não identificado') as cc_name,
        data_emissao::DATE as dt,
        TO_CHAR(data_emissao, 'YYYY-MM') as mo,
        valor_nota,
        quantidade
    FROM public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO"
    WHERE data_emissao >= p_start_date AND data_emissao <= p_end_date
      AND (p_centro_custo IS NULL OR 
           (p_centro_custo = 'Não identificado' AND centrocusto IS NULL) OR
           (centrocusto = p_centro_custo));

    -- 3. Create and Populate Temp Table for Pedidos
    CREATE TEMP TABLE tmp_ped_base AS
    SELECT 
        COALESCE("CENTROCUSTO", 'Não identificado') as cc_name,
        "DATA_PEDIDO"::DATE as dt,
        TO_CHAR("DATA_PEDIDO", 'YYYY-MM') as mo,
        ("VALOR_UNITARIO" * "QTDE_PEDIDA") as valor_pedido,
        "QTDE_PEDIDA" as quantidade_pedido
    FROM "BLUEBAY_PEDIDO"
    WHERE "DATA_PEDIDO" >= p_start_date AND "DATA_PEDIDO" <= p_end_date
      AND "STATUS" != '4' -- Exclude Cancelled
      AND (p_centro_custo IS NULL OR 
           (p_centro_custo = 'Não identificado' AND "CENTROCUSTO" IS NULL) OR
           ("CENTROCUSTO" = p_centro_custo));

    -- 4. Cost Centers Aggregation
    SELECT JSONB_AGG(JSONB_BUILD_OBJECT(
        'nome', name,
        'totalFaturado', total_faturado,
        'totalItensFaturados', total_itens_faturados,
        'totalPedidos', total_pedidos_val, 
        'totalItensPedidos', total_itens_pedidos,
        'ticketMedioFaturado', CASE WHEN total_itens_faturados > 0 
                                    THEN total_faturado / total_itens_faturados 
                                    ELSE 0 END
    ) ORDER BY name) INTO v_cost_centers
    FROM (
        SELECT 
            COALESCE(f.cc_name, p.cc_name) as name,
            COALESCE(f.valor_nota, 0) as total_faturado,
            COALESCE(f.quantidade, 0) as total_itens_faturados,
            COALESCE(p.valor_pedido, 0) as total_pedidos_val,
            COALESCE(p.quantidade_pedido, 0) as total_itens_pedidos
        FROM (
            SELECT cc_name, SUM(valor_nota) as valor_nota, SUM(quantidade) as quantidade FROM tmp_fat_base GROUP BY 1
        ) f
        FULL OUTER JOIN (
            SELECT cc_name, SUM(valor_pedido) as valor_pedido, SUM(quantidade_pedido) as quantidade_pedido FROM tmp_ped_base GROUP BY 1
        ) p ON f.cc_name = p.cc_name
    ) final_cc;


    -- 5. Daily Aggregation (Added Counts)
    SELECT JSONB_AGG(JSONB_BUILD_OBJECT(
        'date', TO_CHAR(dt, 'YYYY-MM-DD'),
        'total', total_fat,
        'faturamentoCount', count_fat,
        'pedidoTotal', total_ped,
        'pedidoCount', count_ped,
        'formattedDate', TO_CHAR(dt, 'DD/MM/YYYY')
    ) ORDER BY dt) INTO v_daily
    FROM (
        SELECT 
            COALESCE(f.dt, p.dt) as dt,
            COALESCE(f.val, 0) as total_fat,
            COALESCE(f.qtd, 0) as count_fat,
            COALESCE(p.val, 0) as total_ped,
            COALESCE(p.qtd, 0) as count_ped
        FROM (
            SELECT dt, SUM(valor_nota) as val, COUNT(*) as qtd FROM tmp_fat_base GROUP BY 1
        ) f
        FULL OUTER JOIN (
            SELECT dt, SUM(valor_pedido) as val, COUNT(*) as qtd FROM tmp_ped_base GROUP BY 1
        ) p ON f.dt = p.dt
    ) t;

    -- 6. Monthly Aggregation
    SELECT JSONB_AGG(JSONB_BUILD_OBJECT(
        'month', mo,
        'total', total_fat,
        'pedidoTotal', total_ped,
        'formattedMonth', TO_CHAR((mo || '-01')::DATE, 'Mon/YYYY')
    ) ORDER BY mo) INTO v_monthly
    FROM (
         SELECT 
            COALESCE(f.mo, p.mo) as mo,
            COALESCE(f.val, 0) as total_fat,
            COALESCE(p.val, 0) as total_ped
        FROM (SELECT mo, SUM(valor_nota) as val FROM tmp_fat_base GROUP BY 1) f
        FULL OUTER JOIN (SELECT mo, SUM(valor_pedido) as val FROM tmp_ped_base GROUP BY 1) p ON f.mo = p.mo
    ) t;

    -- 7. Grand Totals
    SELECT JSONB_BUILD_OBJECT(
        'totalFaturado', (SELECT COALESCE(SUM(valor_nota), 0) FROM tmp_fat_base),
        'totalItens', (SELECT COALESCE(SUM(quantidade), 0) FROM tmp_fat_base),
        'mediaValorItem', (
            SELECT CASE WHEN SUM(quantidade) > 0 
                   THEN SUM(valor_nota) / SUM(quantidade) 
                   ELSE 0 END 
            FROM tmp_fat_base
        ),
        'totalPedidosValue', (SELECT COALESCE(SUM(valor_pedido), 0) FROM tmp_ped_base),
        'totalPedidosQty', (SELECT COALESCE(SUM(quantidade_pedido), 0) FROM tmp_ped_base)
    ) INTO v_totals;

    -- 8. Cleanup
    DROP TABLE IF EXISTS tmp_fat_base;
    DROP TABLE IF EXISTS tmp_ped_base;

    -- Assemble Result
    v_result := JSONB_BUILD_OBJECT(
        'daily', COALESCE(v_daily, '[]'::JSONB),
        'monthly', COALESCE(v_monthly, '[]'::JSONB),
        'totals', COALESCE(v_totals, '{}'::JSONB),
        'costCenters', COALESCE(v_cost_centers, '[]'::JSONB)
    );

    RETURN v_result;

END;
$$;
