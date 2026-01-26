
-- Migration: Add Report Configuration for 'TIPO'
-- Date: 2026-01-22
-- Purpose: Allow filtering by Invoice Type (TIPO) in addition to Transaction.

-- 1. Create Type Config Table
CREATE TABLE IF NOT EXISTS public."BLUEBAY_REPORT_TYPE_CONFIG" (
    "tipo" TEXT PRIMARY KEY,
    "description" TEXT,
    "report_dashboard_comercial" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public."BLUEBAY_REPORT_TYPE_CONFIG" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access for authenticated users" ON public."BLUEBAY_REPORT_TYPE_CONFIG"
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Trigger for updated_at
DROP TRIGGER IF EXISTS handle_report_type_config_updated_at ON public."BLUEBAY_REPORT_TYPE_CONFIG";
CREATE TRIGGER handle_report_type_config_updated_at
    BEFORE UPDATE ON public."BLUEBAY_REPORT_TYPE_CONFIG"
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- 3. RPCs for Type Config

-- Sync Types
CREATE OR REPLACE FUNCTION public.sync_bluebay_report_type_configs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public."BLUEBAY_REPORT_TYPE_CONFIG" ("tipo", "description")
    SELECT DISTINCT 
        f."TIPO", 
        'Tipo ' || f."TIPO"
    FROM public."BLUEBAY_FATURAMENTO" f
    WHERE f."TIPO" IS NOT NULL
    ON CONFLICT ("tipo") DO NOTHING;
END;
$$;

-- Get Types
CREATE OR REPLACE FUNCTION public.get_bluebay_report_type_configs()
RETURNS TABLE (
    tipo TEXT,
    description TEXT,
    report_dashboard_comercial BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT * FROM public."BLUEBAY_REPORT_TYPE_CONFIG" ORDER BY tipo;
$$;

-- Update Type Config
CREATE OR REPLACE FUNCTION public.update_bluebay_report_type_config(
    p_tipo TEXT,
    p_description TEXT,
    p_report_dashboard_comercial BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public."BLUEBAY_REPORT_TYPE_CONFIG"
    SET 
        "description" = p_description,
        "report_dashboard_comercial" = p_report_dashboard_comercial,
        "updated_at" = now()
    WHERE "tipo" = p_tipo;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_bluebay_report_type_configs() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_bluebay_report_type_configs() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_bluebay_report_type_config(TEXT, TEXT, BOOLEAN) TO authenticated;

-- 4. Seed initial types
SELECT public.sync_bluebay_report_type_configs();


-- 5. Update View to Filter by Type AND Transaction
DROP VIEW IF EXISTS public."V_BLUEBAY_DASHBOARD_COMERCIAL" CASCADE;

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
-- Filter by Transaction
JOIN public."BLUEBAY_REPORT_CONFIG" rc 
    ON rc."transacao" = f."TRANSACAO"::text 
    AND rc.report_dashboard_comercial = true
-- Filter by Type
JOIN public."BLUEBAY_REPORT_TYPE_CONFIG" rtc
    ON rtc."tipo" = f."TIPO"
    AND rtc.report_dashboard_comercial = true
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

-- 6. Update Cache Population to Filter by Type AND Transaction
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

    -- Insert new calculated records with Filters
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
            public.normalize_order_id(f."PED_NUMPEDIDO"::text) as norm_ped_id,
            f."ITEM_CODIGO",
            f."MPED_NUMORDEM"
        FROM "BLUEBAY_FATURAMENTO" f
        -- Filter by Transaction
        JOIN public."BLUEBAY_REPORT_CONFIG" rc 
            ON rc."transacao" = f."TRANSACAO"::text 
            AND rc.report_dashboard_comercial = true
        -- Filter by Type
        JOIN public."BLUEBAY_REPORT_TYPE_CONFIG" rtc
            ON rtc."tipo" = f."TIPO"
            AND rtc.report_dashboard_comercial = true
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
                public.normalize_order_id(p_sub."PED_NUMPEDIDO"::text) = s.norm_ped_id
                AND (p_sub."PED_ANOBASE" = s.ped_anobase OR s.ped_anobase = 0)
            ORDER BY 
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

-- 7. Restore RPC (Standard practice to ensure it persists)
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
