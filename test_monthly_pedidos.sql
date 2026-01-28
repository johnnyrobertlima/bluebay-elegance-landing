-- Test Monthly Pedidos Aggregation
-- Purpose: Verify if orders are correctly summed by month for 2025.

WITH monthly_pedidos AS (
     SELECT 
        TO_CHAR("DATA_PEDIDO", 'YYYY-MM') as mo,
        SUM(COALESCE("QTDE_PEDIDA", 0) * COALESCE("VALOR_UNITARIO", 0)) as total,
        COUNT(*) as count_items
    FROM public."BLUEBAY_PEDIDO"
    WHERE "DATA_PEDIDO" BETWEEN '2025-01-01 00:00:00' AND '2025-12-31 23:59:59'
    GROUP BY 1
)
SELECT * FROM monthly_pedidos ORDER BY mo;
