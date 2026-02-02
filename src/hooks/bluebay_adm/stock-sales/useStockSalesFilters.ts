
import { useState, useEffect } from "react";
import { StockItem } from "@/services/bluebay/stockSales/types";
import { subYears } from "date-fns";

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export const useStockSalesFilters = () => {
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [groupFilter, setGroupFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [minCadastroYear, setMinCadastroYear] = useState("all");
  const [showZeroStock, setShowZeroStock] = useState(true);
  const [showLowStock, setShowLowStock] = useState(false);
  const [showNewProducts, setShowNewProducts] = useState(false);

  // Update available groups based on items
  const updateAvailableGroups = (items: StockItem[]) => {
    const groups = new Set<string>();

    items.forEach(item => {
      if (item.GRU_DESCRICAO) {
        groups.add(item.GRU_DESCRICAO);
      }
    });

    setAvailableGroups(Array.from(groups).sort());
  };

  // Filter by low stock (less than 100 units available)
  const filterLowStock = () => {
    setShowLowStock(true);
    setShowNewProducts(false);
  };

  // Filter by new products
  const filterNewProducts = () => {
    setShowNewProducts(true);
    setShowLowStock(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerms([]);
    setGroupFilter("all");
    setCompanyFilter("all");
    setMinCadastroYear("all");
    setShowZeroStock(true);
    setShowLowStock(false);
    setShowNewProducts(false);
  };

  const addSearchTerm = (term: string) => {
    const trimmedTerm = term.trim();
    if (trimmedTerm && !searchTerms.includes(trimmedTerm) && searchTerms.length < 20) {
      setSearchTerms(prev => [...prev, trimmedTerm]);
    }
  };

  const removeSearchTerm = (term: string) => {
    setSearchTerms(prev => prev.filter(t => t !== term));
  };

  return {
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
  };
};
