
-- Migration: Create Table and Utilities for Report Configuration
-- Date: 2026-01-22
-- Purpose: Allow users to configure transaction descriptions and visibility in reports.

-- 1. Create Configuration Table
CREATE TABLE IF NOT EXISTS public."BLUEBAY_REPORT_CONFIG" (
    "transacao" TEXT PRIMARY KEY, -- Matches BLUEBAY_FATURAMENTO.TRANSACAO (casted to text if needed)
    "description" TEXT,
    "report_dashboard_comercial" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Indexes and RLS
CREATE INDEX IF NOT EXISTS "idx_bluebay_report_config_transacao" ON public."BLUEBAY_REPORT_CONFIG" ("transacao");

ALTER TABLE public."BLUEBAY_REPORT_CONFIG" ENABLE ROW LEVEL SECURITY;

-- Allow everything for authenticated users for now (Admin tool)
CREATE POLICY "Allow full access for authenticated users" ON public."BLUEBAY_REPORT_CONFIG"
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Auto-update Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_report_config_updated_at ON public."BLUEBAY_REPORT_CONFIG";
CREATE TRIGGER handle_report_config_updated_at
    BEFORE UPDATE ON public."BLUEBAY_REPORT_CONFIG"
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- 4. RPC: Sync Transactions
-- Fetches all unique transactions from the facts table and creates config entries for them if missing.
CREATE OR REPLACE FUNCTION public.sync_bluebay_report_configs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public."BLUEBAY_REPORT_CONFIG" ("transacao", "description")
    SELECT DISTINCT 
        f."TRANSACAO"::text, 
        'Transação ' || f."TRANSACAO"::text
    FROM public."BLUEBAY_FATURAMENTO" f
    WHERE f."TRANSACAO" IS NOT NULL
    ON CONFLICT ("transacao") DO NOTHING;
END;
$$;

-- 5. RPC: Get Configs
CREATE OR REPLACE FUNCTION public.get_bluebay_report_configs()
RETURNS TABLE (
    transacao TEXT,
    description TEXT,
    report_dashboard_comercial BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT * FROM public."BLUEBAY_REPORT_CONFIG" ORDER BY transacao;
$$;

-- 6. RPC: Update Config
CREATE OR REPLACE FUNCTION public.update_bluebay_report_config(
    p_transacao TEXT,
    p_description TEXT,
    p_report_dashboard_comercial BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public."BLUEBAY_REPORT_CONFIG"
    SET 
        "description" = p_description,
        "report_dashboard_comercial" = p_report_dashboard_comercial,
        "updated_at" = now()
    WHERE "transacao" = p_transacao;
END;
$$;

GRANT ALL ON public."BLUEBAY_REPORT_CONFIG" TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_bluebay_report_configs() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_bluebay_report_configs() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_bluebay_report_config(TEXT, TEXT, BOOLEAN) TO authenticated;
