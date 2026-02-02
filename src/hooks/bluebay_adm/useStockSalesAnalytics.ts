import { useMemo, useEffect } from "react";
import { useStockSalesData } from "./stock-sales/useStockSalesData";
import { useStockSalesFilters } from "./stock-sales/useStockSalesFilters";
import { useStockSalesSort } from "./stock-sales/useStockSalesSort";
import { useStockSalesFiltering } from "./stock-sales/useStockSalesFiltering";
import { useStockSalesSummary } from "./stock-sales/useStockSalesSummary";

export type { DateRange } from "./stock-sales/useStockSalesFilters";

export const useStockSalesAnalytics = (requireSearch: boolean = true) => {
  // 1. Filters management (Must come before data hook to pass parameters)
  const {
    searchTerms,
    setSearchTerms,
    addSearchTerm,
    removeSearchTerm,
    groupFilter,
    setGroupFilter,
    companyFilter,
    setCompanyFilter,
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

  // 2. Data loading and management (Passes filters to DB query)
  const {
    isLoading,
    items,
    error,
    dateRange,
    updateDateRange,
    refreshData,
    usingSampleData
  } = useStockSalesData(
    searchTerms,
    groupFilter,
    companyFilter,
    minCadastroYear,
    showZeroStock,
    showLowStock,
    showNewProducts
  );
  // Sorting functionality
  const { sortConfig, handleSort, sortItems } = useStockSalesSort();

  // Filter the items
  const { filteredItems } = useStockSalesFiltering(
    items,
    searchTerms,
    groupFilter,
    companyFilter,
    minCadastroYear,
    showZeroStock,
    showLowStock,
    showNewProducts
  );

  // Summary statistics
  const { getSummaryStats } = useStockSalesSummary(filteredItems);

  // Update available groups when items change
  useEffect(() => {
    updateAvailableGroups(items);
  }, [items, updateAvailableGroups]);

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
    searchTerms,
    setSearchTerms,
    addSearchTerm,
    removeSearchTerm,
    groupFilter,
    setGroupFilter,
    companyFilter,
    setCompanyFilter,
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
