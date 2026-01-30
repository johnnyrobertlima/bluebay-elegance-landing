-- Fixed Debug RPC to inspect values (with Type Cast)
CREATE OR REPLACE FUNCTION debug_mv_values(p_rep_id text)
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
        t.valor_nota,
        t.quantidade,
        t.valor_unitario,
        (COALESCE(t.quantidade,0) * COALESCE(t.valor_unitario,0)) as calc_total,
        t.representante::text -- Explicit cast to text
    FROM public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" t
    WHERE t.representante::text = p_rep_id -- Compare as text
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;
