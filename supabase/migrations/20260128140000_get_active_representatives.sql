-- Create a function to fetch active representatives efficiently
-- This avoids client-side pagination of thousands of records

CREATE OR REPLACE FUNCTION get_active_representatives(lookback_months int DEFAULT 24)
RETURNS TABLE (
  codigo_representante int,
  nome_representante text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH active_reps AS (
    -- Get representatives from Orders
    SELECT DISTINCT "REPRESENTANTE" as id 
    FROM "BLUEBAY_PEDIDO"
    WHERE "DATA_PEDIDO" >= (CURRENT_DATE - (lookback_months || ' months')::interval)
    AND "REPRESENTANTE" IS NOT NULL
    
    UNION
    
    -- Get representatives from Invoices (MV View)
    -- Ensure explicit cast if needed, though usually integer in both
    SELECT DISTINCT "representante" as id 
    FROM "MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO"
    WHERE "data_emissao" >= (CURRENT_DATE - (lookback_months || ' months')::interval)
    AND "representante" IS NOT NULL
  )
  SELECT 
    p."PES_CODIGO"::int as codigo_representante,
    COALESCE(NULLIF(TRIM(p."APELIDO"), ''), p."RAZAOSOCIAL", 'Rep ' || p."PES_CODIGO") as nome_representante
  FROM active_reps ar
  JOIN "BLUEBAY_PESSOA" p ON p."PES_CODIGO" = ar.id
  ORDER BY nome_representante;
$$;
