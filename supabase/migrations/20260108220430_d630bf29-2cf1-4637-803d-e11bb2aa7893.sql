-- Criar tabela de notificações para admins
CREATE TABLE public.admin_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL DEFAULT 'info', -- info, warning, error, success
    category text, -- user, order, system, security
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    read_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Habilitar RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas: apenas admins podem ver e gerenciar notificações
CREATE POLICY "Admins can read notifications"
ON public.admin_notifications FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update notifications"
ON public.admin_notifications FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete notifications"
ON public.admin_notifications FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Sistema pode inserir notificações (via trigger ou service role)
CREATE POLICY "System can insert notifications"
ON public.admin_notifications FOR INSERT
WITH CHECK (true);

-- Criar índices para performance
CREATE INDEX idx_admin_notifications_is_read ON public.admin_notifications(is_read);
CREATE INDEX idx_admin_notifications_created_at ON public.admin_notifications(created_at DESC);
CREATE INDEX idx_admin_notifications_type ON public.admin_notifications(type);

-- Função para criar notificação de novo usuário
CREATE OR REPLACE FUNCTION public.notify_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_notifications (title, message, type, category, metadata)
  VALUES (
    'Novo usuário cadastrado',
    'Um novo usuário se cadastrou no sistema: ' || COALESCE(NEW.full_name, 'Sem nome'),
    'info',
    'user',
    jsonb_build_object('user_id', NEW.id, 'full_name', NEW.full_name)
  );
  RETURN NEW;
END;
$$;

-- Trigger para notificar quando novo usuário é criado
CREATE TRIGGER on_new_profile_notify
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_user();

-- Função para criar notificação de novo pedido
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_notifications (title, message, type, category, metadata)
  VALUES (
    'Novo pedido recebido',
    'Pedido #' || LEFT(NEW.id::text, 8) || ' no valor de R$ ' || NEW.total,
    'success',
    'order',
    jsonb_build_object('order_id', NEW.id, 'total', NEW.total, 'user_id', NEW.user_id)
  );
  RETURN NEW;
END;
$$;

-- Trigger para notificar quando novo pedido é criado
CREATE TRIGGER on_new_order_notify
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_order();

-- Função para criar notificação quando role é alterada
CREATE OR REPLACE FUNCTION public.notify_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_name text;
BEGIN
  SELECT full_name INTO v_user_name FROM public.profiles WHERE id = NEW.user_id;
  
  INSERT INTO public.admin_notifications (title, message, type, category, metadata)
  VALUES (
    'Alteração de permissão',
    'Role "' || NEW.role || '" adicionada para ' || COALESCE(v_user_name, 'usuário'),
    'warning',
    'security',
    jsonb_build_object('user_id', NEW.user_id, 'role', NEW.role)
  );
  RETURN NEW;
END;
$$;

-- Trigger para notificar quando role é adicionada
CREATE TRIGGER on_role_added_notify
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_role_change();