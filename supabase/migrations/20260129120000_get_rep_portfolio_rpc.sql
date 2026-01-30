-- Migration: Create RPC to get representative client portfolio analysis
-- Date: 2026-01-29 12:00:00

DROP FUNCTION IF EXISTS get_representative_client_portfolio(INT, INT, INT);

CREATE OR REPLACE FUNCTION get_representative_client_portfolio(
  p_rep_id INT,
  p_start_year INT,
  p_end_year INT
)
RETURNS TABLE (
  "CLIENTE_ID" INT,
  "APELIDO" TEXT,
  "RAZAOSOCIAL" TEXT,
  "ANO" INT,
  "TOTAL_VALOR" NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p."PES_CODIGO"::INT as "CLIENTE_ID",
    MAX(c."APELIDO")::TEXT as "APELIDO",
    MAX(c."RAZAOSOCIAL")::TEXT as "RAZAOSOCIAL",
    DATE_PART('year', p."DATA_PEDIDO")::INT as "ANO",
    SUM(p."QTDE_PEDIDA" * p."VALOR_UNITARIO") as "TOTAL_VALOR"
  FROM "BLUEBAY_PEDIDO" p
  LEFT JOIN "BLUEBAY_PESSOA" c ON p."PES_CODIGO" = c."PES_CODIGO"
  WHERE p."REPRESENTANTE"::int = p_rep_id
    AND DATE_PART('year', p."DATA_PEDIDO")::INT BETWEEN p_start_year AND p_end_year
    AND p."STATUS" NOT IN ('4') -- Exclude Cancelled
  GROUP BY p."PES_CODIGO", DATE_PART('year', p."DATA_PEDIDO")
  ORDER BY "TOTAL_VALOR" DESC;
END;
$$ LANGUAGE plpgsql;
