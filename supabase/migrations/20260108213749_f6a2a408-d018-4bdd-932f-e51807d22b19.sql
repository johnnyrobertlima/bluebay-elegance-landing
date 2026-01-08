-- View para resumo de faturamento por item
CREATE OR REPLACE VIEW public.bluebay_view_faturamento_resumo AS
SELECT 
  f."ITEM_CODIGO",
  i."DESCRICAO",
  i."GRU_DESCRICAO",
  SUM(f."QUANTIDADE") as total_quantidade,
  SUM(f."VALOR_NOTA") as total_valor,
  AVG(f."VALOR_UNITARIO") as media_valor_unitario,
  COUNT(*) as total_registros,
  MIN(f."DATA_EMISSAO") as primeira_venda,
  MAX(f."DATA_EMISSAO") as ultima_venda
FROM public."BLUEBAY_FATURAMENTO" f
LEFT JOIN public."BLUEBAY_ITEM" i ON f."ITEM_CODIGO" = i."ITEM_CODIGO"
WHERE f."ITEM_CODIGO" IS NOT NULL
GROUP BY f."ITEM_CODIGO", i."DESCRICAO", i."GRU_DESCRICAO";

-- View para representantes
CREATE OR REPLACE VIEW public.vw_representantes AS
SELECT 
  r."PES_CODIGO" as codigo_representante,
  p."RAZAOSOCIAL" as nome_representante,
  p."APELIDO",
  p."EMAIL",
  p."TELEFONE"
FROM public."BLUEBAY_REPRESENTANTE" r
LEFT JOIN public."BLUEBAY_PESSOA" p ON r."PES_CODIGO" = p."PES_CODIGO";

