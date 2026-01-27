-- Migration to add group-level cost center mapping
-- Path: 20260127110000_group_enhancements.sql

-- 1. Create mapping table
CREATE TABLE IF NOT EXISTS public.bluebay_group_cost_center (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid REFERENCES public.bluebay_group(id) ON DELETE CASCADE NOT NULL,
    centrocusto text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(group_id, centrocusto)
);

-- 2. Enable RLS
ALTER TABLE public.bluebay_group_cost_center ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Admins can manage group cost centers" ON public.bluebay_group_cost_center
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can read group cost centers" ON public.bluebay_group_cost_center
    FOR SELECT TO authenticated
    USING (true);

-- 4. Helper View to list all unique cost centers available in the system
CREATE OR REPLACE VIEW public.V_BLUEBAY_UNIQUE_COST_CENTERS AS
SELECT DISTINCT centrocusto
FROM public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO"
WHERE centrocusto IS NOT NULL
UNION
SELECT DISTINCT "CENTROCUSTO" as centrocusto
FROM public."BLUEBAY_PEDIDO"
WHERE "CENTROCUSTO" IS NOT NULL
ORDER BY centrocusto;

GRANT SELECT ON public.V_BLUEBAY_UNIQUE_COST_CENTERS TO authenticated, service_role;
