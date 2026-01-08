
/**
 * Utility functions to assign rankings based on sales data
 */

import { StockItem } from "../types";

/**
 * Assign rankings based on quantity sold
 */
export const assignRankings = (items: StockItem[]): StockItem[] => {
  // Sort items by QTD_VENDIDA in descending order
  const sortedItems = [...items].sort((a, b) => b.QTD_VENDIDA - a.QTD_VENDIDA);
  
  // Assign rankings to items with sales > 0
  let currentRank = 1;
  let lastQtdVendida = -1;
  
  return sortedItems.map(item => {
    // Only assign ranking to items with sales
    if (item.QTD_VENDIDA > 0) {
      // If current item's sales differ from previous, increment rank
      if (item.QTD_VENDIDA !== lastQtdVendida) {
        currentRank = sortedItems.filter(i => i.QTD_VENDIDA > item.QTD_VENDIDA).length + 1;
        lastQtdVendida = item.QTD_VENDIDA;
      }
      
      return {
        ...item,
        RANKING: currentRank
      };
    }
    
    // Items with no sales get null ranking
    return {
      ...item,
      RANKING: null
    };
  });
};
