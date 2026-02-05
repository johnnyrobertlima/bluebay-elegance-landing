-- Add PRECO column to BLUEBAY_ITEM table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'BLUEBAY_ITEM' AND column_name = 'PRECO') THEN
        ALTER TABLE "BLUEBAY_ITEM" ADD COLUMN "PRECO" numeric(15, 2);
    END IF;
END $$;
