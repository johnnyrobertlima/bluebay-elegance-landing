
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchItems, fetchGroups, fetchEmpresas } from "@/services/bluebay_adm/itemManagementService";

export const useItemsData = (
  searchTerms: string[],
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
  const previousSearchTerms = useRef(searchTerms);
  const previousGroupFilter = useRef(groupFilter);
  const previousEmpresaFilter = useRef(empresaFilter);
  const previousPage = useRef(pagination.currentPage);

  const loadGroups = useCallback(async () => {
    // ... existing implementation remains same ...
    try {
      const fetchedGroups = await fetchGroups();

      const uniqueDescriptionsMap = new Map();

      fetchedGroups.forEach((group: any) => {
        const descriptionKey = group.gru_descricao ? group.gru_descricao.toLowerCase().trim() : '';

        if (descriptionKey) {
          const existingGroup = uniqueDescriptionsMap.get(descriptionKey);

          // If no group exists with this description, or if the current group has company info and the existing one doesn't
          if (!existingGroup || (group.empresa_nome && !existingGroup.empresa_nome)) {
            uniqueDescriptionsMap.set(descriptionKey, group);
          }
        }
      });

      const uniqueGroups = Array.from(uniqueDescriptionsMap.values())
        .sort((a, b) => (a.gru_descricao || '').localeCompare(b.gru_descricao || ''));

      setGroups(uniqueGroups);
      console.log(`Loaded ${uniqueGroups.length} unique groups`);
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

      const { items: fetchedItems, totalCount: count } = await fetchItems(
        pagination.currentPage,
        pagination.pageSize,
        searchTerms,
        groupFilter,
        empresaFilter
      );

      setItems(fetchedItems);
      setTotalCount(count);
      pagination.updateTotalCount(count);

      console.info(`Loaded ${fetchedItems.length} items (page ${pagination.currentPage} of ${Math.ceil(count / pagination.pageSize)})`);
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
  }, [searchTerms, groupFilter, empresaFilter, pagination, toast]);

  const loadAllItems = useCallback(async () => {
    try {
      setIsLoadingAll(true);
      setItems([]);

      toast({
        title: "Carregando todos os itens",
        description: "Esta operação pode levar alguns minutos.",
        variant: "default"
      });

      // Load all items with a large page size
      const { items: allItems, totalCount: count } = await fetchItems(
        1,
        10000,
        searchTerms,
        groupFilter,
        empresaFilter
      );

      setItems(allItems);
      setTotalCount(count);
      pagination.updateTotalCount(count);

      toast({
        title: "Carregamento completo",
        description: `Foram carregados ${allItems.length} itens.`,
        variant: "default"
      });
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
  }, [searchTerms, groupFilter, empresaFilter, pagination, toast]);

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
      JSON.stringify(previousSearchTerms.current) !== JSON.stringify(searchTerms) ||
      previousGroupFilter.current !== groupFilter ||
      previousEmpresaFilter.current !== empresaFilter;

    const pageChanged = previousPage.current !== pagination.currentPage;

    previousSearchTerms.current = searchTerms;
    previousGroupFilter.current = groupFilter;
    previousEmpresaFilter.current = empresaFilter;
    previousPage.current = pagination.currentPage;

    if (filtersChanged) {
      pagination.goToPage(1);
      // We don't return here IF we want to trigger loadItems immediately, but logic below handles page change separately
      // Usually reset page triggers its own effect if dependency is page.
      // But here we are in the same effect.
      // If we go to page 1, and page was 1, we still need to load.
      // If page was 2 and changes to 1, effect runs again? No, setValue is async or batched?
      // Best to direct call loadItems() if page is reset to 1 AND it was already 1.
      // Simplest: Just call loadItems() ALWAYS if filters changed.
      loadItems();
      return;
    }

    if (pageChanged) {
      loadItems();
    }
  }, [searchTerms, groupFilter, empresaFilter, pagination.currentPage, loadItems, pagination]);

  // Small helper to avoid circular dependency in useEffect logic above or improve readability
  // Actually, simplified logic:
  // if (filtersChanged) { pagination.goToPage(1); loadItems(); }
  // else if (pageChanged) { loadItems(); }
  // NOTE: goToPage(1) might not trigger effect if page is ALREADY 1. So explicit loadItems is needed.

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
