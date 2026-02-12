-- Inspect items again to see the result of the cleanup
-- Run this in the Supabase SQL Editor

-- 1. Check for duplicates (Clean and Dirty)
SELECT 
    'BLUEBAY_ITEM' as source,
    "ITEM_CODIGO",
    LENGTH("ITEM_CODIGO") as len,
    encode("ITEM_CODIGO"::bytea, 'hex') as hex_code,
    "DESCRICAO"
FROM "BLUEBAY_ITEM"
WHERE "ITEM_CODIGO" ILIKE '%PPMW-100/B/SM%';

-- 2. Check stock for these items
SELECT 
    'BLUEBAY_ESTOQUE' as source,
    "ITEM_CODIGO",
    "MATRIZ",
    "FILIAL",
    "FISICO",
    "DISPONIVEL"
FROM "BLUEBAY_ESTOQUE"
WHERE "ITEM_CODIGO" ILIKE '%PPMW-100/B/SM%';
