-- Debug RPC to check Invoice Types/Transactions vs Configuration
CREATE OR REPLACE FUNCTION debug_invoice_config(
    p_rep_id text, 
    p_start text, 
    p_end text
)
RETURNS JSON AS $$
DECLARE
    invoices JSON;
    config_types JSON;
    config_trans JSON;
BEGIN
    -- 1. Get Distinct Types/Transacoes/Status for the Rep's Invoices
    SELECT json_agg(t) INTO invoices
    FROM (
        SELECT DISTINCT 
            tipo, 
            transacao, 
            status_faturamento,
            count(*) as qtd_notas
        FROM public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO"
        WHERE representante::text = p_rep_id
          AND data_emissao BETWEEN p_start::timestamp AND p_end::timestamp
        GROUP BY 1, 2, 3
    ) t;

    -- 2. Get Configured Allowed Types
    SELECT json_agg(c) INTO config_types
    FROM (
        SELECT tipo, report_dashboard_comercial
        FROM public."BLUEBAY_REPORT_TYPE_CONFIG"
        WHERE report_dashboard_comercial = true
    ) c;

    -- 3. Get Configured Allowed Transactions
    -- Handle case where table might not exist or have different structure
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'BLUEBAY_REPORT_CONFIG') THEN
        SELECT json_agg(c) INTO config_trans
        FROM (
            SELECT transacao, report_dashboard_comercial
            FROM public."BLUEBAY_REPORT_CONFIG"
            WHERE report_dashboard_comercial = true
        ) c;
    ELSE
        config_trans := '[]'::json;
    END IF;

    RETURN json_build_object(
        'invoices_summary', invoices,
        'allowed_types', config_types,
        'allowed_transactions', config_trans
    );
END;
$$ LANGUAGE plpgsql;
