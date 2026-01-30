-- Migration: Fix Representative Orders List RPC
-- Date: 2026-01-29 09:30:00

-- Drop existing function to ensure clean slate
DROP FUNCTION IF EXISTS get_representative_orders_list(INT, TIMESTAMP, TIMESTAMP);

-- Recreate with broader inclusion (no status filter) and robust types
CREATE OR REPLACE FUNCTION get_representative_orders_list(
  p_rep_id INT,
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP
)
RETURNS TABLE (
  "PED_NUMPEDIDO" TEXT,
  "PEDIDO_OUTRO" TEXT,
  "DATA_PEDIDO" TIMESTAMP,
  "STATUS" TEXT,
  "QTDE_PEDIDA" NUMERIC,
  "QTDE_ENTREGUE" NUMERIC,
  "QTDE_SALDO" NUMERIC,
  "VALOR_TOTAL" NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p."PED_NUMPEDIDO"::TEXT as "PED_NUMPEDIDO",
    MAX(p."PEDIDO_OUTRO")::TEXT as "PEDIDO_OUTRO", -- Max/First as it should be same for the order
    MIN(p."DATA_PEDIDO") as "DATA_PEDIDO",
    MAX(p."STATUS")::TEXT as "STATUS",
    SUM(COALESCE(p."QTDE_PEDIDA", 0)) as "QTDE_PEDIDA",
    SUM(COALESCE(p."QTDE_ENTREGUE", 0)) as "QTDE_ENTREGUE",
    SUM(COALESCE(p."QTDE_SALDO", 0)) as "QTDE_SALDO",
    SUM(COALESCE(p."QTDE_PEDIDA", 0) * COALESCE(p."VALOR_UNITARIO", 0)) as "VALOR_TOTAL"
  FROM "BLUEBAY_PEDIDO" p
  WHERE p."REPRESENTANTE"::int = p_rep_id
    AND p."DATA_PEDIDO" BETWEEN p_start_date AND p_end_date
    -- Removed STATUS != '4' filter to show all orders including cancelled ones for analysis
  GROUP BY p."PED_NUMPEDIDO"
  ORDER BY MIN(p."DATA_PEDIDO") DESC;
END;
$$ LANGUAGE plpgsql;
