-- Create Materialized View for Active Representatives
-- This view caches the list of representatives who have had orders in the last 24 months.
-- It is designed to be refreshed periodically (e.g., weekly) as per user request.

CREATE MATERIALIZED VIEW IF NOT EXISTS "public"."MV_REPRESENTANTES_DASHBOARD" AS
WITH RecentOrders AS (
    SELECT DISTINCT "REPRESENTANTE"
    FROM "public"."BLUEBAY_PEDIDO"
    WHERE "PED_ANOBASE" >= (EXTRACT(YEAR FROM CURRENT_DATE) - 2) -- Last ~2-3 years based on year
),
RepDetails AS (
    SELECT
        p."PES_CODIGO" as "codigo_representante",
        COALESCE(p."APELIDO", p."RAZAOSOCIAL", 'Rep ' || p."PES_CODIGO") as "nome_representante"
    FROM "public"."BLUEBAY_PESSOA" p
    JOIN RecentOrders ro ON p."PES_CODIGO" = ro."REPRESENTANTE"
)
SELECT * FROM RepDetails
ORDER BY "nome_representante";

-- Create Index for performance (though small dataset, good practice)
CREATE UNIQUE INDEX IF NOT EXISTS "idx_mv_rep_dashboard_unique" ON "public"."MV_REPRESENTANTES_DASHBOARD" ("codigo_representante");

-- Function to refresh the view (use via cron or manual trigger)
CREATE OR REPLACE FUNCTION "public"."refresh_mv_representantes_dashboard"()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW "public"."MV_REPRESENTANTES_DASHBOARD";
END;
$$ LANGUAGE plpgsql;

-- Grant access to authenticated users (assuming app uses authenticated role)
GRANT SELECT ON "public"."MV_REPRESENTANTES_DASHBOARD" TO authenticated;
GRANT EXECUTE ON FUNCTION "public"."refresh_mv_representantes_dashboard"() TO authenticated;
