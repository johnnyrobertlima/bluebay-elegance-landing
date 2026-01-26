-- Migration to auto-assign new users to 'Clientes' group and ensure the group exists

-- 1. Ensure 'Clientes' groups exist
INSERT INTO public.bluebay_group (name, description, redirect_after_login, is_active)
VALUES 
('Clientes', 'Grupo padrão para novos usuários cadastrados', '/dashboard', true),
('Administradores', 'Grupo para administradores do sistema', '/admin', true)
ON CONFLICT (name) DO NOTHING;

-- 2. Function to automatically add new user to 'Clientes' group
CREATE OR REPLACE FUNCTION public.handle_new_bluebay_user()
RETURNS trigger AS $$
DECLARE
  client_group_id uuid;
BEGIN
  -- Find the 'Clientes' group ID
  SELECT id INTO client_group_id FROM public.bluebay_group WHERE name = 'Clientes';

  -- If group exists, insert member
  IF client_group_id IS NOT NULL THEN
    INSERT INTO public.bluebay_group_member (group_id, user_id)
    VALUES (client_group_id, NEW.id)
    ON CONFLICT (group_id, user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger on auth.users (runs after every new user signup)
-- Note: We drop it first to ensure we can recreate it cleanly if needed
DROP TRIGGER IF EXISTS on_auth_user_created_bluebay ON auth.users;

CREATE TRIGGER on_auth_user_created_bluebay
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_bluebay_user();
