-- Migration to fix duplicate rows in Stock Sales Analytics (Updated V4)
-- Date: 2026-02-10
-- Description: Groups items by TRIM(ITEM_CODIGO) and Filters strictly by MATRIZ 10, FILIAL 0, LOCAL 1, SUBLOCAL 0.

-- 1. Update Analytics RPC
CREATE OR REPLACE FUNCTION public.get_stock_sales_analytics(
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_new_product_date DATE DEFAULT (CURRENT_DATE - INTERVAL '60 days'),
  p_search_terms TEXT[] DEFAULT NULL,
  p_group_filter TEXT DEFAULT NULL,
  p_company_filter TEXT DEFAULT NULL,
  p_min_year INTEGER DEFAULT NULL,
  p_show_zero_stock BOOLEAN DEFAULT TRUE,
  p_show_low_stock BOOLEAN DEFAULT FALSE,
  p_show_new_products BOOLEAN DEFAULT FALSE,
  p_sort_column TEXT DEFAULT 'ranking',
  p_sort_direction TEXT DEFAULT 'DESC',
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  item_codigo TEXT,
  descricao TEXT,
  gru_descricao TEXT,
  empresa_nome TEXT,
  datacadastro DATE,
  fisico NUMERIC,
  disponivel NUMERIC,
  reservado NUMERIC,
  entrou NUMERIC,
  limite NUMERIC,
  qtd_vendida NUMERIC,
  valor_total_vendido NUMERIC,
  preco_medio NUMERIC,
  custo_medio NUMERIC,
  data_ultima_venda DATE,
  giro_estoque NUMERIC,
  percentual_estoque_vendido NUMERIC,
  dias_cobertura INTEGER,
  produto_novo BOOLEAN,
  ranking BIGINT,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_days_diff INTEGER;
BEGIN
  v_days_diff := GREATEST(EXTRACT(DAY FROM (COALESCE(p_end_date, CURRENT_DATE) - COALESCE(p_start_date, CURRENT_DATE - INTERVAL '90 days'))), 1);

  RETURN QUERY
  WITH base_items AS (
    SELECT 
      TRIM(i."ITEM_CODIGO") as "ITEM_CODIGO",
      MAX(i."DESCRICAO") as "DESCRICAO",
      MAX(i."GRU_CODIGO") as "GRU_CODIGO",
      MAX(i."GRU_DESCRICAO") as "GRU_DESCRICAO",
      MAX(i."DATACADASTRO") as "DATACADASTRO",
      STRING_AGG(DISTINCT e."nome", ', ') as e_nome
    FROM "BLUEBAY_ITEM" i
    LEFT JOIN "bluebay_grupo_item" gi ON i."GRU_CODIGO" = gi."gru_codigo"
    LEFT JOIN "bluebay_empresa" e ON gi."empresa_id" = e."id"
    WHERE (p_search_terms IS NULL OR cardinality(p_search_terms) = 0
           OR EXISTS (
             SELECT 1 FROM unnest(p_search_terms) s 
             WHERE i."ITEM_CODIGO" ILIKE '%' || s || '%' 
                OR i."DESCRICAO" ILIKE '%' || s || '%'
           ))
      AND (p_group_filter IS NULL OR p_group_filter = 'all' 
           OR i."GRU_CODIGO" = p_group_filter 
           OR i."GRU_DESCRICAO" = p_group_filter)
      AND (p_company_filter IS NULL OR p_company_filter = 'all' 
           OR e."nome" = p_company_filter)
      AND (p_min_year IS NULL OR p_min_year = 0 OR EXTRACT(YEAR FROM i."DATACADASTRO") >= p_min_year)
      AND i."GRU_DESCRICAO" NOT IN ('NAO COMERCIALIZAVEL', 'INATIVO', 'CUSTO', 'MATERIA PRIMA', 'SERVICOS', 'DIVERSOS', 'USO E CONSUMO')
      -- FILTER BY ITEM LOCATION
      AND i."MATRIZ" = 10 AND i."FILIAL" = 0
      -- 3-YEAR EXCLUSION RULE
      AND (
        EXISTS (
            SELECT 1 FROM "BLUEBAY_ESTOQUE" e_st 
            WHERE TRIM(e_st."ITEM_CODIGO") = TRIM(i."ITEM_CODIGO") 
              AND COALESCE(e_st."DISPONIVEL", 0) > 0
              -- Filter Stock check too
              AND e_st."MATRIZ" = 10 AND e_st."FILIAL" = 0 
              AND e_st."LOCAL" = '1' AND e_st."SUBLOCAL" = '0'
        )
        OR 
        EXISTS (SELECT 1 FROM "BLUEBAY_PEDIDO" p WHERE TRIM(p."ITEM_CODIGO") = TRIM(i."ITEM_CODIGO") AND p."DATA_PEDIDO" >= (CURRENT_DATE - INTERVAL '3 years') AND p."STATUS" != '4')
      )
    GROUP BY TRIM(i."ITEM_CODIGO")
  ),
  vendas AS (
    SELECT 
      TRIM(p."ITEM_CODIGO") as item_cod,
      SUM(COALESCE(p."QTDE_PEDIDA", 0))::NUMERIC as qv,
      SUM(COALESCE(p."QTDE_PEDIDA", 0) * COALESCE(p."VALOR_UNITARIO", 0))::NUMERIC as vv,
      AVG(COALESCE(p."VALOR_UNITARIO", 0))::NUMERIC as pm,
      MAX(p."DATA_PEDIDO") as uv
    FROM "BLUEBAY_PEDIDO" p
    -- Optimized join: filter base items first to limit scan if possible, but simplest is to perform aggregation first
    WHERE (p_start_date IS NULL OR p."DATA_PEDIDO" >= p_start_date)
      AND (p_end_date IS NULL OR p."DATA_PEDIDO" <= p_end_date)
      AND p."STATUS" != '4'
    GROUP BY TRIM(p."ITEM_CODIGO")
  ),
  estoque AS (
    SELECT 
      TRIM(e_st."ITEM_CODIGO") as item_cod,
      SUM(COALESCE(e_st."FISICO", 0))::NUMERIC as f,
      SUM(COALESCE(e_st."DISPONIVEL", 0))::NUMERIC as d,
      SUM(COALESCE(e_st."RESERVADO", 0))::NUMERIC as r,
      SUM(COALESCE(e_st."ENTROU", 0))::NUMERIC as e_in,
      SUM(COALESCE(e_st."LIMITE", 0))::NUMERIC as l
    FROM "BLUEBAY_ESTOQUE" e_st
    WHERE e_st."MATRIZ" = 10 AND e_st."FILIAL" = 0 
      AND e_st."LOCAL" = '1' AND e_st."SUBLOCAL" = '0' -- FILTER BY LOCATION
    GROUP BY TRIM(e_st."ITEM_CODIGO")
  ),
  filtered_items AS (
    SELECT 
      bi."ITEM_CODIGO" as item_codigo,
      bi."DESCRICAO" as descricao,
      bi."GRU_DESCRICAO" as gru_descricao,
      bi.e_nome as empresa_nome,
      bi."DATACADASTRO" as datacadastro,
      COALESCE(est.f, 0) as fisico,
      COALESCE(est.d, 0) as disponivel,
      COALESCE(est.r, 0) as reservado,
      COALESCE(est.e_in, 0) as entrou,
      COALESCE(est.l, 0) as limite,
      COALESCE(v.qv, 0) as qtd_vendida,
      COALESCE(v.vv, 0) as valor_total_vendido,
      COALESCE(v.pm, 0) as preco_medio,
      v.uv as data_ultima_venda,
      CASE 
        WHEN COALESCE(est.f, 0) > 0 THEN 
          ROUND(COALESCE(v.qv, 0) / COALESCE(est.f, 1), 4)
        ELSE 0 
      END as giro_estoque,
      CASE 
        WHEN COALESCE(v.qv, 0) + COALESCE(est.f, 0) > 0 THEN
          ROUND((COALESCE(v.qv, 0) / (COALESCE(v.qv, 0) + COALESCE(est.f, 0))) * 100, 2)
        ELSE 0
      END as percentual_estoque_vendido,
      CASE 
        WHEN COALESCE(v.qv, 0) > 0 THEN 
          CEIL(COALESCE(est.d, 0) / (COALESCE(v.qv, 1) / v_days_diff))::INTEGER
        ELSE 999
      END as dias_cobertura,
      CASE 
        WHEN bi."DATACADASTRO" IS NOT NULL AND bi."DATACADASTRO" >= p_new_product_date THEN TRUE
        ELSE FALSE
      END as is_produto_novo
    FROM base_items bi
    LEFT JOIN estoque est ON bi."ITEM_CODIGO" = est.item_cod
    LEFT JOIN vendas v ON bi."ITEM_CODIGO" = v.item_cod
    WHERE (p_show_zero_stock OR COALESCE(est.d, 0) > 0)
      AND (NOT p_show_low_stock OR COALESCE(est.d, 0) < 5)
      AND (NOT p_show_new_products OR (bi."DATACADASTRO" IS NOT NULL AND bi."DATACADASTRO" >= p_new_product_date))
  ),
  ranked_items AS (
    SELECT 
      fi.*,
      ROW_NUMBER() OVER (
        ORDER BY 
        CASE WHEN p_sort_column = 'item_codigo' AND p_sort_direction = 'ASC' THEN fi.item_codigo END ASC,
        CASE WHEN p_sort_column = 'item_codigo' AND p_sort_direction = 'DESC' THEN fi.item_codigo END DESC,
        CASE WHEN p_sort_column = 'descricao' AND p_sort_direction = 'ASC' THEN fi.descricao END ASC,
        CASE WHEN p_sort_column = 'descricao' AND p_sort_direction = 'DESC' THEN fi.descricao END DESC,
        CASE WHEN p_sort_column = 'gru_descricao' AND p_sort_direction = 'ASC' THEN fi.gru_descricao END ASC,
        CASE WHEN p_sort_column = 'gru_descricao' AND p_sort_direction = 'DESC' THEN fi.gru_descricao END DESC,
        CASE WHEN p_sort_column = 'fisico' AND p_sort_direction = 'ASC' THEN fi.fisico END ASC,
        CASE WHEN p_sort_column = 'fisico' AND p_sort_direction = 'DESC' THEN fi.fisico END DESC,
        CASE WHEN p_sort_column = 'disponivel' AND p_sort_direction = 'ASC' THEN fi.disponivel END ASC,
        CASE WHEN p_sort_column = 'disponivel' AND p_sort_direction = 'DESC' THEN fi.disponivel END DESC,
        CASE WHEN p_sort_column = 'qtd_vendida' AND p_sort_direction = 'ASC' THEN fi.qtd_vendida END ASC,
        CASE WHEN p_sort_column = 'qtd_vendida' AND p_sort_direction = 'DESC' THEN fi.qtd_vendida END DESC,
        CASE WHEN p_sort_column = 'valor_total_vendido' AND p_sort_direction = 'ASC' THEN fi.valor_total_vendido END ASC,
        CASE WHEN p_sort_column = 'valor_total_vendido' AND p_sort_direction = 'DESC' THEN fi.valor_total_vendido END DESC,
        CASE WHEN p_sort_column = 'ranking' AND p_sort_direction = 'ASC' THEN fi.valor_total_vendido END ASC,
        CASE WHEN p_sort_column = 'ranking' AND p_sort_direction = 'DESC' THEN fi.valor_total_vendido END DESC
      ) as ranking_num,
      COUNT(*) OVER() as total_count
    FROM filtered_items fi
  )
  SELECT 
    ri.item_codigo::TEXT, 
    ri.descricao::TEXT, 
    ri.gru_descricao::TEXT, 
    ri.empresa_nome::TEXT,
    ri.datacadastro::DATE,
    ri.fisico::NUMERIC,
    ri.disponivel::NUMERIC,
    ri.reservado::NUMERIC,
    ri.entrou::NUMERIC,
    ri.limite::NUMERIC,
    ri.qtd_vendida::NUMERIC,
    ri.valor_total_vendido::NUMERIC,
    ri.preco_medio::NUMERIC,
    0::NUMERIC as custo_medio,
    ri.data_ultima_venda::DATE,
    ri.giro_estoque::NUMERIC,
    ri.percentual_estoque_vendido::NUMERIC,
    ri.dias_cobertura::INTEGER,
    ri.is_produto_novo::BOOLEAN,
    ri.ranking_num::BIGINT,
    ri.total_count::BIGINT
  FROM ranked_items ri
  ORDER BY ri.ranking_num ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- 2. Update Summary RPC
CREATE OR REPLACE FUNCTION public.get_stock_sales_summary(
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_new_product_date DATE DEFAULT (CURRENT_DATE - INTERVAL '60 days'),
  p_search_terms TEXT[] DEFAULT NULL,
  p_group_filter TEXT DEFAULT NULL,
  p_company_filter TEXT DEFAULT NULL,
  p_min_year INTEGER DEFAULT NULL,
  p_show_zero_stock BOOLEAN DEFAULT TRUE,
  p_show_low_stock BOOLEAN DEFAULT FALSE,
  p_show_new_products BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  total_itens BIGINT,
  total_fisico NUMERIC,
  total_disponivel NUMERIC,
  total_reservado NUMERIC,
  total_vendido_qtd NUMERIC,
  total_vendido_valor NUMERIC,
  itens_estoque_baixo BIGINT,
  itens_novos BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH base_items AS (
    SELECT 
      TRIM(i."ITEM_CODIGO") as "ITEM_CODIGO",
      MAX(i."DATACADASTRO") as "DATACADASTRO", 
      MAX(i."GRU_DESCRICAO") as "GRU_DESCRICAO", 
      STRING_AGG(DISTINCT e."nome", ', ') as e_nome
    FROM "BLUEBAY_ITEM" i
    LEFT JOIN "bluebay_grupo_item" gi ON i."GRU_CODIGO" = gi."gru_codigo"
    LEFT JOIN "bluebay_empresa" e ON gi."empresa_id" = e."id"
    WHERE (p_search_terms IS NULL OR cardinality(p_search_terms) = 0
           OR EXISTS (
             SELECT 1 FROM unnest(p_search_terms) s 
             WHERE i."ITEM_CODIGO" ILIKE '%' || s || '%' 
                OR i."DESCRICAO" ILIKE '%' || s || '%'
           ))
      AND (p_group_filter IS NULL OR p_group_filter = 'all' OR i."GRU_DESCRICAO" = p_group_filter)
      AND (p_company_filter IS NULL OR p_company_filter = 'all' OR e."nome" = p_company_filter)
      AND (p_min_year IS NULL OR p_min_year = 0 OR EXTRACT(YEAR FROM i."DATACADASTRO") >= p_min_year)
      AND i."GRU_DESCRICAO" NOT IN ('NAO COMERCIALIZAVEL', 'INATIVO', 'CUSTO', 'MATERIA PRIMA', 'SERVICOS', 'DIVERSOS', 'USO E CONSUMO')
      -- FILTER BY ITEM LOCATION
      AND i."MATRIZ" = 10 AND i."FILIAL" = 0
      -- 3-YEAR EXCLUSION RULE
      AND (
        EXISTS (
            SELECT 1 FROM "BLUEBAY_ESTOQUE" e_st 
            WHERE TRIM(e_st."ITEM_CODIGO") = TRIM(i."ITEM_CODIGO") 
              AND COALESCE(e_st."DISPONIVEL", 0) > 0
              -- Filter Stock check too
              AND e_st."MATRIZ" = 10 AND e_st."FILIAL" = 0 
              AND e_st."LOCAL" = '1' AND e_st."SUBLOCAL" = '0'
        )
        OR 
        EXISTS (SELECT 1 FROM "BLUEBAY_PEDIDO" p WHERE TRIM(p."ITEM_CODIGO") = TRIM(i."ITEM_CODIGO") AND p."DATA_PEDIDO" >= (CURRENT_DATE - INTERVAL '3 years') AND p."STATUS" != '4')
      )
    GROUP BY TRIM(i."ITEM_CODIGO")
  ),
  vendas AS (
    SELECT 
      TRIM(p."ITEM_CODIGO") as item_cod,
      SUM(COALESCE(p."QTDE_PEDIDA", 0))::NUMERIC as qv,
      SUM(COALESCE(p."QTDE_PEDIDA", 0) * COALESCE(p."VALOR_UNITARIO", 0))::NUMERIC as vv
    FROM "BLUEBAY_PEDIDO" p
    INNER JOIN base_items bi ON TRIM(p."ITEM_CODIGO") = bi."ITEM_CODIGO"
    WHERE (p_start_date IS NULL OR p."DATA_PEDIDO" >= p_start_date)
      AND (p_end_date IS NULL OR p."DATA_PEDIDO" <= p_end_date)
      AND p."STATUS" != '4'
    GROUP BY TRIM(p."ITEM_CODIGO")
  ),
  estoque AS (
    SELECT 
      TRIM(e_st."ITEM_CODIGO") as item_cod,
      SUM(COALESCE(e_st."FISICO", 0))::NUMERIC as f,
      SUM(COALESCE(e_st."DISPONIVEL", 0))::NUMERIC as d,
      SUM(COALESCE(e_st."RESERVADO", 0))::NUMERIC as r
    FROM "BLUEBAY_ESTOQUE" e_st
     WHERE e_st."MATRIZ" = 10 AND e_st."FILIAL" = 0 
       AND e_st."LOCAL" = '1' AND e_st."SUBLOCAL" = '0' -- FILTER BY LOCATION
    GROUP BY TRIM(e_st."ITEM_CODIGO")
  ),
  filtered_base AS (
    SELECT 
      bi."ITEM_CODIGO",
      COALESCE(est.f, 0) as fis,
      COALESCE(est.d, 0) as disp,
      COALESCE(est.r, 0) as res,
      COALESCE(v.qv, 0) as qv,
      COALESCE(v.vv, 0) as vv,
      CASE 
        WHEN bi."DATACADASTRO" IS NOT NULL AND bi."DATACADASTRO" >= p_new_product_date THEN TRUE
        ELSE FALSE
      END as is_novo
    FROM base_items bi
    LEFT JOIN estoque est ON bi."ITEM_CODIGO" = est.item_cod
    LEFT JOIN vendas v ON bi."ITEM_CODIGO" = v.item_cod
    WHERE (p_show_zero_stock OR COALESCE(est.d, 0) > 0)
      AND (NOT p_show_low_stock OR COALESCE(est.d, 0) < 5)
      AND (NOT p_show_new_products OR (bi."DATACADASTRO" IS NOT NULL AND bi."DATACADASTRO" >= p_new_product_date))
  )
  SELECT 
    COUNT(*)::BIGINT as total_itens,
    COALESCE(SUM(fis), 0)::NUMERIC as total_fisico,
    COALESCE(SUM(disp), 0)::NUMERIC as total_disponivel,
    COALESCE(SUM(res), 0)::NUMERIC as total_reservado,
    COALESCE(SUM(qv), 0)::NUMERIC as total_vendido_qtd,
    COALESCE(SUM(vv), 0)::NUMERIC as total_vendido_valor,
    COALESCE(SUM(CASE WHEN disp < 5 THEN 1 ELSE 0 END), 0)::BIGINT as itens_estoque_baixo,
    COALESCE(SUM(CASE WHEN is_novo THEN 1 ELSE 0 END), 0)::BIGINT as itens_novos
  FROM filtered_base;
END;
$$;
