-- Function to auto-fill CODIGOAUX
CREATE OR REPLACE FUNCTION auto_fill_codigoaux()
RETURNS void AS $$
DECLARE
    next_code BIGINT;
    r RECORD;
BEGIN
    -- Find the highest existing numeric code, default to 9999 (so next is 10000)
    -- We filter for only numeric strings using regex to avoid errors with potential alphanumeric legacy codes
    SELECT COALESCE(MAX(NULLIF(regexp_replace(CODIGOAUX, '[^0-9]', '', 'g'), '')::BIGINT), 99999)
    INTO next_code
    FROM "BLUEBAY_ITEM"
    WHERE CODIGOAUX ~ '^[0-9]+$' AND TRIM(CODIGOAUX) <> TRIM(CAST("ITEM_CODIGO" AS TEXT)) AND TRIM(CODIGOAUX) <> '0';

    -- Iterate over items with empty CODIGOAUX
    FOR r IN
        SELECT "ITEM_CODIGO"
        FROM "BLUEBAY_ITEM"
        WHERE CODIGOAUX IS NULL OR TRIM(CODIGOAUX) = '' OR TRIM(CODIGOAUX) = '0' OR TRIM(CODIGOAUX) = TRIM(CAST("ITEM_CODIGO" AS TEXT))
        ORDER BY "ITEM_CODIGO" -- Deterministic order ensures stability
    LOOP
        next_code := next_code + 1;
        
        -- Update the record
        UPDATE "BLUEBAY_ITEM"
        SET CODIGOAUX = CAST(next_code AS TEXT)
        WHERE "ITEM_CODIGO" = r."ITEM_CODIGO";
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Attempt to schedule with pg_cron (if extension exists)
DO $$
BEGIN
    -- Check if pg_cron extension is available/enabled
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        -- Schedule to run every hour at minute 0
        -- Check if job already exists to avoid duplicates (optional, cron.schedule handles names usually)
        PERFORM cron.schedule('auto_fill_codigoaux_job', '0 * * * *', 'SELECT auto_fill_codigoaux()');
    END IF;
END
$$;
