-- Migration to Sync auth.users with public.profiles and ensure Default Group assignment
-- Run this to fix "Empty User List" in Admin Dashboard

-- 1. Backfill public.profiles from auth.users
INSERT INTO public.profiles (id, full_name, created_at, updated_at)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email), -- Fallback to email if no name
  created_at, 
  now()
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name; -- Update name if exists but changed (optional, safest is DO NOTHING)

-- 2. Ensure all users are members of 'Clientes' group (if they have no group)
DO $$
DECLARE
  client_group_id UUID;
BEGIN
  -- Get 'Clientes' group ID
  SELECT id INTO client_group_id FROM public.bluebay_group WHERE name = 'Clientes';

  -- Proceed only if group exists
  IF client_group_id IS NOT NULL THEN
      INSERT INTO public.bluebay_group_member (group_id, user_id)
      SELECT client_group_id, u.id
      FROM auth.users u
      WHERE NOT EXISTS (
          SELECT 1 FROM public.bluebay_group_member gm WHERE gm.user_id = u.id
      )
      ON CONFLICT (group_id, user_id) DO NOTHING;
  END IF;
END $$;
