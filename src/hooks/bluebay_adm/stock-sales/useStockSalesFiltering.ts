
import { useState, useEffect } from "react";
import { StockItem } from "@/services/bluebay/stockSales/types";
import { EXCLUDED_GROUPS } from "./constants";

export const useStockSalesFiltering = (
  items: StockItem[],
  searchTerms: string[],
  groupFilter: string,
  companyFilter: string,
  minCadastroYear: string,
  showZeroStock: boolean,
  showLowStock: boolean = false,
  showNewProducts: boolean = false
) => {
  const [filteredItems, setFilteredItems] = useState<StockItem[]>([]);

  // Apply filters only when user explicitly sets them
  useEffect(() => {
    let result = items.filter(item =>
      !EXCLUDED_GROUPS.includes(item.GRU_DESCRICAO || '')
    );

    if (searchTerms && searchTerms.length > 0) {
      result = result.filter(item => {
        return searchTerms.some(term => {
          const lowerTerm = term.toLowerCase();
          return (item.ITEM_CODIGO && item.ITEM_CODIGO.toLowerCase().includes(lowerTerm)) ||
            (item.DESCRICAO && item.DESCRICAO.toLowerCase().includes(lowerTerm));
        });
      });
    }

    if (groupFilter && groupFilter !== "all") {
      result = result.filter(item => item.GRU_DESCRICAO === groupFilter);
    }

    if (companyFilter && companyFilter !== "all") {
      result = result.filter(item => item.EMPRESA_NOME === companyFilter);
    }

    if (minCadastroYear !== "all") {
      const minYear = parseInt(minCadastroYear);
      result = result.filter(item => {
        if (!item.DATACADASTRO) return true;
        const cadastroDate = new Date(item.DATACADASTRO);
        return cadastroDate.getFullYear() >= minYear;
      });
    }

    if (showLowStock) {
      result = result.filter(item => (item.DISPONIVEL || 0) < 5);
    }

    if (showNewProducts) {
      result = result.filter(item => item.PRODUTO_NOVO);
    }

    if (!showZeroStock) {
      result = result.filter(item => (item.DISPONIVEL || 0) > 0);
    }

    setFilteredItems(result);
  }, [items, JSON.stringify(searchTerms), groupFilter, companyFilter, minCadastroYear, showZeroStock, showLowStock, showNewProducts]);

  return { filteredItems };
};
