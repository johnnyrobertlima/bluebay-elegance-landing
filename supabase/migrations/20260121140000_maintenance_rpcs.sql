-- Migration: Maintenance Page RPCs
-- Date: 2026-01-21
-- Purpose: Backend logic for identifying and fixing missing cost centers.

-- 1. Get Items with Missing Cost Center
-- Returns a combined list of Invoices (from cache) that have no Cost Center
CREATE OR REPLACE FUNCTION public.get_missing_cost_center_items(
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    type TEXT, -- 'INVOICE' or 'ORDER'
    id TEXT,   -- Helper ID
    numero TEXT,
    valor NUMERIC,
    data TIMESTAMP,
    detalhes JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    -- 1. Invoices in Cache with NULL Cost Center
    SELECT 
        'INVOICE'::TEXT as type,
        c.id as id,
        c.nota_numero as numero,
        c.valor_nota as valor,
        c.data_emissao as data,
        jsonb_build_object(
            'pedido_vinculado', c.pedido_numero,
            'filial', c.filial
        ) as detalhes
    FROM public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" c
    WHERE c.centro_custo IS NULL
    ORDER BY c.data_emissao DESC
    LIMIT p_limit;
END;
$$;

-- 2. Update Cost Center
-- This updates the SOURCE table (BLUEBAY_PEDIDO) so future refreshes pick it up.
-- Also attempts to update the Cache immediately for feedback.
CREATE OR REPLACE FUNCTION public.update_order_cost_center(
    p_pedido_numero TEXT,
    p_new_cost_center TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_rows INTEGER;
BEGIN
    -- 1. Update the Source Table (Assuming text matching on PED_NUMPEDIDO)
    -- We normalize to be safe or use simple match? Let's use simple match first.
    UPDATE "BLUEBAY_PEDIDO"
    SET "CENTROCUSTO" = p_new_cost_center
    WHERE "PED_NUMPEDIDO" = p_pedido_numero;

    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;

    -- 2. If source updated, trigger a targeted refresh for this order in the cache?
    -- It's hard to refresh just one item because of the complex join.
    -- We will just manually update the cache table for immediate UI feedback.
    IF v_updated_rows > 0 THEN
        UPDATE public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO"
        SET centro_custo = p_new_cost_center
        WHERE pedido_numero = p_pedido_numero;
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'updated', v_updated_rows
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false, 
        'error', SQLERRM
    );
END;
$$;

-- 3. Get Available Cost Centers (for the dropdown)
CREATE OR REPLACE FUNCTION public.get_available_cost_centers()
RETURNS TABLE (nome text)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT DISTINCT "CENTROCUSTO" as nome
    FROM "BLUEBAY_PEDIDO"
    WHERE "CENTROCUSTO" IS NOT NULL AND "CENTROCUSTO" != ''
    ORDER BY 1;
$$;
