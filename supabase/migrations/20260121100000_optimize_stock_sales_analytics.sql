-- Drop functions first to ensure type changes are correctly applied
DROP FUNCTION IF EXISTS public.get_stock_sales_analytics(DATE, DATE, DATE, TEXT, TEXT, INTEGER, BOOLEAN, TEXT, TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS public.get_stock_sales_summary(DATE, DATE, DATE, TEXT, TEXT, INTEGER, BOOLEAN);

-- Update the Stock Sales Analytics RPC with filters and pagination
CREATE OR REPLACE FUNCTION public.get_stock_sales_analytics(
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_new_product_date DATE DEFAULT (CURRENT_DATE - INTERVAL '60 days'),
  p_search_term TEXT DEFAULT NULL,
  p_group_filter TEXT DEFAULT NULL,
  p_min_year INTEGER DEFAULT NULL,
  p_show_zero_stock BOOLEAN DEFAULT TRUE,
  p_sort_column TEXT DEFAULT 'ranking',
  p_sort_direction TEXT DEFAULT 'DESC',
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  item_codigo TEXT,
  descricao TEXT,
  gru_descricao TEXT,
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
  v_days_diff := GREATEST(EXTRACT(DAY FROM (COALESCE(p_end_date, CURRENT_DATE) - COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days'))), 1);

  RETURN QUERY
  WITH base_items AS (
    SELECT 
      i."ITEM_CODIGO",
      i."DESCRICAO",
      i."GRU_DESCRICAO",
      i."DATACADASTRO"
    FROM "BLUEBAY_ITEM" i
    WHERE (p_search_term IS NULL OR p_search_term = '' OR i."ITEM_CODIGO" ILIKE '%' || p_search_term || '%' OR i."DESCRICAO" ILIKE '%' || p_search_term || '%')
      AND (p_group_filter IS NULL OR p_group_filter = 'all' OR i."GRU_DESCRICAO" = p_group_filter)
      AND (p_min_year IS NULL OR p_min_year = 0 OR EXTRACT(YEAR FROM i."DATACADASTRO") >= p_min_year)
      AND i."GRU_DESCRICAO" NOT IN ('NAO COMERCIALIZAVEL', 'INATIVO', 'CUSTO', 'MATERIA PRIMA', 'SERVICOS', 'DIVERSOS', 'USO E CONSUMO')
  ),
  vendas AS (
    SELECT 
      f."ITEM_CODIGO" as item_cod,
      SUM(COALESCE(f."QUANTIDADE", 0))::NUMERIC as qv,
      SUM(COALESCE(f."VALOR_NOTA", 0))::NUMERIC as vv,
      AVG(COALESCE(f."VALOR_UNITARIO", 0))::NUMERIC as pm,
      MAX(f."DATA_EMISSAO") as uv
    FROM "BLUEBAY_FATURAMENTO" f
    INNER JOIN base_items bi ON f."ITEM_CODIGO" = bi."ITEM_CODIGO"
    WHERE (p_start_date IS NULL OR f."DATA_EMISSAO" >= p_start_date)
      AND (p_end_date IS NULL OR f."DATA_EMISSAO" <= p_end_date)
      AND f."STATUS" != '2'
    GROUP BY f."ITEM_CODIGO"
  ),
  estoque AS (
    SELECT 
      e."ITEM_CODIGO" as item_cod,
      SUM(COALESCE(e."FISICO", 0))::NUMERIC as f,
      SUM(COALESCE(e."DISPONIVEL", 0))::NUMERIC as d,
      SUM(COALESCE(e."RESERVADO", 0))::NUMERIC as r,
      SUM(COALESCE(e."ENTROU", 0))::NUMERIC as e,
      SUM(COALESCE(e."LIMITE", 0))::NUMERIC as l
    FROM "BLUEBAY_ESTOQUE" e
    INNER JOIN base_items bi ON e."ITEM_CODIGO" = bi."ITEM_CODIGO"
    GROUP BY e."ITEM_CODIGO"
  ),
  filtered_items AS (
    SELECT 
      bi."ITEM_CODIGO",
      bi."DESCRICAO",
      bi."GRU_DESCRICAO",
      bi."DATACADASTRO",
      COALESCE(est.f, 0) as fis,
      COALESCE(est.d, 0) as disp,
      COALESCE(est.r, 0) as res,
      COALESCE(est.e, 0) as ent,
      COALESCE(est.l, 0) as lim,
      COALESCE(v.qv, 0) as qv,
      COALESCE(v.vv, 0) as vv,
      COALESCE(v.pm, 0) as pm,
      v.uv,
      CASE 
        WHEN COALESCE(est.f, 0) > 0 THEN ROUND((COALESCE(v.qv, 0) / COALESCE(est.f, 1))::NUMERIC, 2)
        ELSE 0::NUMERIC 
      END as giro,
      CASE 
        WHEN COALESCE(v.qv, 0) + COALESCE(est.f, 0) > 0 THEN
          ROUND(((COALESCE(v.qv, 0) / (COALESCE(v.qv, 0) + COALESCE(est.f, 0))) * 100)::NUMERIC, 2)
        ELSE 0::NUMERIC
      END as perc,
      CASE 
        WHEN bi."DATACADASTRO" IS NOT NULL AND bi."DATACADASTRO" >= p_new_product_date THEN TRUE
        ELSE FALSE
      END as is_novo
    FROM base_items bi
    LEFT JOIN estoque est ON bi."ITEM_CODIGO" = est.item_cod
    LEFT JOIN vendas v ON bi."ITEM_CODIGO" = v.item_cod
    WHERE (p_show_zero_stock OR COALESCE(est.d, 0) > 0)
  ),
  ranked_items AS (
    SELECT 
      fi.*,
      CASE 
        WHEN fi.qv > 0 THEN CEIL(fi.fis / (fi.qv / v_days_diff))::INTEGER
        ELSE 999
      END as dc,
      ROW_NUMBER() OVER (ORDER BY 
        CASE WHEN p_sort_column = 'item_codigo' AND p_sort_direction = 'ASC' THEN fi."ITEM_CODIGO" END ASC,
        CASE WHEN p_sort_column = 'item_codigo' AND p_sort_direction = 'DESC' THEN fi."ITEM_CODIGO" END DESC,
        CASE WHEN p_sort_column = 'descricao' AND p_sort_direction = 'ASC' THEN fi."DESCRICAO" END ASC,
        CASE WHEN p_sort_column = 'descricao' AND p_sort_direction = 'DESC' THEN fi."DESCRICAO" END DESC,
        CASE WHEN p_sort_column = 'gru_descricao' AND p_sort_direction = 'ASC' THEN fi."GRU_DESCRICAO" END ASC,
        CASE WHEN p_sort_column = 'gru_descricao' AND p_sort_direction = 'DESC' THEN fi."GRU_DESCRICAO" END DESC,
        CASE WHEN p_sort_column = 'fisico' AND p_sort_direction = 'ASC' THEN fi.fis END ASC,
        CASE WHEN p_sort_column = 'fisico' AND p_sort_direction = 'DESC' THEN fi.fis END DESC,
        CASE WHEN p_sort_column = 'disponivel' AND p_sort_direction = 'ASC' THEN fi.disp END ASC,
        CASE WHEN p_sort_column = 'disponivel' AND p_sort_direction = 'DESC' THEN fi.disp END DESC,
        CASE WHEN p_sort_column = 'qtd_vendida' AND p_sort_direction = 'ASC' THEN fi.qv END ASC,
        CASE WHEN p_sort_column = 'qtd_vendida' AND p_sort_direction = 'DESC' THEN fi.qv END DESC,
        CASE WHEN p_sort_column = 'valor_total_vendido' AND p_sort_direction = 'ASC' THEN fi.vv END ASC,
        CASE WHEN p_sort_column = 'valor_total_vendido' AND p_sort_direction = 'DESC' THEN fi.vv END DESC,
        CASE WHEN p_sort_column = 'ranking' AND p_sort_direction = 'ASC' THEN fi.vv END ASC,
        CASE WHEN p_sort_column = 'ranking' AND p_sort_direction = 'DESC' THEN fi.vv END DESC
      ) as rk,
      COUNT(*) OVER() as full_count
    FROM filtered_items fi
  )
  SELECT 
    ri."ITEM_CODIGO"::TEXT, 
    ri."DESCRICAO"::TEXT, 
    ri."GRU_DESCRICAO"::TEXT, 
    ri."DATACADASTRO"::DATE, 
    ri.fis::NUMERIC, 
    ri.disp::NUMERIC, 
    ri.res::NUMERIC, 
    ri.ent::NUMERIC, 
    ri.lim::NUMERIC, 
    ri.qv::NUMERIC, 
    ri.vv::NUMERIC, 
    ri.pm::NUMERIC, 
    0::NUMERIC, 
    ri.uv::DATE, 
    ri.giro::NUMERIC, 
    ri.perc::NUMERIC, 
    ri.dc::INTEGER, 
    ri.is_novo::BOOLEAN, 
    ri.rk::BIGINT, 
    ri.full_count::BIGINT
  FROM ranked_items ri
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Create Summary RPC for fast dashboard updates
CREATE OR REPLACE FUNCTION public.get_stock_sales_summary(
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_new_product_date DATE DEFAULT (CURRENT_DATE - INTERVAL '60 days'),
  p_search_term TEXT DEFAULT NULL,
  p_group_filter TEXT DEFAULT NULL,
  p_min_year INTEGER DEFAULT NULL,
  p_show_zero_stock BOOLEAN DEFAULT TRUE
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
      i."ITEM_CODIGO", i."DATACADASTRO", i."GRU_DESCRICAO"
    FROM "BLUEBAY_ITEM" i
    WHERE (p_search_term IS NULL OR p_search_term = '' OR i."ITEM_CODIGO" ILIKE '%' || p_search_term || '%' OR i."DESCRICAO" ILIKE '%' || p_search_term || '%')
      AND (p_group_filter IS NULL OR p_group_filter = 'all' OR i."GRU_DESCRICAO" = p_group_filter)
      AND (p_min_year IS NULL OR p_min_year = 0 OR EXTRACT(YEAR FROM i."DATACADASTRO") >= p_min_year)
      AND i."GRU_DESCRICAO" NOT IN ('NAO COMERCIALIZAVEL', 'INATIVO', 'CUSTO', 'MATERIA PRIMA', 'SERVICOS', 'DIVERSOS', 'USO E CONSUMO')
  ),
  vendas AS (
    SELECT 
      f."ITEM_CODIGO" as item_cod,
      SUM(COALESCE(f."QUANTIDADE", 0))::NUMERIC as qv,
      SUM(COALESCE(f."VALOR_NOTA", 0))::NUMERIC as vv
    FROM "BLUEBAY_FATURAMENTO" f
    INNER JOIN base_items bi ON f."ITEM_CODIGO" = bi."ITEM_CODIGO"
    WHERE (p_start_date IS NULL OR f."DATA_EMISSAO" >= p_start_date)
      AND (p_end_date IS NULL OR f."DATA_EMISSAO" <= p_end_date)
      AND f."STATUS" != '2'
    GROUP BY f."ITEM_CODIGO"
  ),
  estoque AS (
    SELECT 
      e."ITEM_CODIGO" as item_cod,
      SUM(COALESCE(e."FISICO", 0))::NUMERIC as f,
      SUM(COALESCE(e."DISPONIVEL", 0))::NUMERIC as d,
      SUM(COALESCE(e."RESERVADO", 0))::NUMERIC as r
    FROM "BLUEBAY_ESTOQUE" e
    INNER JOIN base_items bi ON e."ITEM_CODIGO" = bi."ITEM_CODIGO"
    GROUP BY e."ITEM_CODIGO"
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
  )
  SELECT 
    COUNT(*)::BIGINT as total_itens,
    COALESCE(SUM(fis), 0)::NUMERIC as total_fisico,
    COALESCE(SUM(disp), 0)::NUMERIC as total_disponivel,
    COALESCE(SUM(res), 0)::NUMERIC as total_reservado,
    COALESCE(SUM(qv), 0)::NUMERIC as total_vendido_qtd,
    COALESCE(SUM(vv), 0)::NUMERIC as total_vendido_valor,
    COUNT(*) FILTER (WHERE disp < 5)::BIGINT as itens_estoque_baixo,
    COUNT(*) FILTER (WHERE is_novo)::BIGINT as itens_novos
  FROM filtered_base;
END;
$$;
