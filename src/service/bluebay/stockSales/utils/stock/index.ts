
/**
 * This module is modified to avoid direct queries to BLUEBAY_ESTOQUE and BLUEBAY_ITEM 
 * tables in dashboard components, but still maintains exports for other components
 * that might need the stock functionality.
 */
export { fetchStockItemsPaginated } from './fetchStockItemsPaginated';
export { fetchStockData } from './fetchStockData';

// Note: Dashboard components should not import these functions
