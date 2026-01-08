
import { useState } from "react";
import { StockItem } from "@/services/bluebay/stockSales/types";

export const useStockSalesSort = () => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StockItem,
    direction: 'asc' | 'desc'
  }>({ key: 'DESCRICAO', direction: 'asc' });

  const handleSort = (key: keyof StockItem) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortItems = (items: StockItem[]): StockItem[] => {
    return [...items].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === undefined || aValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue === undefined || bValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortConfig.direction === 'asc'
          ? (aValue < bValue ? -1 : aValue > bValue ? 1 : 0)
          : (bValue < aValue ? -1 : bValue > aValue ? 1 : 0);
      }
    });
  };

  return { sortConfig, handleSort, sortItems };
};
