-- Simulation RPC to debug filtering logic step-by-step
CREATE OR REPLACE FUNCTION debug_rpc_simulation(
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP,
    p_representante TEXT
)
RETURNS JSON AS $$
DECLARE
    v_count_initial INTEGER;
    v_count_after_type INTEGER;
    v_count_after_rep INTEGER;
    v_count_final INTEGER;
    v_sample_dropped_type JSON;
    v_sample_final JSON;
BEGIN
    -- 1. Create Temp Table (Same as RPC)
    CREATE TEMPORARY TABLE tmp_debug_fat AS
    SELECT 
        data_emissao::DATE as data,
        COALESCE(valor_nota, 0) as valor_nota, 
        COALESCE(quantidade, 0) as quantidade,
        COALESCE(valor_unitario, 0) as valor_unitario,
        (COALESCE(quantidade, 0) * COALESCE(valor_unitario, 0)) as valor_total_calc,
        centrocusto,
        representante::text as representante,
        pes_codigo,
        item_codigo,
        nota,
        transacao,
        tipo,
        status_faturamento
    FROM public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO"
    WHERE data_emissao BETWEEN p_start_date AND p_end_date
      AND status_faturamento != '2';

    SELECT count(*) INTO v_count_initial FROM tmp_debug_fat;

    -- 2. Filter by Config (Simulate)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'BLUEBAY_REPORT_TYPE_CONFIG') THEN
        -- Capture dropped rows for debugging
        SELECT json_agg(t) INTO v_sample_dropped_type
        FROM tmp_debug_fat t
        WHERE tipo NOT IN (
            SELECT tipo 
            FROM public."BLUEBAY_REPORT_TYPE_CONFIG" 
            WHERE report_dashboard_comercial = true
        )
        LIMIT 5;

        DELETE FROM tmp_debug_fat
        WHERE tipo NOT IN (
            SELECT tipo 
            FROM public."BLUEBAY_REPORT_TYPE_CONFIG" 
            WHERE report_dashboard_comercial = true
        );
    END IF;

    SELECT count(*) INTO v_count_after_type FROM tmp_debug_fat;

    -- 3. Filter by Representative (Simulate)
    IF p_representante IS NOT NULL AND p_representante != 'none' THEN
        DELETE FROM tmp_debug_fat WHERE representante IS DISTINCT FROM p_representante;
    END IF;

    SELECT count(*) INTO v_count_after_rep FROM tmp_debug_fat;

    -- 4. Final Sample
    SELECT json_agg(t) INTO v_sample_final 
    FROM tmp_debug_fat t 
    LIMIT 5;

    SELECT count(*) INTO v_count_final FROM tmp_debug_fat;

    DROP TABLE tmp_debug_fat;

    RETURN json_build_object(
        'initial_count', v_count_initial,
        'after_type_filter', v_count_after_type,
        'after_rep_filter', v_count_after_rep,
        'final_count', v_count_final,
        'sample_dropped_type', v_sample_dropped_type,
        'sample_final', v_sample_final
    );
END;
$$ LANGUAGE plpgsql;
