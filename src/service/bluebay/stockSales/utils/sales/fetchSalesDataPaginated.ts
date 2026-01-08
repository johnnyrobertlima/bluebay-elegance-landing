
import { handleApiError } from "../../errorHandlingService";
import { fetchInBatches } from "../batchQueryExecutor";

/**
 * Fetch paginated sales data for a date range
 */
export const fetchSalesDataPaginated = async (startDate: string, endDate: string): Promise<any[]> => {
  try {
    console.log(`Iniciando busca paginada de dados de vendas para o período ${startDate} a ${endDate}`);
    
    const salesData = await fetchInBatches({
      table: "BLUEBAY_FATURAMENTO",
      selectFields: "*",
      filters: { TIPO: "S" },
      conditions: [
        { type: 'gte', column: 'DATA_EMISSAO', value: startDate },
        { type: 'lte', column: 'DATA_EMISSAO', value: `${endDate}T23:59:59` }
      ],
      batchSize: 5000,
      logPrefix: "vendas paginadas"
    });
    
    console.log(`Total final: ${salesData.length} registros de vendas carregados`);
    return salesData;
  } catch (error) {
    handleApiError("Erro ao buscar dados de vendas paginados", error);
    throw error;
  }
};
