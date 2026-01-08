
import { supabase } from "@/integrations/supabase/client";
import { ItemReport } from "../types";

/**
 * Fetch unique item codes from faturamento data
 */
export const getUniqueItemCodes = (faturamentoData: any[]): string[] => {
  try {
    return [...new Set(
      faturamentoData
        .filter(item => item.ITEM_CODIGO)
        .map(item => item.ITEM_CODIGO)
    )];
  } catch (error) {
    console.error("Error extracting unique item codes:", error);
    return [];
  }
};

/**
 * Fetch item information from database
 */
export const fetchItemsInformation = async (itemCodes: string[]) => {
  if (!itemCodes.length) return [];

  try {
    console.log(`Fetching information for ${itemCodes.length} unique item codes`);
    
    const { data: itemsData, error: itemsError } = await supabase
      .from('BLUEBAY_ITEM')
      .select('*')
      .in('ITEM_CODIGO', itemCodes);
    
    if (itemsError) {
      console.error("Error fetching item information:", itemsError);
      throw itemsError;
    }
    
    console.log(`Loaded information for ${itemsData?.length || 0} items`);
    return itemsData || [];
  } catch (error) {
    console.error("Error in fetchItemsInformation:", error);
    return [];
  }
};

/**
 * Create a map of item codes to their information
 */
export const createItemInfoMap = (itemsData: any[]) => {
  const itemsMap = new Map();
  
  itemsData.forEach(item => {
    itemsMap.set(item.ITEM_CODIGO, {
      DESCRICAO: item.DESCRICAO,
      GRU_DESCRICAO: item.GRU_DESCRICAO
    });
  });
  
  return itemsMap;
};

/**
 * Process faturamento data into item reports
 */
export const processItemReports = (faturamentoData: any[], itemsMap: Map<string, any>): ItemReport[] => {
  try {
    const itemReports: { [key: string]: ItemReport } = {};
    
    faturamentoData.forEach(fatura => {
      if (!fatura.ITEM_CODIGO) return;
      
      const itemCode = fatura.ITEM_CODIGO;
      const quantidade = fatura.QUANTIDADE || 0;
      const valorTotal = fatura.VALOR_UNITARIO ? quantidade * fatura.VALOR_UNITARIO : 0;
      
      if (!itemReports[itemCode]) {
        const itemInfo = itemsMap.get(itemCode) || {};
        itemReports[itemCode] = {
          ITEM_CODIGO: itemCode,
          DESCRICAO: itemInfo.DESCRICAO || '',
          GRU_DESCRICAO: itemInfo.GRU_DESCRICAO || '',
          TOTAL_QUANTIDADE: 0,
          TOTAL_VALOR: 0,
          OCORRENCIAS: 0
        };
      }
      
      itemReports[itemCode].TOTAL_QUANTIDADE += quantidade;
      itemReports[itemCode].TOTAL_VALOR += valorTotal;
      itemReports[itemCode].OCORRENCIAS += 1;
    });
    
    return Object.values(itemReports);
  } catch (error) {
    console.error("Error processing item reports:", error);
    return [];
  }
};
