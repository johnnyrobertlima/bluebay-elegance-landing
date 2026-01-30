-- Debug RPC Output for Totals
SELECT get_commercial_dashboard_stats_v3(
  '2026-01-01 00:00:00'::timestamp,
  '2026-01-28 23:59:59'::timestamp,
  NULL, -- Centro Custo
  '19189', -- Representante (from previous context)
  NULL, -- Cliente
  NULL  -- Produto
) -> 'totals';