-- Função RPC para análise de estoque e vendas
CREATE OR REPLACE FUNCTION public.get_stock_sales_analytics(
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  "ITEM_CODIGO" TEXT,
  "DESCRICAO" TEXT,
  "GRU_DESCRICAO" TEXT,
  "DATACADASTRO" DATE,
  "FISICO" NUMERIC,
  "DISPONIVEL" NUMERIC,
  "RESERVADO" NUMERIC,
  "ENTROU" NUMERIC,
  "LIMITE" NUMERIC,
  "QTD_VENDIDA" NUMERIC,
  "VALOR_TOTAL_VENDIDO" NUMERIC,
  "PRECO_MEDIO" NUMERIC,
  "CUSTO_MEDIO" NUMERIC,
  "DATA_ULTIMA_VENDA" DATE,
  "GIRO_ESTOQUE" NUMERIC,
  "PERCENTUAL_ESTOQUE_VENDIDO" NUMERIC,
  "DIAS_COBERTURA" INTEGER,
  "PRODUTO_NOVO" BOOLEAN,
  "RANKING" BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH vendas AS (
    SELECT 
      f."ITEM_CODIGO" as item_cod,
      SUM(COALESCE(f."QUANTIDADE", 0)) as qtd_vendida,
      SUM(COALESCE(f."VALOR_NOTA", 0)) as valor_vendido,
      AVG(COALESCE(f."VALOR_UNITARIO", 0)) as preco_medio,
      MAX(f."DATA_EMISSAO") as ultima_venda
    FROM "BLUEBAY_FATURAMENTO" f
    WHERE (p_start_date IS NULL OR f."DATA_EMISSAO" >= p_start_date)
      AND (p_end_date IS NULL OR f."DATA_EMISSAO" <= p_end_date)
      AND f."ITEM_CODIGO" IS NOT NULL
    GROUP BY f."ITEM_CODIGO"
  ),
  estoque AS (
    SELECT 
      e."ITEM_CODIGO" as item_cod,
      SUM(COALESCE(e."FISICO", 0)) as fisico,
      SUM(COALESCE(e."DISPONIVEL", 0)) as disponivel,
      SUM(COALESCE(e."RESERVADO", 0)) as reservado,
      SUM(COALESCE(e."ENTROU", 0)) as entrou,
      SUM(COALESCE(e."LIMITE", 0)) as limite
    FROM "BLUEBAY_ESTOQUE" e
    GROUP BY e."ITEM_CODIGO"
  ),
  items_ranked AS (
    SELECT 
      i."ITEM_CODIGO" as item_codigo,
      i."DESCRICAO" as descricao,
      i."GRU_DESCRICAO" as gru_descricao,
      i."DATACADASTRO" as datacadastro,
      COALESCE(est.fisico, 0) as fisico,
      COALESCE(est.disponivel, 0) as disponivel,
      COALESCE(est.reservado, 0) as reservado,
      COALESCE(est.entrou, 0) as entrou,
      COALESCE(est.limite, 0) as limite,
      COALESCE(v.qtd_vendida, 0) as qtd_vendida,
      COALESCE(v.valor_vendido, 0) as valor_vendido,
      COALESCE(v.preco_medio, 0) as preco_medio,
      v.ultima_venda,
      CASE 
        WHEN COALESCE(est.fisico, 0) > 0 THEN 
          ROUND(COALESCE(v.qtd_vendida, 0) / COALESCE(est.fisico, 1), 2)
        ELSE 0 
      END as giro,
      CASE 
        WHEN COALESCE(v.qtd_vendida, 0) + COALESCE(est.fisico, 0) > 0 THEN
          ROUND((COALESCE(v.qtd_vendida, 0) / (COALESCE(v.qtd_vendida, 0) + COALESCE(est.fisico, 0))) * 100, 2)
        ELSE 0
      END as perc_vendido,
      CASE 
        WHEN i."DATACADASTRO" IS NOT NULL AND i."DATACADASTRO" >= CURRENT_DATE - INTERVAL '90 days' THEN TRUE
        ELSE FALSE
      END as produto_novo,
      ROW_NUMBER() OVER (ORDER BY COALESCE(v.valor_vendido, 0) DESC) as ranking
    FROM "BLUEBAY_ITEM" i
    LEFT JOIN estoque est ON i."ITEM_CODIGO" = est.item_cod
    LEFT JOIN vendas v ON i."ITEM_CODIGO" = v.item_cod
  )
  SELECT 
    ir.item_codigo,
    ir.descricao,
    ir.gru_descricao,
    ir.datacadastro,
    ir.fisico,
    ir.disponivel,
    ir.reservado,
    ir.entrou,
    ir.limite,
    ir.qtd_vendida,
    ir.valor_vendido,
    ir.preco_medio,
    0::NUMERIC as custo_medio,
    ir.ultima_venda,
    ir.giro,
    ir.perc_vendido,
    CASE 
      WHEN ir.qtd_vendida > 0 THEN 
        CEIL(ir.fisico / (ir.qtd_vendida / GREATEST(
          EXTRACT(DAY FROM (COALESCE(p_end_date, CURRENT_DATE) - COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days'))),
          1
        )))::INTEGER
      ELSE 999
    END as dias_cobertura,
    ir.produto_novo,
    ir.ranking
  FROM items_ranked ir
  ORDER BY ir.ranking;
END;
$$;

-- Função RPC para buscar faturamento
CREATE OR REPLACE FUNCTION public.get_bluebay_faturamento(
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  "MATRIZ" INTEGER,
  "FILIAL" INTEGER,
  "ID_EF_DOCFISCAL" INTEGER,
  "ID_EF_DOCFISCAL_ITEM" INTEGER,
  "PED_ANOBASE" INTEGER,
  "MPED_NUMORDEM" INTEGER,
  "PES_CODIGO" INTEGER,
  "TRANSACAO" INTEGER,
  "QUANTIDADE" NUMERIC,
  "VALOR_UNITARIO" NUMERIC,
  "VALOR_DESCONTO" NUMERIC,
  "VALOR_NOTA" NUMERIC,
  "DATA_EMISSAO" DATE,
  "PED_NUMPEDIDO" TEXT,
  "ITEM_CODIGO" TEXT,
  "TIPO" TEXT,
  "NOTA" TEXT,
  "STATUS" TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f."MATRIZ",
    f."FILIAL",
    f."ID_EF_DOCFISCAL",
    f."ID_EF_DOCFISCAL_ITEM",
    f."PED_ANOBASE",
    f."MPED_NUMORDEM",
    f."PES_CODIGO",
    f."TRANSACAO",
    f."QUANTIDADE",
    f."VALOR_UNITARIO",
    f."VALOR_DESCONTO",
    f."VALOR_NOTA",
    f."DATA_EMISSAO",
    f."PED_NUMPEDIDO",
    f."ITEM_CODIGO",
    f."TIPO",
    f."NOTA",
    f."STATUS"
  FROM "BLUEBAY_FATURAMENTO" f
  WHERE (p_start_date IS NULL OR f."DATA_EMISSAO" >= p_start_date)
    AND (p_end_date IS NULL OR f."DATA_EMISSAO" <= p_end_date)
  ORDER BY f."DATA_EMISSAO" DESC;
END;
$$;