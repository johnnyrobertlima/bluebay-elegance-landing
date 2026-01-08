
import { useState, useCallback } from "react";
import { usePagination } from "@/hooks/bluebay/hooks/usePagination";
import { useItemsData } from "./useItemsData";
import { useItemMutations } from "./useItemMutations";
import { useProductData } from "./useProductData";

export const useItemManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [empresaFilter, setEmpresaFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Use pagination hook with smaller page size for better performance
  const pagination = usePagination(50);
  
  // Use item data fetching hook
  const { 
    items, 
    groups, 
    empresas,
    isLoading, 
    isLoadingAll,
    totalCount,
    refreshItems,
    loadAllItems
  } = useItemsData(searchTerm, groupFilter, empresaFilter, pagination);
  
  // Use item mutations hook
  const { 
    handleSaveItem: saveItemMutation, 
    handleDeleteItem: deleteItemMutation 
  } = useItemMutations(refreshItems);

  // Use product data hook
  const {
    subcategories,
    brands,
    isLoading: isProductDataLoading,
    addSubcategory,
    addBrand
  } = useProductData();
  
  // Handler for search with debounce
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);
  
  // Handler for group filter change
  const handleGroupFilterChange = useCallback((value: string) => {
    setGroupFilter(value);
  }, []);
  
  // Handler for empresa filter change
  const handleEmpresaFilterChange = useCallback((value: string) => {
    setEmpresaFilter(value);
  }, []);
  
  // Handler for saving an item (new or update)
  const handleSaveItem = useCallback(async (itemData: any) => {
    const isUpdate = !!selectedItem;
    await saveItemMutation(itemData, isUpdate);
    setSelectedItem(null);
    setIsDialogOpen(false);
  }, [selectedItem, saveItemMutation]);
  
  // Handler for deleting an item
  const handleDeleteItem = useCallback(async (item: any) => {
    await deleteItemMutation(item);
  }, [deleteItemMutation]);

  return {
    items,
    isLoading: isLoading || isProductDataLoading,
    isLoadingAll,
    searchTerm,
    setSearchTerm: handleSearchChange,
    groupFilter,
    setGroupFilter: handleGroupFilterChange,
    empresaFilter,
    setEmpresaFilter: handleEmpresaFilterChange,
    groups,
    empresas,
    selectedItem,
    setSelectedItem,
    isDialogOpen,
    setIsDialogOpen,
    handleSaveItem,
    handleDeleteItem,
    pagination,
    totalCount,
    subcategories,
    brands,
    addSubcategory,
    addBrand,
    loadAllItems,
    refreshItems
  };
};
