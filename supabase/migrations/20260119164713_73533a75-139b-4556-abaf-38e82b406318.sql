-- Drop existing policies on app_user_roles that cause infinite recursion
DROP POLICY IF EXISTS "Users can view their own roles" ON public.app_user_roles;
DROP POLICY IF EXISTS "Users can read their own roles" ON public.app_user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.app_user_roles;
DROP POLICY IF EXISTS "Enable read access for users" ON public.app_user_roles;

-- Create a SECURITY DEFINER function to safely check roles without triggering RLS
CREATE OR REPLACE FUNCTION public.has_app_role(_user_id uuid, _role public.app_role)
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

-- Create a SECURITY DEFINER function to get all roles for a user
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS SETOF public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.app_user_roles
  WHERE user_id = _user_id
$$;

-- Create proper RLS policies that don't cause recursion
-- Users can read their own roles (simple auth.uid() check, no subquery to same table)
CREATE POLICY "Users can read own roles"
ON public.app_user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can insert roles (uses the SECURITY DEFINER function)
CREATE POLICY "Admins can insert roles"
ON public.app_user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_app_role(auth.uid(), 'admin'));

-- Admins can delete roles (uses the SECURITY DEFINER function)
CREATE POLICY "Admins can delete roles"
ON public.app_user_roles
FOR DELETE
TO authenticated
USING (public.has_app_role(auth.uid(), 'admin'));