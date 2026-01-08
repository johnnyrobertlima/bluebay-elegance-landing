
import { useState, useEffect } from "react";
import { StockItem } from "@/services/bluebay/stockSales/types";
import { EXCLUDED_GROUPS } from "./constants";

export const useStockSalesFiltering = (
  items: StockItem[],
  searchTerm: string,
  groupFilter: string,
  minCadastroYear: string,
  showZeroStock: boolean,
  showLowStock: boolean = false,
  showNewProducts: boolean = false
) => {
  const [filteredItems, setFilteredItems] = useState<StockItem[]>([]);

  // Apply filters only when user explicitly sets them
  useEffect(() => {
    // First, filter out excluded groups
    let result = items.filter(item => 
      !EXCLUDED_GROUPS.includes(item.GRU_DESCRICAO || '')
    );
    
    console.log(`Total após filtrar grupos excluídos: ${result.length}`);
    
    // Apply search filter if the user has entered a search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        (item.ITEM_CODIGO && item.ITEM_CODIGO.toLowerCase().includes(term)) ||
        (item.DESCRICAO && item.DESCRICAO.toLowerCase().includes(term))
      );
      console.log(`Total após filtrar por termo de busca "${searchTerm}": ${result.length}`);
    }
    
    // Apply group filter only if a specific group is selected
    if (groupFilter && groupFilter !== "all") {
      result = result.filter(item => item.GRU_DESCRICAO === groupFilter);
      console.log(`Total após filtrar por grupo "${groupFilter}": ${result.length}`);
    }
    
    // Apply cadastro year filter only if a specific year is selected
    if (minCadastroYear !== "all") {
      const minYear = parseInt(minCadastroYear);
      result = result.filter(item => {
        if (!item.DATACADASTRO) return true; // Show items with no date
        const cadastroDate = new Date(item.DATACADASTRO);
        return cadastroDate.getFullYear() >= minYear;
      });
      console.log(`Total após filtrar por ano de cadastro >= ${minCadastroYear}: ${result.length}`);
    }
    
    // Apply low stock filter if enabled
    if (showLowStock) {
      // Updated to use a threshold of 5 units instead of 100
      result = result.filter(item => (item.DISPONIVEL || 0) < 5);
      console.log(`Total após filtrar por estoque baixo (<5): ${result.length}`);
    }
    
    // Apply new products filter if enabled
    if (showNewProducts) {
      result = result.filter(item => item.PRODUTO_NOVO);
      console.log(`Total após filtrar por produtos novos: ${result.length}`);
    }
    
    // Apply stock filter only if user wants to hide zero stock items
    if (!showZeroStock) {
      result = result.filter(item => (item.DISPONIVEL || 0) > 0);
      console.log(`Total após filtrar itens com estoque disponível zero: ${result.length}`);
    }
    
    setFilteredItems(result);
  }, [items, searchTerm, groupFilter, minCadastroYear, showZeroStock, showLowStock, showNewProducts]);

  return { filteredItems };
};
