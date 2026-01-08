
// Barrel export file for backward compatibility
// Re-exports everything from the new modular structure

export { 
  fetchStockSalesAnalytics,
  fetchSampleStockData,
  type StockItem
} from './stockSales/stockSalesAnalyticsService';

// For backward compatibility, maintain the old function name
export const fetchStockSalesAnalyticsWithDirectQueries = async (
  startDate: string,
  endDate: string
) => {
  const { fetchStockSalesWithDirectQueries } = await import('./stockSales/directQueriesService');
  return fetchStockSalesWithDirectQueries(startDate, endDate);
};
