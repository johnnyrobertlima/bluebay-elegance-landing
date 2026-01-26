-- Migration: Create Cached Table for Cost Center Analysis (Replaces Materialized View)
-- Date: 2026-01-21
-- Purpose: Efficiently link Invoices to Orders with detailed columns and strict joining.

-- 1. Cleanup previous attempt (Handle both Table and Materialized View possibilities safely)
DO $$ 
BEGIN
  -- Check if it's a Materialized View ('m') and drop
  IF EXISTS (
    SELECT FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname = 'MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO'
    AND c.relkind = 'm'
  ) THEN
    DROP MATERIALIZED VIEW public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO";
  END IF;

  -- Check if it's a Table ('r') and drop
  IF EXISTS (
    SELECT FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname = 'MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO'
    AND c.relkind = 'r'
  ) THEN
    DROP TABLE public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO";
  END IF;
END $$;

-- 2. Create the Standard Table (Acts as a snapshot)
CREATE TABLE public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" (
    id TEXT PRIMARY KEY, -- ID_EF_DOCFISCAL is unique
    -- From BLUEBAY_FATURAMENTO
    matriz INTEGER,
    filial INTEGER,
    ped_numpedido TEXT,
    ped_anobase INTEGER,
    pes_codigo TEXT,
    nota TEXT,
    tipo TEXT,
    transacao TEXT,
    status_faturamento TEXT,
    data_emissao TIMESTAMP,
    valor_nota NUMERIC, -- Kept for utility
    quantidade NUMERIC, -- Kept for utility
    
    -- From BLUEBAY_PEDIDO
    status_pedido TEXT,
    data_pedido TIMESTAMP,
    centrocusto TEXT,
    representante TEXT,
    
    last_refreshed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Add Indexes for Performance
CREATE INDEX "idx_cache_cc_custo" ON public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" ("centrocusto");
CREATE INDEX "idx_cache_cc_data" ON public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" ("data_emissao");
CREATE INDEX "idx_cache_cc_nota" ON public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" ("nota");
CREATE INDEX "idx_cache_cc_repres" ON public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" ("representante");

-- 4. Create Partial Refresh/Populate Function
-- This allows processing data in small chunks (e.g., one month at a time) to avoid Timeouts.
CREATE OR REPLACE FUNCTION public.populate_commercial_costs_range(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- 1. Delete existing records for this period to avoid duplicates (Idempotency)
    DELETE FROM public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO"
    WHERE data_emissao BETWEEN p_start_date AND p_end_date;

    -- 2. Insert new calculated records
    WITH source_data AS (
        SELECT 
            -- Create a composite ID to ensure uniqueness per item
            f."ID_EF_DOCFISCAL"::text || '-' || f."ID_EF_DOCFISCAL_ITEM"::text as id,
            f."MATRIZ" as matriz,
            f."FILIAL" as filial,
            f."PED_NUMPEDIDO" as ped_numpedido,
            f."PED_ANOBASE" as ped_anobase,
            f."PES_CODIGO" as pes_codigo,
            f."NOTA" as nota,
            f."TIPO" as tipo,
            f."TRANSACAO" as transacao, -- Assuming uppercase column name
            f."STATUS" as status_faturamento,
            f."DATA_EMISSAO" as data_emissao,
            f."VALOR_NOTA" as valor_nota,
            f."QUANTIDADE" as quantidade
        FROM "BLUEBAY_FATURAMENTO" f
        WHERE f."DATA_EMISSAO" BETWEEN p_start_date AND p_end_date
    ),
    calculated AS (
        SELECT 
            s.*,
            p."STATUS" as status_pedido,
            p."DATA_PEDIDO" as data_pedido,
            p."CENTROCUSTO" as centrocusto,
            p."REPRESENTANTE" as representante
        FROM source_data s
        LEFT JOIN LATERAL (
            SELECT 
                p_sub."STATUS",
                p_sub."DATA_PEDIDO",
                p_sub."CENTROCUSTO",
                p_sub."REPRESENTANTE"
            FROM "BLUEBAY_PEDIDO" p_sub
            WHERE 
                -- Strict Join Conditions Requested
                p_sub."MATRIZ" = s.matriz
                AND p_sub."FILIAL" = s.filial
                AND p_sub."PED_NUMPEDIDO" = s.ped_numpedido
                AND p_sub."PED_ANOBASE" = s.ped_anobase
            ORDER BY 
                p_sub."DATA_PEDIDO" DESC 
            LIMIT 1
        ) p ON true
    )
    INSERT INTO public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" (
        id, 
        matriz, filial, ped_numpedido, ped_anobase, pes_codigo, 
        nota, tipo, transacao, status_faturamento, data_emissao, 
        valor_nota, quantidade,
        status_pedido, data_pedido, centrocusto, representante,
        last_refreshed_at
    )
    SELECT 
        id, 
        matriz, filial, ped_numpedido, ped_anobase, pes_codigo, 
        nota, tipo, transacao, status_faturamento, data_emissao, 
        valor_nota, quantidade,
        status_pedido, data_pedido, centrocusto, representante,
        now()
    FROM calculated;

    GET DIAGNOSTICS v_count = ROW_COUNT;

    RETURN jsonb_build_object(
        'status', 'success',
        'rows_processed', v_count,
        'period_start', p_start_date,
        'period_end', p_end_date
    );
END;
$$;

-- 5. Helper to refresh "Everything" (Use with caution or for small datasets)
-- But primarily we expect the UI/Script to call the range function loop.
CREATE OR REPLACE FUNCTION public.refresh_mv_commercial_costs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Refreshes only the last 30 days by default to be fast
    PERFORM public.populate_commercial_costs_range(
        (CURRENT_DATE - INTERVAL '30 days')::TIMESTAMP,
        (CURRENT_DATE + INTERVAL '1 day')::TIMESTAMP
    );
END;
$$;

GRANT SELECT ON public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.populate_commercial_costs_range(TIMESTAMP, TIMESTAMP) TO authenticated, service_role;
