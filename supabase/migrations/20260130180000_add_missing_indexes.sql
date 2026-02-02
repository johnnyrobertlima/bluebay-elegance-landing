-- Add indices for Stock Sales Analytics performance
-- Date: 2026-01-30

-- 1. Index for item searches (Code and Description)
CREATE INDEX IF NOT EXISTS idx_bluebay_item_search 
ON "BLUEBAY_ITEM" ("ITEM_CODIGO", "DESCRICAO");

-- 2. Index for group filtering
CREATE INDEX IF NOT EXISTS idx_bluebay_item_group 
ON "BLUEBAY_ITEM" ("GRU_DESCRICAO");

-- 3. Index for sales performance (The 3-year rule join)
CREATE INDEX IF NOT EXISTS idx_bluebay_pedido_item_date 
ON "BLUEBAY_PEDIDO" ("ITEM_CODIGO", "DATA_PEDIDO")
WHERE "STATUS" != '4';

-- 4. Index for stock availability
CREATE INDEX IF NOT EXISTS idx_bluebay_estoque_item_disp 
ON "BLUEBAY_ESTOQUE" ("ITEM_CODIGO", "DISPONIVEL");

-- 5. Index for creation date (min cadastro year filter)
CREATE INDEX IF NOT EXISTS idx_bluebay_item_datacadastro 
ON "BLUEBAY_ITEM" ("DATACADASTRO");
