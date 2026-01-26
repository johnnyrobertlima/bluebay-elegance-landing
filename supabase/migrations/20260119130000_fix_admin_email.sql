-- Busca o ID do usuário pelo email e insere a role 'admin'
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- 1. Buscar o ID do usuário pelo email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'admin@bluebay.com.br';

  -- 2. Se o usuário existir, inserir a role
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Role admin adicionada para o usuário % (ID: %)', 'admin@bluebay.com.br', v_user_id;
  ELSE
    RAISE NOTICE 'Usuário com email admin@bluebay.com.br não encontrado.';
  END IF;
END $$;
