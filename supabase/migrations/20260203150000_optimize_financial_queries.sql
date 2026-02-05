-- Add indexes to improve performance of financial queries
CREATE INDEX IF NOT EXISTS idx_bluebay_titulo_tipo_dtvencimento ON "BLUEBAY_TITULO" ("TIPO", "DTVENCIMENTO");
CREATE INDEX IF NOT EXISTS idx_bluebay_titulo_pes_codigo ON "BLUEBAY_TITULO" ("PES_CODIGO");
CREATE INDEX IF NOT EXISTS idx_bluebay_titulo_numnota ON "BLUEBAY_TITULO" ("NUMNOTA");
CREATE INDEX IF NOT EXISTS idx_bluebay_titulo_dtpagto ON "BLUEBAY_TITULO" ("DTPAGTO");

-- RPC function to calculate financial totals efficiently
CREATE OR REPLACE FUNCTION get_financial_totals(
    p_status_filter text DEFAULT 'todos',
    p_client_filter text DEFAULT NULL,
    p_date_from date DEFAULT NULL,
    p_date_to date DEFAULT NULL,
    p_nota_filter text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_vencido numeric := 0;
    v_total_a_vencer numeric := 0;
    v_total_pago numeric := 0;
    v_client_ids text[];
BEGIN
    -- If filtering by client name, we need to resolve names to IDs first
    -- logic to match client_filter on BLUEBAY_PESSOA is complex to do purely inside single query effectively if passed as string
    -- so we assume p_client_filter is passed ONLY if it's an ID or we handle the name resolution in the WHERE clause via join or subquery.
    -- However, the frontend sends a string filter (name/alias).
    -- Let's replicate the frontend logic: find IDs first if filter is present.
    
    IF p_client_filter IS NOT NULL AND p_client_filter <> '' THEN
        SELECT ARRAY_AGG("PES_CODIGO"::text)
        INTO v_client_ids
        FROM "BLUEBAY_PESSOA"
        WHERE "RAZAOSOCIAL" ILIKE '%' || p_client_filter || '%'
           OR "APELIDO" ILIKE '%' || p_client_filter || '%';
           
        -- If filter was provided but no clients found, return zeros immediately
        IF v_client_ids IS NULL THEN
             RETURN json_build_object(
                'totalVencido', 0,
                'totalAVencer', 0,
                'totalPago', 0,
                'totalGeral', 0
            );
        END IF;
    END IF;

    SELECT
        COALESCE(SUM(CASE WHEN "STATUS" = 'VENCIDO' THEN "VLRSALDO" ELSE 0 END), 0) +
        COALESCE(SUM(CASE WHEN "DTPAGTO" IS NULL AND "DTVENCIMENTO" < CURRENT_DATE AND "STATUS" != 'VENCIDO' THEN "VLRSALDO" ELSE 0 END), 0),
        
        COALESCE(SUM(CASE WHEN "DTPAGTO" IS NULL AND "DTVENCIMENTO" >= CURRENT_DATE THEN "VLRSALDO" ELSE 0 END), 0),
        
        COALESCE(SUM(CASE WHEN "DTPAGTO" IS NOT NULL THEN "VLRTITULO" ELSE 0 END), 0)
    INTO
        v_total_vencido,
        v_total_a_vencer,
        v_total_pago
    FROM "BLUEBAY_TITULO"
    WHERE "TIPO" = 'R'
    AND (v_client_ids IS NULL OR "PES_CODIGO"::text = ANY(v_client_ids))
    AND (p_date_from IS NULL OR "DTVENCIMENTO" >= p_date_from)
    AND (p_date_to IS NULL OR "DTVENCIMENTO" <= p_date_to)
    AND (p_nota_filter IS NULL OR p_nota_filter = '' OR "NUMNOTA"::text = p_nota_filter)
    AND (
        p_status_filter = 'todos'
        OR (p_status_filter = 'vencidos' AND "DTPAGTO" IS NULL AND "DTVENCIMENTO" < CURRENT_DATE)
        OR (p_status_filter = 'a_vencer' AND "DTPAGTO" IS NULL AND "DTVENCIMENTO" >= CURRENT_DATE)
        OR (p_status_filter = 'pagos' AND "DTPAGTO" IS NOT NULL)
    );

    RETURN json_build_object(
        'totalVencido', v_total_vencido,
        'totalAVencer', v_total_a_vencer,
        'totalPago', v_total_pago,
        'totalGeral', v_total_vencido + v_total_a_vencer + v_total_pago
    );
END;
$$;

-- RPC function to get grouped client financials
CREATE OR REPLACE FUNCTION get_client_financial_summaries(
    p_status_filter text DEFAULT 'todos',
    p_client_filter text DEFAULT NULL,
    p_date_from date DEFAULT NULL,
    p_date_to date DEFAULT NULL,
    p_nota_filter text DEFAULT NULL
)
RETURNS TABLE (
    "PES_CODIGO" varchar,
    "CLIENTE_NOME" varchar,
    "totalVencido" numeric,
    "totalAVencer" numeric,
    "totalPago" numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t."PES_CODIGO",
        COALESCE(MAX(p."RAZAOSOCIAL"), MAX(t."CLIENTE_NOME"), 'Cliente Desconhecido')::varchar as "CLIENTE_NOME",
        
        -- Total Vencido
        SUM(CASE 
            WHEN t."STATUS" = 'VENCIDO' THEN t."VLRSALDO" 
            WHEN t."DTPAGTO" IS NULL AND t."DTVENCIMENTO" < CURRENT_DATE THEN t."VLRSALDO"
            ELSE 0 
        END)::numeric as "totalVencido",
        
        -- Total A Vencer
        SUM(CASE 
            WHEN t."DTPAGTO" IS NULL AND t."DTVENCIMENTO" >= CURRENT_DATE THEN t."VLRSALDO" 
            ELSE 0 
        END)::numeric as "totalAVencer",
        
        -- Total Pago
        SUM(CASE 
            WHEN t."DTPAGTO" IS NOT NULL THEN t."VLRTITULO" 
            ELSE 0 
        END)::numeric as "totalPago"
        
    FROM "BLUEBAY_TITULO" t
    LEFT JOIN "BLUEBAY_PESSOA" p ON t."PES_CODIGO" = p."PES_CODIGO"
    WHERE t."TIPO" = 'R'
    AND (p_date_from IS NULL OR t."DTVENCIMENTO" >= p_date_from)
    AND (p_date_to IS NULL OR t."DTVENCIMENTO" <= p_date_to)
    AND (p_nota_filter IS NULL OR p_nota_filter = '' OR t."NUMNOTA"::text = p_nota_filter)
    AND (
        p_client_filter IS NULL OR 
        p_client_filter = '' OR 
        p."RAZAOSOCIAL" ILIKE '%' || p_client_filter || '%' OR 
        p."APELIDO" ILIKE '%' || p_client_filter || '%'
    )
    AND (
        p_status_filter = 'todos'
        OR (p_status_filter = 'vencidos' AND t."DTPAGTO" IS NULL AND t."DTVENCIMENTO" < CURRENT_DATE)
        OR (p_status_filter = 'a_vencer' AND t."DTPAGTO" IS NULL AND t."DTVENCIMENTO" >= CURRENT_DATE)
        OR (p_status_filter = 'pagos' AND t."DTPAGTO" IS NOT NULL)
    )
    GROUP BY t."PES_CODIGO"
    HAVING 
        SUM(CASE WHEN t."STATUS" = 'VENCIDO' OR (t."DTPAGTO" IS NULL AND t."DTVENCIMENTO" < CURRENT_DATE) THEN t."VLRSALDO" ELSE 0 END) > 0 OR
        SUM(CASE WHEN t."DTPAGTO" IS NULL AND t."DTVENCIMENTO" >= CURRENT_DATE THEN t."VLRSALDO" ELSE 0 END) > 0 OR
        SUM(CASE WHEN t."DTPAGTO" IS NOT NULL THEN t."VLRTITULO" ELSE 0 END) > 0
    ORDER BY "totalVencido" DESC
    LIMIT 200; -- Limit to top 200 debtors/clients to avoid heavy load, user can filter by name to find specific
END;
$$;
