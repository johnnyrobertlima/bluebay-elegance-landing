
import { StockItem } from "./types";
import { handleApiError } from "./errorHandlingService";
import { generateSampleStockData } from "./sampleDataGenerator";
// Import the function directly from its source file
import { fetchStockSalesWithDirectQueries as directQueriesFunction } from "./queries/directQueries";
import { fetchStockSalesWithPagination } from "./queries/fallbackQueries";

/**
 * Fallback method that fetches data directly from tables when RPC fails
 * Tries different query strategies
 */
export const fallbackToDirectQueries = async (
  startDate: string,
  endDate: string
): Promise<StockItem[]> => {
  try {
    console.log("Tentando consultas diretas após falha no RPC");
    
    try {
      // First strategy: Direct queries with batching
      console.log("Estratégia 1: Consultas diretas com batching");
      return await directQueriesFunction(startDate, endDate);
    } catch (directError) {
      console.error("Falha na estratégia de consultas diretas:", directError);
      
      // Second strategy: Paginated queries
      console.log("Estratégia 2: Tentando abordagem alternativa com paginação");
      return await fetchStockSalesWithPagination(startDate, endDate);
    }
  } catch (error) {
    handleApiError("Todas as estratégias de consulta direta falharam", error);
    console.warn("Gerando dados de exemplo como último recurso");
    return generateSampleStockData();
  }
};

// Export the function from its source
export { directQueriesFunction as fetchStockSalesWithDirectQueries };
