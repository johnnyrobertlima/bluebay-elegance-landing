
import { format, subDays } from "date-fns";
import { StockItem } from "../types";
import { generateSampleStockData } from "../sampleDataGenerator";
import { handleApiError } from "../errorHandlingService";
import { processStockAndSalesData } from "../processors/stockSalesProcessor";
import {
  fetchSalesDataPaginated,
  fetchCostDataFromView
} from "../utils/queryUtils";
import { fetchStockItemsPaginated } from "../utils/stock/fetchStockItemsPaginated"; 
import { fetchItemDetailsBatch } from "../utils/itemQueries";
// Import directly from the file that contains the original function definition
import { fetchStockSalesWithDirectQueries as directQueries } from "../queries/directQueries";

/**
 * Paginated fallback method to fetch stock and sales data
 */
export const fetchStockSalesWithPagination = async (
  startDate: string,
  endDate: string
): Promise<StockItem[]> => {
  try {
    console.log("Executando método alternativo com consultas diretas paginadas");
    
    // Calculate the date 60 days ago for identifying new products
    const sixtyDaysAgo = format(subDays(new Date(), 60), 'yyyy-MM-dd');
    
    // First, get all estoque items (paginated)
    console.log("Etapa 1: Buscando todos os itens de estoque com paginação");
    const allStockItems = await fetchStockItemsPaginated();
    
    if (allStockItems.length === 0) {
      console.warn("Nenhum item de estoque encontrado, retornando dados de exemplo");
      return generateSampleStockData();
    }
    
    console.log(`Carregados ${allStockItems.length} itens de estoque com paginação`);
    
    // Extract item codes to fetch item details
    console.log("Etapa 2: Extraindo códigos de itens para buscar detalhes");
    const itemCodes = [...new Set(allStockItems.map(item => item.ITEM_CODIGO))];
    console.log(`Buscando detalhes para ${itemCodes.length} códigos de itens únicos`);
    
    // Fetch item details in batches
    console.log("Etapa 3: Buscando detalhes dos itens em lotes");
    const allItemDetails = await fetchItemDetailsBatch(itemCodes, 500);
    
    console.log(`Obtidos detalhes para ${allItemDetails.length} itens de ${itemCodes.length} códigos`);
    
    // Create a map for item details lookup
    console.log("Etapa 4: Criando mapa de detalhes dos itens para lookup rápido");
    const itemDetailsMap = new Map();
    allItemDetails.forEach(item => {
      itemDetailsMap.set(item.ITEM_CODIGO, item);
    });
    
    // Fetch sales data for the period in batches
    console.log(`Etapa 5: Buscando dados de vendas para o período ${startDate} a ${endDate}`);
    const allSalesData = await fetchSalesDataPaginated(startDate, endDate);
    console.log(`Obtidos ${allSalesData.length} registros de vendas com paginação`);
    
    // Fetch cost data from the view
    console.log("Etapa 6: Buscando dados de custo da view");
    const costData = await fetchCostDataFromView();
    console.log(`Obtidos ${costData.length} registros de custo da view`);
    
    // Process the data using the utility function
    console.log("Etapa 7: Processando dados para cálculo dos indicadores");
    const combinedData = processStockAndSalesData(
      allStockItems,
      allSalesData,
      costData,
      sixtyDaysAgo,
      startDate,
      endDate
    );
    
    console.log(`Processados ${combinedData.length} itens com estoque e vendas`);
    return combinedData;
  } catch (error) {
    handleApiError("Falha nas consultas diretas paginadas", error);
    return generateSampleStockData(); // Last resort - generate sample data
  }
};

// Export for backward compatibility
export const fetchStockSalesWithDirectQueries = directQueries;
