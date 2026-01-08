
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "../../errorHandlingService";
import { CostDataRecord } from "./costDataTypes";
import { logCostDataSample, logItemDetails } from "./costDataLogger";

/**
 * Fetches cost data from BLUEBAY_FATURAMENTO table
 * This provides average cost (media_valor_unitario) and total quantity (total_quantidade)
 */
export const fetchCostDataFromView = async (): Promise<CostDataRecord[]> => {
  try {
    console.log("Buscando dados de custo médio da tabela BLUEBAY_FATURAMENTO");
    
    // Query from table directly instead of view
    const response = await supabase
      .from('BLUEBAY_FATURAMENTO')
      .select('ITEM_CODIGO, VALOR_UNITARIO, QUANTIDADE')
      .eq('TIPO', 'S')
      .not('ITEM_CODIGO', 'is', null);
      
    const { data, error } = response;
      
    if (error) {
      throw new Error(`Erro ao consultar dados de custos: ${error.message}`);
    }
    
    // Aggregate the data by item code
    const itemCostMap = new Map<string, { totalValue: number; totalQty: number }>();
    
    (data || []).forEach((item: any) => {
      const codigo = item.ITEM_CODIGO;
      if (!codigo) return;
      
      const qty = parseFloat(item.QUANTIDADE || 0);
      const value = parseFloat(item.VALOR_UNITARIO || 0) * qty;
      
      if (itemCostMap.has(codigo)) {
        const existing = itemCostMap.get(codigo)!;
        existing.totalValue += value;
        existing.totalQty += qty;
      } else {
        itemCostMap.set(codigo, { totalValue: value, totalQty: qty });
      }
    });
    
    // Convert to CostDataRecord format
    const costData: CostDataRecord[] = Array.from(itemCostMap.entries()).map(([codigo, data]) => ({
      ITEM_CODIGO: codigo,
      CUSTO_MEDIO: data.totalQty > 0 ? data.totalValue / data.totalQty : 0,
      ENTROU: data.totalQty
    }));
    
    console.log(`Obtidos dados de custo para ${costData.length} itens`);
    
    // Log a sample of the data to help with debugging
    if (costData.length > 0) {
      logCostDataSample(costData);
      
      // Look for a specific item for diagnostics
      logItemDetails(costData, 'MS-101/PB');
    }
    
    return costData;
  } catch (error) {
    handleApiError("Erro ao buscar dados de custo", error);
    console.warn("Não foi possível obter dados de custo");
    return [];
  }
};
