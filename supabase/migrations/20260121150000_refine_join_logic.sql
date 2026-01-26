-- Migration: Refine join logic to use normalize_order_id for PED_NUMPEDIDO (ignoring leading zeros)
-- but keeping strict equality for MATRIZ, FILIAL, and PED_ANOBASE.

-- 1. Update the function populate_commercial_costs_range
-- Dropping to ensure we don't have signature conflicts (e.g. date vs timestamp)
DROP FUNCTION IF EXISTS public.populate_commercial_costs_range(timestamp, timestamp);
DROP FUNCTION IF EXISTS public.populate_commercial_costs_range(date, date);

CREATE OR REPLACE FUNCTION public.populate_commercial_costs_range(start_date date, end_date date)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_start_date DATE := start_date;
    v_end_date DATE := end_date;
BEGIN
    -- Delete existing records in the range to avoid duplicates (idempotency)
    -- Target table has lowercase columns: data_emissao
    DELETE FROM "MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO"
    WHERE data_emissao >= v_start_date AND data_emissao <= v_end_date;

    -- Insert new data with refined join logic
    -- Target table has lowercase columns and specific schema (e.g. 'id' is composite)
    INSERT INTO "MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" (
        id,
        matriz,
        filial,
        ped_numpedido,
        ped_anobase,
        pes_codigo,
        nota,
        tipo,
        transacao,
        status_faturamento,
        data_emissao,
        valor_nota,
        quantidade,
        status_pedido,
        data_pedido,
        centrocusto,
        representante
    )
    SELECT
        f."ID_EF_DOCFISCAL"::text || '-' || f."ID_EF_DOCFISCAL_ITEM"::text, -- Composite ID
        f."MATRIZ",
        f."FILIAL",
        f."PED_NUMPEDIDO",
        f."PED_ANOBASE",
        f."PES_CODIGO",
        f."NOTA",
        f."TIPO",
        f."TRANSACAO",
        f."STATUS" as status_faturamento,
        f."DATA_EMISSAO",
        f."VALOR_NOTA" as valor_nota,
        f."QUANTIDADE",
        p."STATUS" as status_pedido,
        p."DATA_PEDIDO" as data_pedido,
        p."CENTROCUSTO",
        p."REPRESENTANTE" as representante
    FROM
        "BLUEBAY_FATURAMENTO" f
    LEFT JOIN LATERAL (
        SELECT 
            p_sub."STATUS",
            p_sub."DATA_PEDIDO",
            p_sub."CENTROCUSTO",
            p_sub."REPRESENTANTE"
        FROM "BLUEBAY_PEDIDO" p_sub
        WHERE 
            p_sub."MATRIZ" = f."MATRIZ"
            AND p_sub."FILIAL" = f."FILIAL"
            -- Use normalize_order_id for flexible comparison of order numbers (handles leading zeros)
            AND public.normalize_order_id(p_sub."PED_NUMPEDIDO"::text) = public.normalize_order_id(f."PED_NUMPEDIDO"::text)
            AND p_sub."PED_ANOBASE" = f."PED_ANOBASE"
        ORDER BY 
            p_sub."DATA_PEDIDO" DESC -- Pick the latest if duplicates exist
        LIMIT 1
    ) p ON true
    WHERE
        f."DATA_EMISSAO" >= v_start_date AND f."DATA_EMISSAO" <= v_end_date;

END;
$function$;

-- 2. Update the View V_BLUEBAY_DASHBOARD_COMERCIAL with the same logic
-- Drop the view first because we are changing the columns and Postgres doesn't allow dropping columns via CREATE OR REPLACE VIEW
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
    p."STATUS" AS status_pedido,
    p."DATA_PEDIDO" AS data_pedido,
    p."CENTROCUSTO" AS centrocusto,
    p."REPRESENTANTE" AS representante
   FROM "BLUEBAY_FATURAMENTO" f
     LEFT JOIN LATERAL (
        SELECT 
            p_sub."STATUS",
            p_sub."DATA_PEDIDO",
            p_sub."CENTROCUSTO",
            p_sub."REPRESENTANTE"
        FROM "BLUEBAY_PEDIDO" p_sub
        WHERE 
            p_sub."MATRIZ" = f."MATRIZ"
            AND p_sub."FILIAL" = f."FILIAL"
            -- Use normalize_order_id for flexible comparison of order numbers (handles leading zeros)
            AND public.normalize_order_id(p_sub."PED_NUMPEDIDO"::text) = public.normalize_order_id(f."PED_NUMPEDIDO"::text)
            AND p_sub."PED_ANOBASE" = f."PED_ANOBASE"
        ORDER BY 
            p_sub."DATA_PEDIDO" DESC
        LIMIT 1
     ) p ON true;

-- 3. Re-trigger Backfill to correct data with the new logic
DO $$
BEGIN
    -- Refresh 2025 with explicit casts to match function signature
    PERFORM public.populate_commercial_costs_range('2025-01-01'::DATE, '2025-12-31'::DATE);
    -- Refresh 2026 with explicit casts to match function signature
    PERFORM public.populate_commercial_costs_range('2026-01-01'::DATE, '2026-12-31'::DATE);
END $$;
