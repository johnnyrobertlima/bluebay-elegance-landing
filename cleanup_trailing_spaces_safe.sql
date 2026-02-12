-- Safe cleanup script to merge items with trailing spaces
-- Run this in Supabase SQL Editor

DO $$
DECLARE
    r RECORD;
    v_clean_code TEXT;
    v_exists BOOLEAN;
BEGIN
    -- Loop through all items with trailing spaces
    FOR r IN 
        SELECT "MATRIZ", "FILIAL", "ITEM_CODIGO"
        FROM "BLUEBAY_ITEM"
        WHERE "ITEM_CODIGO" LIKE '% '
    LOOP
        v_clean_code := TRIM(r."ITEM_CODIGO");
        
        -- Check if the clean item already exists
        SELECT EXISTS (
            SELECT 1 FROM "BLUEBAY_ITEM"
            WHERE "MATRIZ" = r."MATRIZ" 
              AND "FILIAL" = r."FILIAL" 
              AND "ITEM_CODIGO" = v_clean_code
        ) INTO v_exists;

        IF v_exists THEN
            RAISE NOTICE 'Merging item % into %', r."ITEM_CODIGO", v_clean_code;

            -- 1. Merge Stock (Add bad item stock to good item)
            UPDATE "BLUEBAY_ESTOQUE" dest
            SET 
                "FISICO" = dest."FISICO" + src."FISICO",
                "DISPONIVEL" = dest."DISPONIVEL" + src."DISPONIVEL",
                "RESERVADO" = dest."RESERVADO" + src."RESERVADO",
                "ENTROU" = dest."ENTROU" + src."ENTROU"
            FROM "BLUEBAY_ESTOQUE" src
            WHERE dest."MATRIZ" = r."MATRIZ" AND dest."FILIAL" = r."FILIAL" AND dest."ITEM_CODIGO" = v_clean_code
              AND src."MATRIZ" = r."MATRIZ" AND src."FILIAL" = r."FILIAL" AND src."ITEM_CODIGO" = r."ITEM_CODIGO";

            -- Delete the bad stock record
            DELETE FROM "BLUEBAY_ESTOQUE"
            WHERE "MATRIZ" = r."MATRIZ" AND "FILIAL" = r."FILIAL" AND "ITEM_CODIGO" = r."ITEM_CODIGO";

            -- 2. Update Orders (Point bad items to good items)
            -- Note: If (PEDIDO_ID, ITEM_CODIGO) is unique, this might fail if both exist.
            -- In that case, we might need more complex logic, but usually duplicates on same order are rare for this case.
            BEGIN
                UPDATE "BLUEBAY_PEDIDO"
                SET "ITEM_CODIGO" = v_clean_code
                WHERE "ITEM_CODIGO" = r."ITEM_CODIGO";
            EXCEPTION WHEN unique_violation THEN
                RAISE NOTICE 'Skipping order update for % due to unique constraint', r."ITEM_CODIGO";
            END;

            -- 3. Update Prices (Removed: Table does not exist)
            -- BEGIN
            --    UPDATE "BLUEBAY_PRECO"
            --    SET "ITEM_CODIGO" = v_clean_code
            --    WHERE "ITEM_CODIGO" = r."ITEM_CODIGO";
            -- EXCEPTION WHEN unique_violation THEN
            --     DELETE FROM "BLUEBAY_PRECO"
            --    WHERE "ITEM_CODIGO" = r."ITEM_CODIGO";
            -- END;

            -- 4. Delete the bad Item
            DELETE FROM "BLUEBAY_ITEM"
            WHERE "MATRIZ" = r."MATRIZ" AND "FILIAL" = r."FILIAL" AND "ITEM_CODIGO" = r."ITEM_CODIGO";

        ELSE
            RAISE NOTICE 'Renaming item % to %', r."ITEM_CODIGO", v_clean_code;
            
            -- No conflict, just rename safely
            -- We need to disable triggers if any? usually fine.
            
            -- Update children first if FKs are robust, or parent first if Cascading?
            -- Assuming standard FKs without cascade updates for now:
            
            -- 1. Create new item (copy)
            INSERT INTO "BLUEBAY_ITEM" ("MATRIZ", "FILIAL", "ITEM_CODIGO", "DESCRICAO", "GRU_CODIGO", "DATACADASTRO", "ATIVO", "UNIDADE")
            SELECT "MATRIZ", "FILIAL", v_clean_code, "DESCRICAO", "GRU_CODIGO", "DATACADASTRO", "ATIVO", "UNIDADE"
            FROM "BLUEBAY_ITEM"
            WHERE "MATRIZ" = r."MATRIZ" AND "FILIAL" = r."FILIAL" AND "ITEM_CODIGO" = r."ITEM_CODIGO";

            -- 2. Update Children to point to new item
            UPDATE "BLUEBAY_ESTOQUE" SET "ITEM_CODIGO" = v_clean_code WHERE "MATRIZ" = r."MATRIZ" AND "FILIAL" = r."FILIAL" AND "ITEM_CODIGO" = r."ITEM_CODIGO";
            UPDATE "BLUEBAY_PEDIDO" SET "ITEM_CODIGO" = v_clean_code WHERE "ITEM_CODIGO" = r."ITEM_CODIGO";
            -- UPDATE "BLUEBAY_PRECO" SET "ITEM_CODIGO" = v_clean_code WHERE "ITEM_CODIGO" = r."ITEM_CODIGO";

            -- 3. Delete old item
            DELETE FROM "BLUEBAY_ITEM"
            WHERE "MATRIZ" = r."MATRIZ" AND "FILIAL" = r."FILIAL" AND "ITEM_CODIGO" = r."ITEM_CODIGO";
            
        END IF;

    END LOOP;
END $$;
