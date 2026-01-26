-- Forçar a inserção da role 'admin' para o ID de usuário específico identificado nos logs
DO $$
DECLARE
    target_user_id uuid := '5020cf54-1703-4fbe-9355-40502a5843e7';
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'Role admin garantida para o usuário %', target_user_id;
END $$;
