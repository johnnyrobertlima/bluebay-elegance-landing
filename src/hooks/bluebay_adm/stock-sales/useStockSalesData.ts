
import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { StockItem, fetchStockSalesAnalytics } from "@/services/bluebay/stockSalesAnalyticsService";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "./useStockSalesFilters";

export const useStockSalesData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<StockItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 90), // Get data for a wider date range
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
        const startDateFormatted = format(dateRange.startDate, 'yyyy-MM-dd');
        const endDateFormatted = format(dateRange.endDate, 'yyyy-MM-dd');
        
        console.log(`Carregando relatório de estoque-vendas para o período: ${startDateFormatted} até ${endDateFormatted}`);
        
        try {
          // Use the enhanced fetching with fallbacks and handle all data
          const data = await fetchStockSalesAnalytics(startDateFormatted, endDateFormatted);
          
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

  // Trigger data loading when date range changes
  useEffect(() => {
    loadData();
  }, [dateRange.startDate, dateRange.endDate]);

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
