
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchItems, fetchGroups, fetchAllItems, fetchEmpresas } from "@/services/bluebay_adm/itemManagementService";

export const useItemsData = (
  searchTerm: string,
  groupFilter: string,
  empresaFilter: string,
  pagination: any
) => {
  const [items, setItems] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const { toast } = useToast();
  const isFirstRender = useRef(true);
  const previousSearchTerm = useRef(searchTerm);
  const previousGroupFilter = useRef(groupFilter);
  const previousEmpresaFilter = useRef(empresaFilter);
  const previousPage = useRef(pagination.currentPage);

  const loadGroups = useCallback(async () => {
    try {
      const fetchedGroups = await fetchGroups();
      
      // Create a Map to store unique groups based on description
      // This is a secondary check to ensure we don't show duplicate descriptions in the dropdown
      const uniqueDescriptionsMap = new Map();
      
      fetchedGroups.forEach(group => {
        const descriptionKey = group.gru_descricao ? group.gru_descricao.toLowerCase().trim() : '';
        
        if (descriptionKey && !uniqueDescriptionsMap.has(descriptionKey)) {
          uniqueDescriptionsMap.set(descriptionKey, group);
        }
      });
      
      // Convert the Map back to an array and sort by description
      const uniqueGroups = Array.from(uniqueDescriptionsMap.values())
        .sort((a, b) => (a.gru_descricao || '').localeCompare(b.gru_descricao || ''));
      
      setGroups(uniqueGroups);
      console.log(`Loaded ${uniqueGroups.length} unique groups (filtered from ${fetchedGroups.length} total)`);
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar grupos",
        description: error.message,
      });
    }
  }, [toast]);

  const loadEmpresas = useCallback(async () => {
    try {
      const fetchedEmpresas = await fetchEmpresas();
      setEmpresas(fetchedEmpresas);
    } catch (error: any) {
      console.error("Error fetching empresas:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar empresas",
        description: error.message,
      });
    }
  }, [toast]);

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { items: fetchedItems, count } = await fetchItems(
        searchTerm,
        groupFilter,
        empresaFilter,
        pagination.currentPage,
        pagination.pageSize
      );
      
      setItems(fetchedItems);
      setTotalCount(count);
      pagination.updateTotalCount(count);
      
      console.info(`Loaded ${fetchedItems.length} items (page ${pagination.currentPage} of ${Math.ceil(count/pagination.pageSize)})`);
    } catch (error: any) {
      console.error("Error fetching items:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar itens",
        description: error.message,
      });
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, groupFilter, empresaFilter, pagination, toast]);

  const loadAllItems = useCallback(async () => {
    try {
      setIsLoadingAll(true);
      setItems([]); // Limpar itens atuais para evitar duplicação com os novos resultados
      
      toast({
        title: "Carregando todos os itens",
        description: "Esta operação pode levar alguns minutos para grandes volumes de dados.",
        variant: "default"
      });
      
      console.log("Iniciando carregamento de todos os itens...");
      
      // Usamos await para garantir que todos os itens sejam carregados antes de atualizar o estado
      const allItems = await fetchAllItems(searchTerm, groupFilter, empresaFilter);
      console.log(`Total final de itens carregados: ${allItems.length}`);
      
      // Atualiza o estado com todos os itens carregados
      setItems(allItems);
      setTotalCount(allItems.length);
      pagination.updateTotalCount(allItems.length);
      
      toast({
        title: "Carregamento completo",
        description: `Foram carregados ${allItems.length} itens no total.`,
        variant: "default"
      });
      
      console.info(`Loaded all ${allItems.length} items without pagination`);
    } catch (error: any) {
      console.error("Error fetching all items:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar todos os itens",
        description: error.message,
      });
    } finally {
      setIsLoadingAll(false);
    }
  }, [searchTerm, groupFilter, empresaFilter, pagination, toast]);

  useEffect(() => {
    loadGroups();
    loadEmpresas();
  }, [loadGroups, loadEmpresas]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      loadItems();
      return;
    }
    
    const filtersChanged = 
      previousSearchTerm.current !== searchTerm || 
      previousGroupFilter.current !== groupFilter ||
      previousEmpresaFilter.current !== empresaFilter;
    
    const pageChanged = previousPage.current !== pagination.currentPage;
    
    previousSearchTerm.current = searchTerm;
    previousGroupFilter.current = groupFilter;
    previousEmpresaFilter.current = empresaFilter;
    previousPage.current = pagination.currentPage;
    
    if (filtersChanged) {
      pagination.goToPage(1);
      return;
    }
    
    if (pageChanged) {
      loadItems();
    }
  }, [searchTerm, groupFilter, empresaFilter, pagination.currentPage, loadItems, pagination]);

  return {
    items,
    groups,
    empresas,
    isLoading,
    isLoadingAll,
    totalCount,
    refreshItems: loadItems,
    loadAllItems
  };
};
