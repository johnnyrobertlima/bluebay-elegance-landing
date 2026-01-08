
/**
 * Main processor for stock and sales analytics data
 */
import { StockItem } from "../types";
import { groupSalesByItem } from "../utils/salesDataProcessor";
import { processCostData, getItemCost } from "../utils/costDataProcessor";
import { createItemDetailsMap, mapStockItems } from "../utils/stockItemMapper";
import { assignRankings } from "../utils/rankingUtils";
import { logDebugInfo } from "../utils/debugLogger";
import { calculateDateDiffInDays } from "../utils/dateUtils";

/**
 * Process stock and sales data from direct queries
 */
export const processStockAndSalesData = (
  stockItems: any[], 
  salesData: any[],
  costData: any[],
  newProductDate: string,
  startDate: string,
  endDate: string
): StockItem[] => {
  // Group sales data by item code
  logDebugInfo("Agrupando dados de vendas por item...");
  const salesByItem = groupSalesByItem(salesData);

  // Process cost data to create a lookup map
  logDebugInfo("Processando dados de custo...");
  const processedCostData = processCostData(costData);
  
  // Calculate date range for average daily sales
  const daysDiff = calculateDateDiffInDays(startDate, endDate);
  logDebugInfo(`Período de análise: ${daysDiff} dias entre ${startDate} e ${endDate}`);
  
  // Track processed item codes to avoid duplicates
  const processedItemCodes = new Set<string>();
  
  // Create a map of item details for lookup
  logDebugInfo("Criando mapa de detalhes dos itens...");
  const itemDetailsMap = createItemDetailsMap(stockItems);
  
  // Process stock items with sales data
  logDebugInfo("Mapeando itens de estoque com dados de venda...");
  const processedItems = mapStockItems(
    stockItems,
    salesByItem,
    processedCostData,
    itemDetailsMap,
    daysDiff,
    newProductDate,
    processedItemCodes
  );
  
  // Assign rankings and return the result
  logDebugInfo(`Atribuindo rankings a ${processedItems.length} itens...`);
  return assignRankings(processedItems);
};
