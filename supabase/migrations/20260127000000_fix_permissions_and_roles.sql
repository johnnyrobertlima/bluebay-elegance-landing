-- 1. Fix bluebay_group_member visibility
-- Users must be able to see their own group memberships to load permissions in the app
DROP POLICY IF EXISTS "Admins can view bluebay_group_member" ON public.bluebay_group_member;

CREATE POLICY "Users can view own group memberships"
ON public.bluebay_group_member FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 2. Fix bluebay_group visibility
-- Allow all authenticated users to see group names (read-only)
DROP POLICY IF EXISTS "Admins can view bluebay_group" ON public.bluebay_group;

CREATE POLICY "Authenticated users can view groups"
ON public.bluebay_group FOR SELECT
TO authenticated
USING (true);

-- 3. Update has_role and has_any_role to use app_user_roles
-- This ensures that RLS policies on data tables (BLUEBAY_*) work correctly
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.app_user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.app_user_roles
    WHERE user_id = _user_id
  )
$$;
