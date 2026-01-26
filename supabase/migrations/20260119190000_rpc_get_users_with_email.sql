-- Secure RPC to fetch users with emails for Admin use only
-- Reads from auth.users (email) and public.profiles (full_name, is_active)

CREATE OR REPLACE FUNCTION public.get_admin_users_list()
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  full_name TEXT,
  is_active BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Allows accessing auth.users
SET search_path = public -- Security best practice
AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    au.id,
    au.email::VARCHAR,
    p.full_name,
    COALESCE(p.is_active, true) as is_active -- Default to true if profile missing or null
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  ORDER BY au.created_at DESC;
END;
$$;
