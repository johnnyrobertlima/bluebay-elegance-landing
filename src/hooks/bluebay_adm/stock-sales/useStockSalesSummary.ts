
import { StockItem } from "@/services/bluebay/stockSales/types";

export interface SummaryStats {
  totalItems: number;
  totalStock: number;
  totalSales: number;
  totalValue: number;
  lowStockItems: number;
  newProducts: number;
  top10Items: number;
}

export const useStockSalesSummary = (items: StockItem[]) => {
  const getSummaryStats = (): SummaryStats | null => {
    if (items.length === 0) return null;
    
    return {
      totalItems: items.length,
      // This remains FISICO as it's showing the physical stock count
      totalStock: items.reduce((sum, item) => sum + (item.FISICO || 0), 0),
      totalSales: items.reduce((sum, item) => sum + (item.QTD_VENDIDA || 0), 0),
      totalValue: items.reduce((sum, item) => sum + (item.VALOR_TOTAL_VENDIDO || 0), 0),
      // Updated to use a threshold of 5 units for low stock
      lowStockItems: items.filter(item => (item.DISPONIVEL || 0) < 5).length,
      newProducts: items.filter(item => item.PRODUTO_NOVO).length,
      top10Items: items.filter(item => (item.RANKING || 0) <= 10).length
    };
  };

  return { getSummaryStats };
};
