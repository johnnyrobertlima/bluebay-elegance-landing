-- Migration: Sync Dashboard View and Backfill Cache
-- Date: 2026-01-21
-- Purpose: 
-- 1. Update V_BLUEBAY_DASHBOARD_COMERCIAL to match the stricter join logic of the MV (avoiding mismatches).
-- 2. Backfill the MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO table for the last ~13 months so the dashboard has data immediately.

-- 1. Re-create the View with Strict Join Logic
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
        -- Stricter Join as requested by user
        p."MATRIZ" = f."MATRIZ"
        AND p."FILIAL" = f."FILIAL"
        AND p."PED_NUMPEDIDO" = f."PED_NUMPEDIDO"
        AND p."PED_ANOBASE" = f."PED_ANOBASE"
    ORDER BY 
        p."DATA_PEDIDO" DESC 
    LIMIT 1
) p ON true;

-- 2. Backfill the Cache Table (Data for 2025 and 2026)
-- We use DO block to execute the population function.
DO $$
BEGIN
    -- Populate from Jan 1st, 2025 to Dec 31st, 2026 (covering current and previous year)
    -- This ensures the dashboard doesn't look empty upon first load.
    PERFORM public.populate_commercial_costs_range(
        '2025-01-01 00:00:00'::timestamp,
        '2026-12-31 23:59:59'::timestamp
    );
END $$;
