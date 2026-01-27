-- Migration: Fix MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO missing columns
-- Date: 2026-01-27
-- Purpose: Add status_pedido and other missing columns to the cache table and view.

-- 1. Add column to the Table
ALTER TABLE public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" 
ADD COLUMN IF NOT EXISTS status_pedido TEXT;

-- 2. Update the View to include status_pedido and match the table structure
DROP VIEW IF EXISTS public."V_BLUEBAY_DASHBOARD_COMERCIAL";

CREATE OR REPLACE VIEW public."V_BLUEBAY_DASHBOARD_COMERCIAL" AS
SELECT 
    f."ID_EF_DOCFISCAL",
    f."ID_EF_DOCFISCAL_ITEM",
    f."MATRIZ",
    f."FILIAL",
    f."PED_NUMPEDIDO",
    f."PED_ANOBASE",
    f."PES_CODIGO",
    f."NOTA",
    f."TIPO",
    f."TRANSACAO",
    f."STATUS" AS status_faturamento,
    f."DATA_EMISSAO",
    f."VALOR_NOTA" AS valor_nota,
    f."QUANTIDADE",
    f."VALOR_UNITARIO",
    f."ITEM_CODIGO",
    f."MPED_NUMORDEM",
    p."STATUS" as status_pedido,
    p."DATA_PEDIDO",
    p."CENTROCUSTO",
    p."REPRESENTANTE" as representante,
    p."CENTROCUSTO" as joined_centrocusto
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
        p_sub."STATUS", 
        p_sub."DATA_PEDIDO", 
        p_sub."REPRESENTANTE",
        p_sub."CENTROCUSTO",
        p_sub."MPED_NUMORDEM",
        p_sub."ITEM_CODIGO"
    FROM "BLUEBAY_PEDIDO" p_sub
    WHERE 
        public.normalize_order_id(p_sub."PED_NUMPEDIDO"::text) = public.normalize_order_id(f."PED_NUMPEDIDO"::text)
        AND 
        (p_sub."PED_ANOBASE" = f."PED_ANOBASE" OR f."PED_ANOBASE" = 0)
    ORDER BY 
        (p_sub."MPED_NUMORDEM" = f."MPED_NUMORDEM" AND p_sub."ITEM_CODIGO" = f."ITEM_CODIGO") DESC,
        (p_sub."MPED_NUMORDEM" = f."MPED_NUMORDEM") DESC,
        p_sub."DATA_PEDIDO" DESC
    LIMIT 1
) p ON true;

-- 3. Update the Function to correctly populate all columns (including new ones in the table if any)
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

    -- Insert new calculated records
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
            f."VALOR_UNITARIO" as valor_unitario,
            f."ITEM_CODIGO" as item_codigo,
            public.normalize_order_id(f."PED_NUMPEDIDO"::text) as norm_ped_id,
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
        id, matriz, filial, ped_numpedido, ped_anobase, pes_codigo, 
        nota, tipo, transacao, status_faturamento, data_emissao, 
        valor_nota, quantidade, valor_unitario, item_codigo,
        status_pedido, data_pedido, centrocusto, representante,
        last_refreshed_at
    )
    SELECT 
        id, matriz, filial, ped_numpedido, ped_anobase, pes_codigo, 
        nota, tipo, transacao, status_faturamento, data_emissao, 
        valor_nota, quantidade, valor_unitario, item_codigo,
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
