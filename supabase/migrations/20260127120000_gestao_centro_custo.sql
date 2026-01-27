-- Migration to add Cost Center management
-- Path: 20260127120000_gestao_centro_custo.sql

-- 1. Create management table
CREATE TABLE IF NOT EXISTS public.bluebay_cost_center (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.bluebay_cost_center ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Admins can manage cost centers" ON public.bluebay_cost_center
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can read active cost centers" ON public.bluebay_cost_center
    FOR SELECT TO authenticated
    USING (true);

-- 4. Update the Helper View to prioritize managed cost centers
DROP VIEW IF EXISTS public.v_bluebay_unique_cost_centers;
CREATE VIEW public.v_bluebay_unique_cost_centers AS
SELECT name::text as centrocusto, true as is_managed
FROM public.bluebay_cost_center
WHERE is_active = true
UNION
SELECT DISTINCT m.centrocusto::text, false as is_managed
FROM public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" m
WHERE m.centrocusto::text IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.bluebay_cost_center b1 WHERE b1.name = m.centrocusto)
UNION
SELECT DISTINCT p."CENTROCUSTO"::text as centrocusto, false as is_managed
FROM public."BLUEBAY_PEDIDO" p
WHERE p."CENTROCUSTO"::text IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.bluebay_cost_center b2 WHERE b2.name = p."CENTROCUSTO")
ORDER BY centrocusto;

GRANT SELECT ON public.v_bluebay_unique_cost_centers TO authenticated, service_role;

-- 5. Register the new page in the system
INSERT INTO public.bluebay_system_page (name, path, icon, parent_id, is_active)
VALUES (
    'Gestão de Centro de Custo', 
    '/client-area/bluebay_adm/gestaocentrocusto', 
    'Wallet', 
    (SELECT id FROM public.bluebay_system_page WHERE name = 'Configurações' LIMIT 1),
    true
)
ON CONFLICT (path) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;
