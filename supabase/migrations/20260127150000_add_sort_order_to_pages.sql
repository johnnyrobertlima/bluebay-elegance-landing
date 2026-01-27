-- Migration to add sort_order to bluebay_system_page
-- Path: 20260127150000_add_sort_order_to_pages.sql

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bluebay_system_page' AND column_name='sort_order') THEN
        ALTER TABLE public.bluebay_system_page ADD COLUMN sort_order integer DEFAULT 0;
    END IF;
END $$;

-- Update some default sort orders for better organization
UPDATE public.bluebay_system_page SET sort_order = 10 WHERE name = 'Home';
UPDATE public.bluebay_system_page SET sort_order = 20 WHERE name = 'Cadastros';
UPDATE public.bluebay_system_page SET sort_order = 30 WHERE name = 'Comercial';
UPDATE public.bluebay_system_page SET sort_order = 40 WHERE name = 'Produtos';
UPDATE public.bluebay_system_page SET sort_order = 50 WHERE name = 'Financeiro';
UPDATE public.bluebay_system_page SET sort_order = 100 WHERE name = 'Configurações';
