-- Migration: Update Dashboard to use Cached Table
-- Date: 2026-01-21
-- Purpose: Point the commercial dashboard stats function to the new cached table for instant loading.

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
    -- 1. Cost Center Indicators (Aggregated from Cache)
    WITH cc_agg AS (
        SELECT 
            COALESCE(centrocusto, 'Não identificado') as name,
            SUM(COALESCE(valor_nota, 0)) as total_faturado,
            SUM(COALESCE(quantidade, 0)) as total_itens_faturados,
            COUNT(*) as count
        FROM public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO"
        WHERE data_emissao BETWEEN p_start_date AND p_end_date
        GROUP BY 1
    )
    SELECT JSONB_AGG(JSONB_BUILD_OBJECT(
        'nome', name,
        'totalFaturado', total_faturado,
        'totalItensFaturados', total_itens_faturados,
        -- Note: 'totalPedidos' logic removed from this view as it was mixed in incorrectly before. 
        -- If needed, we would need to aggregate BLUEBAY_PEDIDO separately again, but purely for financial view, this is cleaner.
        'totalPedidos', 0, 
        'totalItensPedidos', 0,
        'ticketMedioFaturado', CASE WHEN total_itens_faturados > 0 
                                    THEN total_faturado / total_itens_faturados 
                                    ELSE 0 END
    ) ORDER BY name) INTO v_cost_centers
    FROM cc_agg;

    -- 2. Daily Aggregation
    SELECT JSONB_AGG(JSONB_BUILD_OBJECT(
        'date', TO_CHAR(dt, 'YYYY-MM-DD'),
        'total', total,
        'pedidoTotal', 0, -- Placeholder
        'formattedDate', TO_CHAR(dt, 'DD/MM/YYYY')
    ) ORDER BY dt) INTO v_daily
    FROM (
        SELECT 
            data_emissao::DATE as dt,
            SUM(COALESCE(valor_nota, 0)) as total
        FROM public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO"
        WHERE data_emissao BETWEEN p_start_date AND p_end_date
          AND (p_centro_custo IS NULL OR 
               (p_centro_custo = 'Não identificado' AND centrocusto IS NULL) OR
               (centrocusto = p_centro_custo))
        GROUP BY 1
    ) t;

    -- 3. Monthly Aggregation
    SELECT JSONB_AGG(JSONB_BUILD_OBJECT(
        'month', mo,
        'total', total,
        'pedidoTotal', 0, -- Placeholder
        'formattedMonth', TO_CHAR((mo || '-01')::DATE, 'Mon/YYYY')
    ) ORDER BY mo) INTO v_monthly
    FROM (
        SELECT 
            TO_CHAR(data_emissao, 'YYYY-MM') as mo,
            SUM(COALESCE(valor_nota, 0)) as total
        FROM public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO"
        WHERE data_emissao BETWEEN p_start_date AND p_end_date
          AND (p_centro_custo IS NULL OR 
               (p_centro_custo = 'Não identificado' AND centrocusto IS NULL) OR
               (centrocusto = p_centro_custo))
        GROUP BY 1
    ) t;

    -- 4. Totals
    SELECT JSONB_BUILD_OBJECT(
        'totalFaturado', COALESCE(SUM(valor_nota), 0),
        'totalItens', COALESCE(SUM(quantidade), 0),
        'mediaValorItem', CASE WHEN SUM(quantidade) > 0 
                               THEN SUM(valor_nota) / SUM(quantidade) 
                               ELSE 0 END
    ) INTO v_totals
    FROM public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO"
    WHERE data_emissao BETWEEN p_start_date AND p_end_date
      AND (p_centro_custo IS NULL OR 
           (p_centro_custo = 'Não identificado' AND centrocusto IS NULL) OR
           (centrocusto = p_centro_custo));

    -- 5. Final Result
    v_result := JSONB_BUILD_OBJECT(
        'daily', COALESCE(v_daily, '[]'::JSONB),
        'monthly', COALESCE(v_monthly, '[]'::JSONB),
        'totals', COALESCE(v_totals, '{}'::JSONB),
        'costCenters', COALESCE(v_cost_centers, '[]'::JSONB)
    );

    RETURN v_result;
END;
$$;
