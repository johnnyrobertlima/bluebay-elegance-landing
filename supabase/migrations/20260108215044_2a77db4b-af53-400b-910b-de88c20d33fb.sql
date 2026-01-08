-- 1. Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Criar tabela user_roles
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Criar função security definer para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Criar função para verificar se é admin OU user (qualquer role autenticado)
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- 6. Políticas para user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Remover políticas antigas e criar novas baseadas em roles para BLUEBAY_*

-- BLUEBAY_ESTOQUE
DROP POLICY IF EXISTS "Authenticated users can read BLUEBAY_ESTOQUE" ON public."BLUEBAY_ESTOQUE";
CREATE POLICY "Users with role can read BLUEBAY_ESTOQUE"
ON public."BLUEBAY_ESTOQUE" FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid()));

-- BLUEBAY_FATURAMENTO
DROP POLICY IF EXISTS "Authenticated users can read BLUEBAY_FATURAMENTO" ON public."BLUEBAY_FATURAMENTO";
CREATE POLICY "Users with role can read BLUEBAY_FATURAMENTO"
ON public."BLUEBAY_FATURAMENTO" FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid()));

-- BLUEBAY_ITEM
DROP POLICY IF EXISTS "Authenticated users can read BLUEBAY_ITEM" ON public."BLUEBAY_ITEM";
CREATE POLICY "Users with role can read BLUEBAY_ITEM"
ON public."BLUEBAY_ITEM" FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins can manage BLUEBAY_ITEM"
ON public."BLUEBAY_ITEM" FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- BLUEBAY_ITEM_VARIACAO
DROP POLICY IF EXISTS "Authenticated users can read BLUEBAY_ITEM_VARIACAO" ON public."BLUEBAY_ITEM_VARIACAO";
DROP POLICY IF EXISTS "Authenticated users can insert BLUEBAY_ITEM_VARIACAO" ON public."BLUEBAY_ITEM_VARIACAO";
DROP POLICY IF EXISTS "Authenticated users can update BLUEBAY_ITEM_VARIACAO" ON public."BLUEBAY_ITEM_VARIACAO";
DROP POLICY IF EXISTS "Authenticated users can delete BLUEBAY_ITEM_VARIACAO" ON public."BLUEBAY_ITEM_VARIACAO";

CREATE POLICY "Users with role can read BLUEBAY_ITEM_VARIACAO"
ON public."BLUEBAY_ITEM_VARIACAO" FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins can manage BLUEBAY_ITEM_VARIACAO"
ON public."BLUEBAY_ITEM_VARIACAO" FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- BLUEBAY_PEDIDO
DROP POLICY IF EXISTS "Authenticated users can read BLUEBAY_PEDIDO" ON public."BLUEBAY_PEDIDO";
CREATE POLICY "Users with role can read BLUEBAY_PEDIDO"
ON public."BLUEBAY_PEDIDO" FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid()));

-- BLUEBAY_PESSOA
DROP POLICY IF EXISTS "Authenticated users can read BLUEBAY_PESSOA" ON public."BLUEBAY_PESSOA";
CREATE POLICY "Users with role can read BLUEBAY_PESSOA"
ON public."BLUEBAY_PESSOA" FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid()));

-- BLUEBAY_REPRESENTANTE
DROP POLICY IF EXISTS "Authenticated users can read BLUEBAY_REPRESENTANTE" ON public."BLUEBAY_REPRESENTANTE";
CREATE POLICY "Users with role can read BLUEBAY_REPRESENTANTE"
ON public."BLUEBAY_REPRESENTANTE" FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid()));

-- BLUEBAY_TITULO
DROP POLICY IF EXISTS "Authenticated users can read BLUEBAY_TITULO" ON public."BLUEBAY_TITULO";
CREATE POLICY "Users with role can read BLUEBAY_TITULO"
ON public."BLUEBAY_TITULO" FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid()));

-- Tabelas de referência (Cor, Marca, SubCategoria, Tamanho)
DROP POLICY IF EXISTS "Authenticated users can read Cor" ON public."Cor";
DROP POLICY IF EXISTS "Authenticated users can insert Cor" ON public."Cor";
DROP POLICY IF EXISTS "Authenticated users can update Cor" ON public."Cor";
CREATE POLICY "Users with role can read Cor" ON public."Cor" FOR SELECT TO authenticated USING (public.has_any_role(auth.uid()));
CREATE POLICY "Admins can manage Cor" ON public."Cor" FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can read Marca" ON public."Marca";
DROP POLICY IF EXISTS "Authenticated users can insert Marca" ON public."Marca";
DROP POLICY IF EXISTS "Authenticated users can update Marca" ON public."Marca";
CREATE POLICY "Users with role can read Marca" ON public."Marca" FOR SELECT TO authenticated USING (public.has_any_role(auth.uid()));
CREATE POLICY "Admins can manage Marca" ON public."Marca" FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can read SubCategoria" ON public."SubCategoria";
DROP POLICY IF EXISTS "Authenticated users can insert SubCategoria" ON public."SubCategoria";
DROP POLICY IF EXISTS "Authenticated users can update SubCategoria" ON public."SubCategoria";
CREATE POLICY "Users with role can read SubCategoria" ON public."SubCategoria" FOR SELECT TO authenticated USING (public.has_any_role(auth.uid()));
CREATE POLICY "Admins can manage SubCategoria" ON public."SubCategoria" FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can read Tamanho" ON public."Tamanho";
DROP POLICY IF EXISTS "Authenticated users can insert Tamanho" ON public."Tamanho";
DROP POLICY IF EXISTS "Authenticated users can update Tamanho" ON public."Tamanho";
CREATE POLICY "Users with role can read Tamanho" ON public."Tamanho" FOR SELECT TO authenticated USING (public.has_any_role(auth.uid()));
CREATE POLICY "Admins can manage Tamanho" ON public."Tamanho" FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- bluebay_empresa e bluebay_grupo_item
DROP POLICY IF EXISTS "Authenticated users can read bluebay_empresa" ON public.bluebay_empresa;
DROP POLICY IF EXISTS "Authenticated users can manage bluebay_empresa" ON public.bluebay_empresa;
CREATE POLICY "Users with role can read bluebay_empresa" ON public.bluebay_empresa FOR SELECT TO authenticated USING (public.has_any_role(auth.uid()));
CREATE POLICY "Admins can manage bluebay_empresa" ON public.bluebay_empresa FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can read bluebay_grupo_item" ON public.bluebay_grupo_item;
DROP POLICY IF EXISTS "Authenticated users can manage bluebay_grupo_item" ON public.bluebay_grupo_item;
CREATE POLICY "Users with role can read bluebay_grupo_item" ON public.bluebay_grupo_item FOR SELECT TO authenticated USING (public.has_any_role(auth.uid()));
CREATE POLICY "Admins can manage bluebay_grupo_item" ON public.bluebay_grupo_item FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));