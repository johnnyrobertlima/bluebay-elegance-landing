-- Migration to enhance bluebay_system_page and seed existing project pages
-- Path: 20260127100000_gestao_paginas_schema.sql

-- 1. Add parent_id to allow hierarchy directly in the pages registry
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bluebay_system_page' AND column_name='parent_id') THEN
        ALTER TABLE public.bluebay_system_page ADD COLUMN parent_id uuid REFERENCES public.bluebay_system_page(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Ensure RLS is enabled and allows access to authenticated users (since we simplified it)
ALTER TABLE public.bluebay_system_page ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read active system pages" ON public.bluebay_system_page;
CREATE POLICY "Authenticated users can read system pages" ON public.bluebay_system_page
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can manage system pages" ON public.bluebay_system_page;
CREATE POLICY "Admins can manage system pages" ON public.bluebay_system_page
    FOR ALL TO authenticated
    USING (true) -- Temporarily allowing all authenticated users to manage, as requested to remove strict controls
    WITH CHECK (true);

-- 3. Seed data for all current pages identified in the project
-- We use a CTE to insert parents first and then subpages

-- Clear existing to avoid duplicates during testing (optional, use with caution)
-- TRUNCATE public.bluebay_system_page CASCADE;

WITH inserted_parents AS (
    INSERT INTO public.bluebay_system_page (name, path, icon, is_active)
    VALUES 
        ('Home', '/client-area/bluebay_adm', 'Home', true),
        ('Cadastros', '/client-area/bluebay_adm/cadastros_placeholder', 'Database', true),
        ('Comercial', '/client-area/bluebay_adm/comercial_placeholder', 'Briefcase', true),
        ('Produtos', '/client-area/bluebay_adm/produtos_placeholder', 'Package', true),
        ('Financeiro', '/client-area/bluebay_adm/financeiro_placeholder', 'DollarSign', true),
        ('Configurações', '/client-area/bluebay_adm/config_placeholder', 'Settings', true)
    ON CONFLICT (path) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon
    RETURNING id, name
)
INSERT INTO public.bluebay_system_page (name, path, icon, parent_id, is_active)
SELECT sub.name, sub.path, sub.icon, p.id, true
FROM (
    VALUES 
        ('Relatórios', '/client-area/bluebay_adm/reports', 'FileText', 'Cadastros'),
        ('Análise de Vendas', '/client-area/bluebay_adm/stock-sales-analytics', 'BarChart', 'Cadastros'),
        ('Clientes', '/client-area/bluebay_adm/clients', 'Users', 'Cadastros'),
        ('Gerenciar Itens', '/client-area/bluebay_adm/item-management', 'Box', 'Cadastros'),
        ('Gerenciar Grupos', '/client-area/bluebay_adm/item-grupo-management', 'Layers', 'Cadastros'),
        
        ('Faturamento', '/client-area/bluebay_adm/financial', 'DollarSign', 'Comercial'),
        ('Pedidos', '/client-area/bluebay_adm/pedidos', 'ShoppingCart', 'Comercial'),
        ('Dashboard Comercial', '/client-area/bluebay_adm/dashboard_comercial', 'PieChart', 'Comercial'),
        ('Solicitações', '/client-area/bluebay_adm/requests', 'ClipboardList', 'Comercial'),
        
        ('Estoque', '/client-area/bluebay_adm/estoque', 'Warehouse', 'Produtos'),
        ('Etiquetas', '/client-area/bluebay_adm/etiquetas', 'Tag', 'Produtos'),
        ('Análise de Compra', '/client-area/bluebay_adm/annalisedecompra', 'Search', 'Produtos'),
        ('Performance de Safra', '/client-area/bluebay_adm/season-performance', 'TrendingUp', 'Produtos'),
        
        ('Gestão Financeira', '/client-area/bluebay_adm/financeiromanager', 'CreditCard', 'Financeiro'),
        ('Gestão de Carteira', '/client-area/bluebay_adm/wallet-management', 'Wallet', 'Financeiro'),
        
        ('Gestão de Relatórios', '/client-area/bluebay_adm/gestao-relatorios', 'Settings2', 'Configurações'),
        ('Gestão de Páginas', '/client-area/bluebay_adm/gestaopaginas', 'Layout', 'Configurações'),
        ('Landing Page', '/client-area/bluebay_adm/landing-page', 'Monitor', 'Configurações'),
        ('Gestão de Usuários', '/admin/users', 'UserCog', 'Configurações'),
        ('Grupos de Usuários', '/admin/user-groups', 'Users2', 'Configurações')
) AS sub(name, path, icon, parent_name)
JOIN inserted_parents p ON p.name = sub.parent_name
ON CONFLICT (path) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon, parent_id = EXCLUDED.parent_id;
