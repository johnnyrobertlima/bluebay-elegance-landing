-- DATA REPAIR SCRIPT FOR PMMW-100/B/SM
-- This fixes the double-counting issue for this specific item

DO $$
BEGIN
    -- 1. Deduct the incorrectly added stock (3396) from the Clean Items in Matriz 10
    -- matches only the rows that were inflated (current disp > 3000)
    UPDATE "BLUEBAY_ESTOQUE"
    SET 
        "DISPONIVEL" = "DISPONIVEL" - 3396,
        "FISICO" = "FISICO" -- Fisico was 0 for dirty item, so no deduction needed if it was added. But wait, previous debug showed Fisico 0 for Dirty.
    WHERE "ITEM_CODIGO" = 'PPMW-100/B/SM'
      AND "MATRIZ" = 10
      AND "DISPONIVEL" >= 3396;

    -- 2. Clean up any remaining ORPHANED dirty stock for this item code
    -- These are rows where ITEM_CODIGO has space, but parent ITEM might be gone
    UPDATE "BLUEBAY_ESTOQUE" dt
    SET "ITEM_CODIGO" = TRIM("ITEM_CODIGO")
    WHERE "ITEM_CODIGO" = 'PPMW-100/B/SM '
    AND NOT EXISTS (
        SELECT 1 FROM "BLUEBAY_ESTOQUE" cl
        WHERE cl."MATRIZ" = dt."MATRIZ"
          AND cl."FILIAL" = dt."FILIAL"
          AND cl."LOCAL" = dt."LOCAL"
          AND cl."SUBLOCAL" = dt."SUBLOCAL"
          AND cl."ITEM_CODIGO" = TRIM(dt."ITEM_CODIGO")
    );
    
    -- If merge conflict would happen above (clean row exists), manually merge for those orphans
    -- (Though for Matriz 6, we saw Clean rows existed too. So we need to merge).
    
    -- Merge logic for Orphans
    WITH orphans AS (
        SELECT * FROM "BLUEBAY_ESTOQUE"
        WHERE "ITEM_CODIGO" = 'PPMW-100/B/SM '
    )
    UPDATE "BLUEBAY_ESTOQUE" dest
    SET 
        "FISICO" = dest."FISICO" + src."FISICO",
        "DISPONIVEL" = dest."DISPONIVEL" + src."DISPONIVEL",
        "RESERVADO" = dest."RESERVADO" + src."RESERVADO",
        "ENTROU" = dest."ENTROU" + src."ENTROU"
    FROM orphans src
    WHERE dest."ITEM_CODIGO" = 'PPMW-100/B/SM'
      AND dest."MATRIZ" = src."MATRIZ"
      AND dest."FILIAL" = src."FILIAL"
      AND dest."LOCAL" = src."LOCAL"
      AND dest."SUBLOCAL" = src."SUBLOCAL";
      
    -- Delete the orphans after merge
    DELETE FROM "BLUEBAY_ESTOQUE"
    WHERE "ITEM_CODIGO" = 'PPMW-100/B/SM ';
    
END $$;
