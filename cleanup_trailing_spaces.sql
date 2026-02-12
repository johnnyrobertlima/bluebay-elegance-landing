-- SQL script to remove trailing whitespace from item codes
-- This will update the database to standardize all item codes

-- 1. Update BLUEBAY_ITEM
UPDATE "BLUEBAY_ITEM"
SET "ITEM_CODIGO" = TRIM("ITEM_CODIGO")
WHERE "ITEM_CODIGO" LIKE '% ';

-- 2. Update BLUEBAY_ESTOQUE
UPDATE "BLUEBAY_ESTOQUE"
SET "ITEM_CODIGO" = TRIM("ITEM_CODIGO")
WHERE "ITEM_CODIGO" LIKE '% ';

-- 3. Update BLUEBAY_PEDIDO
UPDATE "BLUEBAY_PEDIDO"
SET "ITEM_CODIGO" = TRIM("ITEM_CODIGO")
WHERE "ITEM_CODIGO" LIKE '% ';

-- 4. Update BLUEBAY_PRECO
UPDATE "BLUEBAY_PRECO"
SET "ITEM_CODIGO" = TRIM("ITEM_CODIGO")
WHERE "ITEM_CODIGO" LIKE '% ';

-- 5. Update BLUEBAY_COMPRA_ITEM (if exists)
-- Add other tables that reference ITEM_CODIGO as needed
