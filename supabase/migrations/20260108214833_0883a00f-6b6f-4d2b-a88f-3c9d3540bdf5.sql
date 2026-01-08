-- Habilitar RLS nas tabelas BLUEBAY_*
ALTER TABLE public."BLUEBAY_ESTOQUE" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BLUEBAY_FATURAMENTO" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BLUEBAY_ITEM" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BLUEBAY_ITEM_VARIACAO" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BLUEBAY_PEDIDO" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BLUEBAY_PESSOA" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BLUEBAY_REPRESENTANTE" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BLUEBAY_TITULO" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Cor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Marca" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SubCategoria" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Tamanho" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bluebay_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bluebay_grupo_item ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura para usuários autenticados nas tabelas de dados operacionais
CREATE POLICY "Authenticated users can read BLUEBAY_ESTOQUE"
ON public."BLUEBAY_ESTOQUE" FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read BLUEBAY_FATURAMENTO"
ON public."BLUEBAY_FATURAMENTO" FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read BLUEBAY_ITEM"
ON public."BLUEBAY_ITEM" FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read BLUEBAY_ITEM_VARIACAO"
ON public."BLUEBAY_ITEM_VARIACAO" FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read BLUEBAY_PEDIDO"
ON public."BLUEBAY_PEDIDO" FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read BLUEBAY_PESSOA"
ON public."BLUEBAY_PESSOA" FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read BLUEBAY_REPRESENTANTE"
ON public."BLUEBAY_REPRESENTANTE" FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read BLUEBAY_TITULO"
ON public."BLUEBAY_TITULO" FOR SELECT TO authenticated USING (true);

-- Políticas para tabelas de referência (Cor, Marca, etc.)
CREATE POLICY "Authenticated users can read Cor"
ON public."Cor" FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read Marca"
ON public."Marca" FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read SubCategoria"
ON public."SubCategoria" FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read Tamanho"
ON public."Tamanho" FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read bluebay_empresa"
ON public.bluebay_empresa FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read bluebay_grupo_item"
ON public.bluebay_grupo_item FOR SELECT TO authenticated USING (true);

-- Políticas de escrita para tabelas que precisam de INSERT/UPDATE/DELETE
CREATE POLICY "Authenticated users can insert BLUEBAY_ITEM_VARIACAO"
ON public."BLUEBAY_ITEM_VARIACAO" FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update BLUEBAY_ITEM_VARIACAO"
ON public."BLUEBAY_ITEM_VARIACAO" FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete BLUEBAY_ITEM_VARIACAO"
ON public."BLUEBAY_ITEM_VARIACAO" FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert Cor"
ON public."Cor" FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update Cor"
ON public."Cor" FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert Marca"
ON public."Marca" FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update Marca"
ON public."Marca" FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert SubCategoria"
ON public."SubCategoria" FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update SubCategoria"
ON public."SubCategoria" FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert Tamanho"
ON public."Tamanho" FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update Tamanho"
ON public."Tamanho" FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage bluebay_grupo_item"
ON public.bluebay_grupo_item FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage bluebay_empresa"
ON public.bluebay_empresa FOR ALL TO authenticated USING (true) WITH CHECK (true);