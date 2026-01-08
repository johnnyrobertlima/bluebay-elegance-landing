
import { format, subDays } from "date-fns";
import { StockItem } from "./types";
import { generateSampleStockData } from "./sampleDataGenerator";
import { fetchStockSalesViaRpc } from "./rpcQueryService";
import { fallbackToDirectQueries } from "./directQueriesService";
import { handleApiError } from "./errorHandlingService";

/**
 * Main entry point for fetching stock sales analytics data
 * Tries RPC first, then falls back to direct queries if needed
 */
export const fetchStockSalesAnalytics = async (
  startDate: string,
  endDate: string
): Promise<StockItem[]> => {
  try {
    logAnalyticsRequest(startDate, endDate);
    return await attemptDataFetching(startDate, endDate);
  } catch (error) {
    return handleDataFetchingError(error);
  }
};

/**
 * Logs the analytics request details
 */
const logAnalyticsRequest = (startDate: string, endDate: string): void => {
  console.log("Buscando dados de estoque e vendas para análise:", {
    startDate,
    endDate
  });
};

/**
 * Attempts to fetch data using different strategies
 */
const attemptDataFetching = async (
  startDate: string, 
  endDate: string
): Promise<StockItem[]> => {
  try {
    console.log("Tentando buscar dados via RPC...");
    // Try to use the RPC method first
    return await fetchStockSalesViaRpc(startDate, endDate);
  } catch (error) {
    // Log the specific RPC error
    console.error("Erro ao carregar dados via RPC:", error);
    console.log("Tentando método alternativo com consultas diretas...");
    
    // If RPC fails, try the direct queries method
    return await fallbackToDirectQueries(startDate, endDate);
  }
};

/**
 * Handles errors in the data fetching process
 */
const handleDataFetchingError = (error: unknown): StockItem[] => {
  // Use the error handling service to log detailed error information
  handleApiError("Erro ao carregar dados de estoque-vendas", error);
  
  // Return sample data as a last resort
  return generateSampleStockData();
};

/**
 * Export the sample data generator for testing/preview purposes
 */
export const fetchSampleStockData = (): Promise<StockItem[]> => {
  console.log("Gerando dados de exemplo para visualização");
  return Promise.resolve(generateSampleStockData());
};

// Re-export required types from the types file
export type { StockItem } from "./types";
