-- Function to get the next available CODIGOAUX
CREATE OR REPLACE FUNCTION get_next_codigoaux()
RETURNS TEXT AS $$
DECLARE
    next_code BIGINT;
BEGIN
    -- Find the highest existing numeric code, default to 99999 (so next is 100000)
    -- We filter for only numeric strings using regex to avoid errors with potential alphanumeric legacy codes
    SELECT COALESCE(MAX(NULLIF(regexp_replace("CODIGOAUX", '[^0-9]', '', 'g'), '')::BIGINT), 99999)
    INTO next_code
    FROM "BLUEBAY_ITEM"
    WHERE "CODIGOAUX" ~ '^[0-9]{6}$' 
      AND TRIM("CODIGOAUX") <> TRIM(CAST("ITEM_CODIGO" AS TEXT)) 
      AND TRIM("CODIGOAUX") <> '0';

    RETURN CAST((next_code + 1) AS TEXT);
END;
$$ LANGUAGE plpgsql;
