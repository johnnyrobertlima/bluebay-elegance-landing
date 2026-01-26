-- Migration to create tables for System Pages, Menu Items, and Group Permissions
-- Prefixed with 'bluebay_' to avoid conflicts in shared database

-- 1. System Pages (Páginas do Sistema)
CREATE TABLE public.bluebay_system_page (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    path text NOT NULL,
    name text NOT NULL,
    description text,
    icon text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Menu Items (Itens de Menu por Grupo)
CREATE TABLE public.bluebay_menu_item (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid REFERENCES public.bluebay_group(id) ON DELETE CASCADE NOT NULL,
    parent_id uuid REFERENCES public.bluebay_menu_item(id) ON DELETE CASCADE, -- Hierarquia (Submenus)
    page_id uuid REFERENCES public.bluebay_system_page(id) ON DELETE SET NULL, -- Link opcional com página do sistema
    label text NOT NULL,
    icon text,
    path text, -- Override de caminho ou link externo
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Group Page Permissions (Permissões de Página por Grupo)
CREATE TABLE public.bluebay_group_page_permission (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid REFERENCES public.bluebay_group(id) ON DELETE CASCADE NOT NULL,
    page_id uuid REFERENCES public.bluebay_system_page(id) ON DELETE CASCADE NOT NULL,
    can_view boolean DEFAULT false,
    can_edit boolean DEFAULT false,
    can_delete boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(group_id, page_id)
);

-- 4. Enable RLS
ALTER TABLE public.bluebay_system_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bluebay_menu_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bluebay_group_page_permission ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (Admins only for management, Authenticated for Reading often needed for dynamic menus)

-- System Pages policies
CREATE POLICY "Admins can manage system pages" ON public.bluebay_system_page
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can read active system pages" ON public.bluebay_system_page
    FOR SELECT TO authenticated
    USING (is_active = true);

-- Menu Items policies
CREATE POLICY "Admins can manage menu items" ON public.bluebay_menu_item
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can read menu items belonging to their groups (Complex logic, simplified for now to Admin + Basic Read if needed, usually filtered by app logic)
-- For now, allow authenticated to read menus (filtering happens in frontend or via function later)
CREATE POLICY "Authenticated users can read menu items" ON public.bluebay_menu_item
    FOR SELECT TO authenticated
    USING (true); 

-- Permissions policies
CREATE POLICY "Admins can manage permissions" ON public.bluebay_group_page_permission
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can read permissions" ON public.bluebay_group_page_permission
    FOR SELECT TO authenticated
    USING (true); -- Needed for permission checks in frontend
