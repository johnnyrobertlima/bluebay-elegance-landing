-- 1. Create Immutable Normalization Function
-- This allows us to index the logic deterministically
CREATE OR REPLACE FUNCTION public.normalize_order_id(p_id text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
    -- Trims whitespace and leading zeros. Returns NULL if input is NULL.
    -- Casts to text inside just in case.
    SELECT TRIM(LEADING '0' FROM TRIM(p_id));
$$;

-- 2. Create Optimized Indexes using the function
CREATE INDEX IF NOT EXISTS "idx_bluebay_faturamento_norm_func" 
ON "BLUEBAY_FATURAMENTO" (public.normalize_order_id("PED_NUMPEDIDO"::text), "PED_ANOBASE");

CREATE INDEX IF NOT EXISTS "idx_bluebay_pedido_norm_func" 
ON "BLUEBAY_PEDIDO" (public.normalize_order_id("PED_NUMPEDIDO"::text), "PED_ANOBASE");

-- 3. Re-create the View using the Function and Optimized Join
CREATE OR REPLACE VIEW public."V_BLUEBAY_DASHBOARD_COMERCIAL" AS
SELECT 
    f.*,
    p."CENTROCUSTO" as "PED_CENTROCUSTO",
    p."DATA_PEDIDO",
    p."REPRESENTANTE" as "PED_REPRESENTANTE",
    p."VALOR_UNITARIO" as "PED_VALOR_UNITARIO",
    p."QTDE_PEDIDA" as "PED_QTDE_PEDIDA",
    p."CENTROCUSTO" as "JOINED_CENTROCUSTO"
FROM "BLUEBAY_FATURAMENTO" f
LEFT JOIN LATERAL (
    SELECT 
        p."CENTROCUSTO", 
        p."DATA_PEDIDO", 
        p."REPRESENTANTE",
        p."VALOR_UNITARIO",
        p."QTDE_PEDIDA",
        p."MPED_NUMORDEM",
        p."PED_ANOBASE"
    FROM "BLUEBAY_PEDIDO" p
    WHERE 
        -- 1. Efficient ID Match using the function (Indexed)
        public.normalize_order_id(p."PED_NUMPEDIDO"::text) = public.normalize_order_id(f."PED_NUMPEDIDO"::text)
        AND 
        -- 2. Efficient Year Match
        (
            -- Most common case: Years match
            p."PED_ANOBASE" = f."PED_ANOBASE"
            OR 
            -- Edge case: Invoice has no year (0), match any valid year (ignoring year check)
            f."PED_ANOBASE" = 0
        )
    ORDER BY 
        -- Priority Rules
        (p."MPED_NUMORDEM" = f."MPED_NUMORDEM" AND p."ITEM_CODIGO" = f."ITEM_CODIGO") DESC, -- Exact item match
        (p."MPED_NUMORDEM" = f."MPED_NUMORDEM") DESC, -- Order match
        p."DATA_PEDIDO" DESC -- Most recent order if multiple candidates (e.g. Year 0 matches multiple)
    LIMIT 1
) p ON true;

-- 4. Re-create RPC (Unchanged logic, just ensuring it points to new view)
CREATE OR REPLACE FUNCTION public.get_commercial_dashboard_stats(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP,
    p_centro_custo TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result JSONB;
    v_daily JSONB;
    v_monthly JSONB;
    v_totals JSONB;
    v_cost_centers JSONB;
BEGIN
    -- 1. Cost Center Indicators (Aggregated first for performance)
    WITH cc_agg AS (
        SELECT 
            COALESCE("JOINED_CENTROCUSTO", 'Não identificado') as name,
            SUM(COALESCE("VALOR_NOTA", 0)) as total_faturado,
            SUM(COALESCE("QUANTIDADE", 0)) as total_itens_faturados,
            COUNT(*) as count
        FROM public."V_BLUEBAY_DASHBOARD_COMERCIAL"
        WHERE "DATA_EMISSAO" BETWEEN p_start_date AND p_end_date
          AND "STATUS" != '2'
        GROUP BY 1
    ),
    -- Pedidos aggregation (independent)
    pd_agg AS (
        SELECT 
            COALESCE("CENTROCUSTO", 'Não identificado') as name,
            SUM(COALESCE("QTDE_PEDIDA", 0) * COALESCE("VALOR_UNITARIO", 0)) as total_pedidos,
            SUM(COALESCE("QTDE_PEDIDA", 0)) as total_itens_pedidos
        FROM public."BLUEBAY_PEDIDO"
        WHERE "DATA_PEDIDO" BETWEEN p_start_date AND p_end_date
        GROUP BY 1
    ),
    combined_cc AS (
        SELECT 
            COALESCE(c.name, p.name) as name,
            COALESCE(c.total_faturado, 0) as total_faturado,
            COALESCE(c.total_itens_faturados, 0) as total_itens_faturados,
            COALESCE(p.total_pedidos, 0) as total_pedidos,
            COALESCE(p.total_itens_pedidos, 0) as total_itens_pedidos
        FROM cc_agg c
        FULL OUTER JOIN pd_agg p ON c.name = p.name
    )
    SELECT JSONB_AGG(JSONB_BUILD_OBJECT(
        'nome', name,
        'totalFaturado', total_faturado,
        'totalItensFaturados', total_itens_faturados,
        'totalPedidos', total_pedidos,
        'totalItensPedidos', total_itens_pedidos,
        'ticketMedioFaturado', CASE WHEN total_itens_faturados > 0 
                                    THEN total_faturado / total_itens_faturados 
                                    ELSE 0 END
    ) ORDER BY name) INTO v_cost_centers
    FROM combined_cc;

    -- 2. Daily Aggregation
    WITH daily_data AS (
        SELECT 
            TO_CHAR("DATA_EMISSAO", 'YYYY-MM-DD') as dt,
            SUM(COALESCE("VALOR_NOTA", 0)) as total
        FROM public."V_BLUEBAY_DASHBOARD_COMERCIAL"
        WHERE "DATA_EMISSAO" BETWEEN p_start_date AND p_end_date
          AND "STATUS" != '2'
          AND (p_centro_custo IS NULL OR 
               (p_centro_custo = 'Não identificado' AND "JOINED_CENTROCUSTO" IS NULL) OR
               ("JOINED_CENTROCUSTO" = p_centro_custo))
        GROUP BY 1
    ),
    daily_pedidos AS (
         SELECT 
            TO_CHAR("DATA_PEDIDO", 'YYYY-MM-DD') as dt,
            SUM(COALESCE("QTDE_PEDIDA", 0) * COALESCE("VALOR_UNITARIO", 0)) as total
        FROM public."BLUEBAY_PEDIDO"
        WHERE "DATA_PEDIDO" BETWEEN p_start_date AND p_end_date
          AND (p_centro_custo IS NULL OR 
               (p_centro_custo = 'Não identificado' AND "CENTROCUSTO" IS NULL) OR
               ("CENTROCUSTO" = p_centro_custo))
        GROUP BY 1
    ),
    all_dates AS (
        SELECT dt FROM daily_data UNION SELECT dt FROM daily_pedidos
    )
    SELECT JSONB_AGG(JSONB_BUILD_OBJECT(
        'date', d.dt,
        'total', COALESCE(dd.total, 0),
        'pedidoTotal', COALESCE(dp.total, 0),
        'formattedDate', TO_CHAR(d.dt::DATE, 'DD/MM/YYYY')
    ) ORDER BY d.dt) INTO v_daily
    FROM all_dates d
    LEFT JOIN daily_data dd ON d.dt = dd.dt
    LEFT JOIN daily_pedidos dp ON d.dt = dp.dt;

    -- 3. Monthly Aggregation
    WITH monthly_data AS (
        SELECT 
            TO_CHAR("DATA_EMISSAO", 'YYYY-MM') as mo,
            SUM(COALESCE("VALOR_NOTA", 0)) as total
        FROM public."V_BLUEBAY_DASHBOARD_COMERCIAL"
        WHERE "DATA_EMISSAO" BETWEEN p_start_date AND p_end_date
          AND "STATUS" != '2'
          AND (p_centro_custo IS NULL OR 
               (p_centro_custo = 'Não identificado' AND "JOINED_CENTROCUSTO" IS NULL) OR
               ("JOINED_CENTROCUSTO" = p_centro_custo))
        GROUP BY 1
    ),
    monthly_pedidos AS (
         SELECT 
            TO_CHAR("DATA_PEDIDO", 'YYYY-MM') as mo,
            SUM(COALESCE("QTDE_PEDIDA", 0) * COALESCE("VALOR_UNITARIO", 0)) as total
        FROM public."BLUEBAY_PEDIDO"
        WHERE "DATA_PEDIDO" BETWEEN p_start_date AND p_end_date
          AND (p_centro_custo IS NULL OR 
               (p_centro_custo = 'Não identificado' AND "CENTROCUSTO" IS NULL) OR
               ("CENTROCUSTO" = p_centro_custo))
        GROUP BY 1
    ),
    all_months AS (
        SELECT mo FROM monthly_data UNION SELECT mo FROM monthly_pedidos
    )
    SELECT JSONB_AGG(JSONB_BUILD_OBJECT(
        'month', m.mo,
        'total', COALESCE(md.total, 0),
        'pedidoTotal', COALESCE(mp.total, 0),
        'formattedMonth', TO_CHAR((m.mo || '-01')::DATE, 'Mon/YYYY')
    ) ORDER BY m.mo) INTO v_monthly
    FROM all_months m
    LEFT JOIN monthly_data md ON m.mo = md.mo
    LEFT JOIN monthly_pedidos mp ON m.mo = mp.mo;

    -- 4. Totals
    SELECT JSONB_BUILD_OBJECT(
        'totalFaturado', SUM(total_faturado),
        'totalItens', SUM(total_itens_faturados),
        'mediaValorItem', CASE WHEN SUM(total_itens_faturados) > 0 
                               THEN SUM(total_faturado) / SUM(total_itens_faturados) 
                               ELSE 0 END
    ) INTO v_totals
    FROM (
        SELECT 
            SUM(COALESCE("VALOR_NOTA", 0)) as total_faturado,
            SUM(COALESCE("QUANTIDADE", 0)) as total_itens_faturados
        FROM public."V_BLUEBAY_DASHBOARD_COMERCIAL"
        WHERE "DATA_EMISSAO" BETWEEN p_start_date AND p_end_date
          AND "STATUS" != '2'
          AND (p_centro_custo IS NULL OR 
               (p_centro_custo = 'Não identificado' AND "JOINED_CENTROCUSTO" IS NULL) OR
               ("JOINED_CENTROCUSTO" = p_centro_custo))
    ) t;

    -- 5. Final Result
    v_result := JSONB_BUILD_OBJECT(
        'daily', COALESCE(v_daily, '[]'::JSONB),
        'monthly', COALESCE(v_monthly, '[]'::JSONB),
        'totals', v_totals,
        'costCenters', COALESCE(v_cost_centers, '[]'::JSONB)
    );

    RETURN v_result;
END;
$$;
