
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "../../errorHandlingService";
import { CostDataRecord } from "./costDataTypes";
import { logCostDataSample, logItemDetails } from "./costDataLogger";

/**
 * Fetches cost data from the bluebay_view_faturamento_resumo view
 * This provides average cost (media_valor_unitario) and total quantity (total_quantidade)
 */
export const fetchCostDataFromView = async (): Promise<CostDataRecord[]> => {
  try {
    console.log("Buscando dados de custo médio da view bluebay_view_faturamento_resumo");
    
    // Query all data from the view without filtering - use explicit typing
    const response = await supabase
      .from('bluebay_view_faturamento_resumo')
      .select('*');
      
    const { data, error } = response;
      
    if (error) {
      throw new Error(`Erro ao consultar view de custos: ${error.message}`);
    }
    
    console.log(`Obtidos dados de custo para ${data?.length || 0} itens`);
    
    // Log a sample of the data to help with debugging
    if (data && data.length > 0) {
      logCostDataSample(data);
      
      // Look for a specific item for diagnostics
      logItemDetails(data, 'MS-101/PB');
    }
    
    // Ensure we return an array of CostDataRecord objects
    return (data && Array.isArray(data)) ? data as CostDataRecord[] : [];
  } catch (error) {
    handleApiError("Erro ao buscar dados de custo da view", error);
    console.warn("Não foi possível obter dados de custo da view");
    return [];
  }
};
