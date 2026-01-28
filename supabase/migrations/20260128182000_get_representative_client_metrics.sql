-- Migration: Create get_representative_client_metrics RPC
-- Date: 2026-01-28 18:20:00

CREATE OR REPLACE FUNCTION get_representative_client_metrics(
  p_rep_id INT,
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP
)
RETURNS JSON AS $$
DECLARE
  active_count INT;
  portfolio_count INT;
  new_count INT;
BEGIN
  -- 1. Active Clients (Distinct clients with orders in the selected period)
  SELECT COUNT(DISTINCT "PES_CODIGO")
  INTO active_count
  FROM "BLUEBAY_PEDIDO"
  WHERE "REPRESENTANTE" = p_rep_id
    AND "DATA_PEDIDO" BETWEEN p_start_date AND p_end_date
    AND "STATUS" != '4'; -- Exclude cancelled

  -- 2. Portfolio Clients (Distinct clients with orders in the last 3 years)
  SELECT COUNT(DISTINCT "PES_CODIGO")
  INTO portfolio_count
  FROM "BLUEBAY_PEDIDO"
  WHERE "REPRESENTANTE" = p_rep_id
    AND "DATA_PEDIDO" >= (NOW() - INTERVAL '3 years')
    AND "STATUS" != '4';

  -- 3. New Clients (Active clients who had NO orders before the start date for this representative)
  SELECT COUNT(DISTINCT t1."PES_CODIGO")
  INTO new_count
  FROM "BLUEBAY_PEDIDO" t1
  WHERE t1."REPRESENTANTE" = p_rep_id
    AND t1."DATA_PEDIDO" BETWEEN p_start_date AND p_end_date
    AND t1."STATUS" != '4'
    AND NOT EXISTS (
      SELECT 1 
      FROM "BLUEBAY_PEDIDO" t2 
      WHERE t2."PES_CODIGO" = t1."PES_CODIGO"
        AND t2."REPRESENTANTE" = p_rep_id
        AND t2."DATA_PEDIDO" < p_start_date
        AND t2."STATUS" != '4'
    );

  RETURN json_build_object(
    'active_clients', active_count,
    'portfolio_clients', portfolio_count,
    'new_clients', new_count
  );
END;
$$ LANGUAGE plpgsql;
