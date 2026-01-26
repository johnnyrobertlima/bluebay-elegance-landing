-- Seed bluebay_system_page with known application routes
-- This ensures the Admin > System Pages list is not empty for the user

INSERT INTO public.bluebay_system_page (path, name, description, icon, is_active)
VALUES
  -- Public / Client Area
  ('/', 'Home Publica', 'Página inicial do site', 'Home', true),
  ('/dashboard', 'Dashboard Cliente', 'Painel do cliente (Meus Pedidos, etc)', 'LayoutDashboard', true),
  ('/produtos', 'Produtos', 'Catálogo de produtos', 'ShoppingBag', true),
  ('/profile/edit', 'Editar Perfil', 'Configurações de conta do usuário', 'User', true),
  
  -- Admin General
  ('/admin', 'Admin Dashboard', 'Dashboard principal administrativo', 'Shield', true),
  
  -- BlueBay Admin Specific
  ('/client-area/bluebay_adm', 'BlueBay Admin Home', 'Home da área administrativa BlueBay', 'Layout', true),
  ('/client-area/bluebay_adm/dashboard', 'BlueBay Dash Geral', 'Métricas gerais BlueBay', 'BarChart', true),
  ('/client-area/bluebay_adm/dashboard_comercial', 'BlueBay Dash Comercial', 'Métricas comerciais e vendas', 'TrendingUp', true),
  ('/client-area/bluebay_adm/financial', 'Financeiro', 'Gestão financeira e títulos', 'DollarSign', true),
  ('/client-area/bluebay_adm/estoque', 'Estoque', 'Controle de estoque', 'Warehouse', true),
  ('/client-area/bluebay_adm/pedidos', 'Pedidos', 'Gestão de pedidos', 'ShoppingCart', true),
  ('/client-area/bluebay_adm/clients', 'Clientes', 'Gestão de clientes', 'Users', true),
  ('/client-area/bluebay_adm/item-management', 'Gestão de Itens', 'Cadastro e edição de itens', 'Package', true),
  ('/client-area/bluebay_adm/reports', 'Relatórios', 'Relatórios diversos', 'FileText', true)

ON CONFLICT DO NOTHING; -- Avoid duplicates if run multiple times
