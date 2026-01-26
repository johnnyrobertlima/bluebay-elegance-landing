DROP FUNCTION IF EXISTS get_commercial_dashboard_stats(TIMESTAMP, TIMESTAMP, TEXT);

CREATE OR REPLACE FUNCTION get_commercial_dashboard_stats(
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP,
  p_centro_custo TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Criar tabelas temporárias para performance
  CREATE TEMPORARY TABLE IF NOT EXISTS tmp_fat_base AS
  SELECT 
    data_emissao::DATE as data,
    valor_nota,
    quantidade,
    centrocusto,
    nota, -- Adicionado para contagem
    transacao -- Adicionado para filtro de config
  FROM MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO
  WHERE data_emissao BETWEEN p_start_date AND p_end_date
    AND status_faturamento != '2';

  -- Filtrar por configuração de relatório (Tipo)
  -- Removemos da temp table quem não está configurado para aparecer
  DELETE FROM tmp_fat_base
  WHERE transacao::TEXT NOT IN (
    SELECT transacao 
    FROM BLUEBAY_REPORT_TYPE_CONFIG 
    WHERE report_dashboard_comercial = true
  );

  CREATE TEMPORARY TABLE IF NOT EXISTS tmp_ped_base AS
  SELECT 
    DATA_PEDIDO::DATE as data,
    (QTDE_PEDIDA * VALOR_UNITARIO) as valor_total,
    QTDE_PEDIDA as quantidade,
    CENTROCUSTO,
    PED_NUMPEDIDO -- Adicionado para contagem
  FROM BLUEBAY_PEDIDO
  WHERE DATA_PEDIDO BETWEEN p_start_date AND p_end_date
    AND STATUS != '4';

  -- Aplicar filtro de Centro de Custo se fornecido
  IF p_centro_custo IS NOT NULL AND p_centro_custo != 'none' THEN
    DELETE FROM tmp_fat_base WHERE centrocusto != p_centro_custo;
    DELETE FROM tmp_ped_base WHERE CENTROCUSTO != p_centro_custo;
  ELSEIF p_centro_custo = 'Não identificado' THEN
    DELETE FROM tmp_fat_base WHERE centrocusto IS NOT NULL;
    DELETE FROM tmp_ped_base WHERE CENTROCUSTO IS NOT NULL;
  END IF;

  WITH daily_stats AS (
    SELECT
      data,
      SUM(valor_nota) as total_valor,
      SUM(quantidade) as total_qtde,
      COUNT(DISTINCT nota) as doc_count, -- Contagem de Notas Únicas
      'faturamento' as type
    FROM tmp_fat_base
    GROUP BY data
  ),
  daily_pedidos AS (
    SELECT
      data,
      SUM(valor_total) as total_valor,
      SUM(quantidade) as total_qtde,
      COUNT(DISTINCT PED_NUMPEDIDO) as doc_count, -- Contagem de Pedidos Únicos
      'pedido' as type
    FROM tmp_ped_base
    GROUP BY data
  ),
  monthly_stats AS (
    SELECT
      TO_CHAR(data, 'YYYY-MM') as month,
      SUM(valor_nota) as total_valor,
      SUM(quantidade) as total_qtde
    FROM tmp_fat_base
    GROUP BY 1
  ),
  cost_centers AS (
    -- Para KPIs por Centro de Custo, usamos as tabelas base
    -- Unindo Faturamento e Pedidos
    SELECT
      COALESCE(f.centrocusto, p.CENTROCUSTO, 'Não identificado') as centro_custo,
      
      -- Faturamento Metrics
      COALESCE(SUM(f.valor_nota), 0) as total_faturado,
      COALESCE(SUM(f.quantidade), 0) as total_itens,
      CASE 
        WHEN COALESCE(SUM(f.quantidade), 0) > 0 THEN 
          COALESCE(SUM(f.valor_nota), 0) / NULLIF(SUM(f.quantidade), 0)
        ELSE 0 
      END as ticket_medio,
      
      -- Pedido Metrics
      COALESCE(SUM(p.valor_total), 0) as total_pedido,
      COALESCE(SUM(p.quantidade), 0) as itens_pedidos
      
    FROM tmp_fat_base f
    FULL OUTER JOIN tmp_ped_base p ON 1=2 -- Full join sem match real para unir agregados depois? Não, melhor fazer union all das chaves
    WHERE 1=0 -- Hack to skip mixed join, let's do aggregation properly below
    GROUP BY 1 -- Placeholder
  ),
  -- Better Cost Center Aggregation
  cc_metrics AS (
    SELECT 
        COALESCE(centrocusto, 'Não identificado') as cost_center,
        SUM(valor_nota) as fat_val,
        SUM(quantidade) as fat_qtd
    FROM tmp_fat_base
    GROUP BY 1
    
    UNION ALL
    
    SELECT 
        COALESCE(CENTROCUSTO, 'Não identificado') as cost_center,
        0 as fat_val,
        0 as fat_qtd
    FROM tmp_ped_base
    GROUP BY 1
  ),
  cc_ped_metrics AS (
    SELECT 
        COALESCE(CENTROCUSTO, 'Não identificado') as cost_center,
        SUM(valor_total) as ped_val,
        SUM(quantidade) as ped_qtd
    FROM tmp_ped_base
    GROUP BY 1
  ),
  final_cc AS (
     SELECT
        COALESCE(a.cost_center, b.cost_center) as centro_custo,
        SUM(COALESCE(a.fat_val, 0)) as total_faturado,
        SUM(COALESCE(a.fat_qtd, 0)) as total_itens,
        SUM(COALESCE(b.ped_val, 0)) as total_pedido,
        SUM(COALESCE(b.ped_qtd, 0)) as itens_pedidos
     FROM cc_metrics a
     FULL OUTER JOIN cc_ped_metrics b ON a.cost_center = b.cost_center
     GROUP BY 1
  ),
  total_metrics AS (
      SELECT 
        COALESCE(SUM(valor_nota), 0) as fat_val,
        COALESCE(SUM(quantidade), 0) as fat_qtd
      FROM tmp_fat_base
  ),
  total_ped_metrics AS (
      SELECT 
        COALESCE(SUM(valor_total), 0) as ped_val,
        COALESCE(SUM(quantidade), 0) as ped_qtd
      FROM tmp_ped_base
  )
  
  SELECT json_build_object(
    'daily', (
      SELECT json_agg(json_build_object(
        'date', d.data,
        'total', d.total_valor,
        'quantidade', d.total_qtde,
        'doc_count', d.doc_count,
        'type', d.type
      ) ORDER BY d.data DESC)
      FROM (SELECT * FROM daily_stats UNION ALL SELECT * FROM daily_pedidos) d
    ),
    'monthly', (
      SELECT json_agg(json_build_object(
        'month', m.month,
        'total', m.total_valor,
        'quantidade', m.total_qtde
      ) ORDER BY m.month DESC)
      FROM monthly_stats m
    ),
    'totals', (
      SELECT json_build_object(
        'totalFaturado', (SELECT fat_val FROM total_metrics),
        'totalItens', (SELECT fat_qtd FROM total_metrics),
        'mediaValorItem', (
           SELECT CASE 
             WHEN fat_qtd > 0 THEN fat_val / fat_qtd
             ELSE 0 
           END
           FROM total_metrics
        ),
        'totalPedidosValue', (SELECT ped_val FROM total_ped_metrics),
        'totalPedidosQty', (SELECT ped_qtd FROM total_ped_metrics)
      )
    ),
    'costCenters', (
      SELECT json_agg(json_build_object(
        'centroCusto', c.centro_custo,
        'totalFaturado', COALESCE(c.total_faturado, 0),
        'totalItens', COALESCE(c.total_itens, 0),
        'mediaValorItem', CASE 
            WHEN c.total_itens > 0 THEN c.total_faturado / c.total_itens
            ELSE 0 
          END,
        'totalPedido', COALESCE(c.total_pedido, 0),
        'itensPedidos', COALESCE(c.itens_pedidos, 0)
      ) ORDER BY c.total_faturado DESC)
      FROM final_cc c
    )
  ) INTO result;

  -- Limpar tabelas temporárias
  DROP TABLE IF EXISTS tmp_fat_base;
  DROP TABLE IF EXISTS tmp_ped_base;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
