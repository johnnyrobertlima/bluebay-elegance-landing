
import { useState, useEffect } from "react";
import { format, subDays, subMonths } from "date-fns";
import { StockItem, fetchStockSalesAnalytics } from "@/services/bluebay/stockSalesAnalyticsService";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "./useStockSalesFilters";

export const useStockSalesData = (
  searchTerms?: string[],
  groupFilter?: string,
  companyFilter?: string,
  minCadastroYear?: string,
  showZeroStock: boolean = true,
  showLowStock: boolean = false,
  showNewProducts: boolean = false,
  requireSearch: boolean = true // Added
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<StockItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subMonths(new Date(), 24), // Default to 24 months as requested
    endDate: new Date() // Today
  });
  const [usingSampleData, setUsingSampleData] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setUsingSampleData(false);

      if (dateRange.startDate && dateRange.endDate) {
        // Only load data if search terms are present, unless requireSearch is false
        if (requireSearch && (!searchTerms || searchTerms.length === 0)) {
          console.log("Nenhum termo de busca fornecido. Ignorando carregamento automático.");
          setItems([]);
          setIsLoading(false);
          return;
        }

        const startDateFormatted = format(dateRange.startDate, 'yyyy-MM-dd');
        const endDateFormatted = format(dateRange.endDate, 'yyyy-MM-dd');

        console.log(`Carregando relatório de estoque-vendas para o período: ${startDateFormatted} até ${endDateFormatted}`);

        try {
          // Parse min year for RPC
          const minYear = minCadastroYear && minCadastroYear !== 'all' ? parseInt(minCadastroYear) : undefined;

          // Use the enhanced fetching with parameters for server-side filtering
          const data = await fetchStockSalesAnalytics(
            startDateFormatted,
            endDateFormatted,
            searchTerms,
            groupFilter,
            companyFilter,
            minYear,
            showZeroStock,
            showLowStock,
            showNewProducts
          );

          // Update the state with the complete data set
          updateStateWithData(data);
        } catch (fetchError) {
          handleDataFetchError(fetchError);
        }
      } else {
        console.warn("Intervalo de datas incompleto");
        setItems([]);
      }

    } catch (err) {
      handleDataFetchError(err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Updates state based on processed data
   */
  const updateStateWithData = (items: StockItem[]) => {
    // Check if data is using sample data
    setUsingSampleData(items.length > 0 && items[0].hasOwnProperty('isSampleData'));

    // Log the total count of items received
    console.log(`Total de itens recebidos: ${items.length}`);

    // Set items directly without any limits
    setItems(items);

    if (items.length === 0) {
      toast({
        title: "Nenhum dado encontrado",
        description: "Não foram encontrados dados para o período selecionado.",
        variant: "default",
      });
    } else {
      toast({
        title: "Dados carregados",
        description: `Carregados ${items.length} registros de estoque e vendas.`,
        variant: "default",
      });
    }
  };

  /**
   * Handles errors in data fetching
   */
  const handleDataFetchError = (error: unknown) => {
    console.error("Erro ao carregar dados de estoque-vendas:", error);
    setError("Falha ao carregar dados de estoque-vendas");
    setItems([]);

    toast({
      title: "Erro",
      description: "Não foi possível carregar os dados do relatório. Verifique o console para mais detalhes.",
      variant: "destructive",
    });
  };

  /**
   * Updates date range and triggers data reload
   */
  const updateDateRange = (newDateRange: DateRange) => {
    console.log(`Atualizando intervalo de datas`, newDateRange);
    setDateRange(newDateRange);
  };

  /**
   * Manually refreshes data
   */
  const refreshData = () => {
    console.log("Atualizando dados do relatório");
    loadData();
  };

  // Trigger data loading when date range or filters change
  useEffect(() => {
    // Determine if we should debounce (only if search terms exist)
    const debounceTime = searchTerms && searchTerms.length > 0 ? 300 : 0; // Joseph: Corrected typo in function call logic
    const handler = setTimeout(() => {
      loadData();
    }, debounceTime);

    return () => clearTimeout(handler);
  }, [
    dateRange.startDate,
    dateRange.endDate,
    JSON.stringify(searchTerms),
    groupFilter,
    companyFilter,
    minCadastroYear,
    showZeroStock,
    showLowStock,
    showNewProducts
  ]);

  return {
    isLoading,
    items,
    error,
    dateRange,
    updateDateRange,
    refreshData,
    usingSampleData
  };
};
