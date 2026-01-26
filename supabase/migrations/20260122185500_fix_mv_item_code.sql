-- Rescue Script: Refresh/Recreate Materialized View with Item Code
-- Date: 2026-01-22 18:50:00

DROP TABLE IF EXISTS public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO";
DROP MATERIALIZED VIEW IF EXISTS public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO";

CREATE TABLE public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" AS
SELECT
    concat(v."ID_EF_DOCFISCAL", '-', v."ID_EF_DOCFISCAL_ITEM") AS id,
    v."MATRIZ" AS matriz,
    v."FILIAL" AS filial,
    v."ID_EF_DOCFISCAL",
    v."ID_EF_DOCFISCAL_ITEM",
    v."PED_NUMPEDIDO" AS ped_numpedido,
    v."PED_ANOBASE" AS ped_anobase,
    v."PES_CODIGO" AS pes_codigo,
    p."RAZAOSOCIAL" AS razao_social, -- From BLUEBAY_PESSOA
    p."APELIDO" AS apelido,           -- From BLUEBAY_PESSOA
    v."NOTA" AS nota,
    v."TIPO" AS tipo,
    v."TRANSACAO" AS transacao,
    v."STATUS" AS status_faturamento,
    v."DATA_EMISSAO" AS data_emissao,
    v."VALOR_NOTA" AS valor_nota,
    v."QUANTIDADE" AS quantidade,
    v."VALOR_UNITARIO" AS valor_unitario,
    v."JOINED_CENTROCUSTO" AS centrocusto,
    v."DATA_PEDIDO" AS data_pedido,
    v."PED_REPRESENTANTE" AS representante,
    v."ITEM_CODIGO" AS item_codigo,
    now() AS last_refreshed_at
FROM public."V_BLUEBAY_DASHBOARD_COMERCIAL" v
LEFT JOIN public."BLUEBAY_PESSOA" p ON p."PES_CODIGO" = v."PES_CODIGO"::int
WHERE v."DATA_EMISSAO" >= (CURRENT_DATE - INTERVAL '180 days');

CREATE INDEX idx_mv_bluebay_faturamento_data_emissao 
ON public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" (data_emissao);

CREATE INDEX idx_mv_bluebay_faturamento_centrocusto 
ON public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" (centrocusto);

CREATE INDEX idx_mv_bluebay_faturamento_nota 
ON public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" (nota);

-- Grant access
GRANT SELECT ON public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" TO authenticated;
GRANT SELECT ON public."MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO" TO service_role;
