-- Debug RPC with Date Range (Text parameters for safer calling)
CREATE OR REPLACE FUNCTION debug_mv_range(
    p_rep_id text, 
    p_start text, 
    p_end text
)
RETURNS TABLE (
    id text,
    data_emissao timestamp,
    valor_nota numeric,
    quantidade numeric,
    valor_unitario numeric,
    calc_total numeric,
    representante text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id::text,
        t.data_emissao,
        t.valor_nota::numeric,
        t.quantidade::numeric,
        t.valor_unitario::numeric,
        (COALESCE(t.quantidade::numeric,0) * COALESCE(t.valor_unitario::numeric,0))::numeric as calc_total,
        t.representante::text
    FROM public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" t
    WHERE t.representante::text = p_rep_id
      AND t.data_emissao BETWEEN p_start::timestamp AND p_end::timestamp
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;
