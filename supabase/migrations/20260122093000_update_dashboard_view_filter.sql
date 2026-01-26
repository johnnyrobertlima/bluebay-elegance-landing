
-- Migration: Update Dashboard View AND Cache Logic to Enforce Report Configuration
-- Date: 2026-01-22
-- Fixes: ERROR: 42P16 by Dropping View first.
-- Fixes: Missing Cost Center due to strict join in cache population.

-- 1. Seed existing transactions to ensure nothing disappears immediately
DO $$
BEGIN
    INSERT INTO public."BLUEBAY_REPORT_CONFIG" ("transacao", "description")
    SELECT DISTINCT f."TRANSACAO"::text, 'Transação ' || f."TRANSACAO"::text
    FROM public."BLUEBAY_FATURAMENTO" f
    WHERE f."TRANSACAO" IS NOT NULL
    ON CONFLICT ("transacao") DO NOTHING;
END $$;

-- 2. Drop View with CASCADE to avoid column mismatch/rename errors
DROP VIEW IF EXISTS public."V_BLUEBAY_DASHBOARD_COMERCIAL" CASCADE;

-- 3. Recreate the View (with Filter)
CREATE OR REPLACE VIEW public."V_BLUEBAY_DASHBOARD_COMERCIAL" AS
SELECT 
    f.*,
    p."CENTROCUSTO" as "PED_CENTROCUSTO",
    p."DATA_PEDIDO",
    p."REPRESENTANTE" as "PED_REPRESENTANTE",
    p."VALOR_UNITARIO" as "PED_VALOR_UNITARIO",
    p."QTDE_PEDIDA" as "PED_QTDE_PEDIDA",
    p."CENTROCUSTO" as "JOINED_CENTROCUSTO"
FROM "BLUEBAY_FATURAMENTO" f
JOIN public."BLUEBAY_REPORT_CONFIG" rc 
    ON rc."transacao" = f."TRANSACAO"::text 
    AND rc.report_dashboard_comercial = true
LEFT JOIN LATERAL (
    SELECT 
        p."CENTROCUSTO", 
        p."DATA_PEDIDO", 
        p."REPRESENTANTE",
        p."VALOR_UNITARIO",
        p."QTDE_PEDIDA",
        p."MPED_NUMORDEM",
        p."PED_ANOBASE"
    FROM "BLUEBAY_PEDIDO" p
    WHERE 
        public.normalize_order_id(p."PED_NUMPEDIDO"::text) = public.normalize_order_id(f."PED_NUMPEDIDO"::text)
        AND 
        (p."PED_ANOBASE" = f."PED_ANOBASE" OR f."PED_ANOBASE" = 0)
    ORDER BY 
        (p."MPED_NUMORDEM" = f."MPED_NUMORDEM" AND p."ITEM_CODIGO" = f."ITEM_CODIGO") DESC,
        (p."MPED_NUMORDEM" = f."MPED_NUMORDEM") DESC,
        p."DATA_PEDIDO" DESC
    LIMIT 1
) p ON true;

-- 4. Update the Cache Population Function to ALSO respect the config AND use RELAXED JOIN matches
CREATE OR REPLACE FUNCTION public.populate_commercial_costs_range(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Delete existing records for this period
    DELETE FROM public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO"
    WHERE data_emissao BETWEEN p_start_date AND p_end_date;

    -- Insert new calculated records with Filter and Relaxed Join
    WITH source_data AS (
        SELECT 
            f."ID_EF_DOCFISCAL"::text || '-' || f."ID_EF_DOCFISCAL_ITEM"::text as id,
            f."MATRIZ" as matriz,
            f."FILIAL" as filial,
            f."PED_NUMPEDIDO" as ped_numpedido,
            f."PED_ANOBASE" as ped_anobase,
            f."PES_CODIGO" as pes_codigo,
            f."NOTA" as nota,
            f."TIPO" as tipo,
            f."TRANSACAO" as transacao,
            f."STATUS" as status_faturamento,
            f."DATA_EMISSAO" as data_emissao,
            f."VALOR_NOTA" as valor_nota,
            f."QUANTIDADE" as quantidade,
            -- Pre-calculate normalized ID for performance in join
            public.normalize_order_id(f."PED_NUMPEDIDO"::text) as norm_ped_id,
            f."ITEM_CODIGO", -- Use Item Code for priority matching if available
            f."MPED_NUMORDEM" -- Use Order Number for priority matching if available
        FROM "BLUEBAY_FATURAMENTO" f
        -- FILTER JOIN ADDED HERE
        JOIN public."BLUEBAY_REPORT_CONFIG" rc 
            ON rc."transacao" = f."TRANSACAO"::text 
            AND rc.report_dashboard_comercial = true
        WHERE f."DATA_EMISSAO" BETWEEN p_start_date AND p_end_date
    ),
    calculated AS (
        SELECT 
            s.*,
            p."STATUS" as status_pedido,
            p."DATA_PEDIDO" as data_pedido,
            p."CENTROCUSTO" as centrocusto,
            p."REPRESENTANTE" as representante
        FROM source_data s
        LEFT JOIN LATERAL (
            SELECT 
                p_sub."STATUS",
                p_sub."DATA_PEDIDO",
                p_sub."CENTROCUSTO",
                p_sub."REPRESENTANTE",
                p_sub."MPED_NUMORDEM",
                p_sub."ITEM_CODIGO"
            FROM "BLUEBAY_PEDIDO" p_sub
            WHERE 
                -- RELAXED JOIN LOGIC (Matches VIEW)
                public.normalize_order_id(p_sub."PED_NUMPEDIDO"::text) = s.norm_ped_id
                AND (p_sub."PED_ANOBASE" = s.ped_anobase OR s.ped_anobase = 0)
            ORDER BY 
                 -- Priority Matching Logic
                (p_sub."MPED_NUMORDEM" = s."MPED_NUMORDEM" AND p_sub."ITEM_CODIGO" = s."ITEM_CODIGO") DESC,
                (p_sub."MPED_NUMORDEM" = s."MPED_NUMORDEM") DESC,
                p_sub."DATA_PEDIDO" DESC 
            LIMIT 1
        ) p ON true
    )
    INSERT INTO public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" (
        id, 
        matriz, filial, ped_numpedido, ped_anobase, pes_codigo, 
        nota, tipo, transacao, status_faturamento, data_emissao, 
        valor_nota, quantidade,
        status_pedido, data_pedido, centrocusto, representante,
        last_refreshed_at
    )
    SELECT 
        id, 
        matriz, filial, ped_numpedido, ped_anobase, pes_codigo, 
        nota, tipo, transacao, status_faturamento, data_emissao, 
        valor_nota, quantidade,
        status_pedido, data_pedido, centrocusto, representante,
        now()
    FROM calculated;

    GET DIAGNOSTICS v_count = ROW_COUNT;

    RETURN jsonb_build_object(
        'status', 'success',
        'rows_processed', v_count,
        'period_start', p_start_date,
        'period_end', p_end_date
    );
END;
$$;

-- 5. Restore RPC
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
    -- 1. Cost Center Indicators
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
        'pedidoTotal', 0,
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
        'pedidoTotal', 0,
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

-- 6. Trigger a partial refresh to ensure data is consistent
SELECT public.populate_commercial_costs_range(
    (CURRENT_DATE - INTERVAL '30 days')::TIMESTAMP,
    (CURRENT_DATE + INTERVAL '1 day')::TIMESTAMP
);
