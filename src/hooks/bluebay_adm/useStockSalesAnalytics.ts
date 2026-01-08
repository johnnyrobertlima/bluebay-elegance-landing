
import { useMemo } from "react";
import { useStockSalesData } from "./stock-sales/useStockSalesData";
import { useStockSalesFilters } from "./stock-sales/useStockSalesFilters";
import { useStockSalesSort } from "./stock-sales/useStockSalesSort";
import { useStockSalesFiltering } from "./stock-sales/useStockSalesFiltering";
import { useStockSalesSummary } from "./stock-sales/useStockSalesSummary";

export type { DateRange } from "./stock-sales/useStockSalesFilters";

export const useStockSalesAnalytics = () => {
  // Data loading and management
  const { 
    isLoading, 
    items, 
    error,
    dateRange, 
    updateDateRange,
    refreshData,
    usingSampleData
  } = useStockSalesData();

  // Filters management
  const {
    searchTerm,
    setSearchTerm,
    groupFilter,
    setGroupFilter,
    minCadastroYear,
    setMinCadastroYear,
    showZeroStock,
    setShowZeroStock,
    showLowStock,
    setShowLowStock,
    filterLowStock,
    showNewProducts,
    setShowNewProducts,
    filterNewProducts,
    availableGroups,
    updateAvailableGroups,
    clearFilters
  } = useStockSalesFilters();

  // Sorting functionality
  const { sortConfig, handleSort, sortItems } = useStockSalesSort();

  // Filter the items
  const { filteredItems } = useStockSalesFiltering(
    items,
    searchTerm,
    groupFilter,
    minCadastroYear,
    showZeroStock,
    showLowStock,
    showNewProducts
  );

  // Summary statistics
  const { getSummaryStats } = useStockSalesSummary(filteredItems);

  // Update available groups when items change
  useMemo(() => {
    updateAvailableGroups(items);
  }, [items]);

  // Sort the filtered items
  const sortedFilteredItems = useMemo(() => {
    return sortItems(filteredItems);
  }, [filteredItems, sortConfig]);

  return {
    isLoading,
    items: sortedFilteredItems,
    error,
    dateRange,
    updateDateRange,
    searchTerm,
    setSearchTerm,
    groupFilter,
    setGroupFilter,
    availableGroups,
    sortConfig,
    handleSort,
    refreshData,
    clearFilters,
    getSummaryStats,
    usingSampleData,
    minCadastroYear,
    setMinCadastroYear,
    showZeroStock,
    setShowZeroStock,
    showLowStock,
    setShowLowStock,
    filterLowStock,
    showNewProducts,
    setShowNewProducts,
    filterNewProducts
  };
};
