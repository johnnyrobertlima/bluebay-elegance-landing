-- Debug RPC to check Invoice Types and Configuration
CREATE OR REPLACE FUNCTION debug_invoice_config(
    p_rep_id text, 
    p_start text, 
    p_end text
)
RETURNS JSON AS $$
DECLARE
    invoices JSON;
    config JSON;
BEGIN
    -- 1. Get Distinct Types/Transacoes/Status for the Rep's Invoices in Period
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

    -- 2. Get the Whitelist Configuration
    SELECT json_agg(c) INTO config
    FROM (
        SELECT tipo, transacao, report_dashboard_comercial
        FROM public."BLUEBAY_REPORT_TYPE_CONFIG"
        WHERE report_dashboard_comercial = true
    ) c;

    RETURN json_build_object(
        'invoices_summary', invoices,
        'allowed_config', config
    );
END;
$$ LANGUAGE plpgsql;
