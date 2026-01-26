-- Inserir role de admin para o usuário específico
INSERT INTO public.user_roles (user_id, role)
VALUES ('5020cf54-1703-4fbe-9355-40502a5843e7', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
