
import { supabase } from "@/integrations/supabase/client";
import { fetchBluebayFaturamento } from "./faturamentoService";
import { ItemReport } from "./types";
import { 
  getUniqueItemCodes, 
  fetchItemsInformation, 
  createItemInfoMap, 
  processItemReports 
} from "./utils/itemDataProcessor";
import { 
  fetchSampleFaturamentoData, 
  checkRecordsInPeriod, 
  testRpcFunction, 
  getTotalFaturamentoCount 
} from "./utils/diagnosticsHelper";
import { 
  generateTestData, 
  isDevelopmentEnvironment 
} from "./utils/testDataGenerator";

/**
 * Main function to fetch Bluebay items report
 */
export const fetchBluebayItemsReport = async (
  startDate: string,
  endDate: string
): Promise<ItemReport[]> => {
  try {
    console.log("Buscando relatório de itens Bluebay...", {
      startDate,
      endDate
    });
    
    // Fetch faturamento data with date filter - usando query direta em vez da RPC
    const faturamentoData = await fetchBluebayFaturamento(startDate, endDate);
    
    if (!Array.isArray(faturamentoData) || faturamentoData.length === 0) {
      console.info("Nenhum dado de faturamento encontrado para o período");
      
      // Run diagnostics to understand what's happening
      const totalCount = await getTotalFaturamentoCount();
      if (totalCount !== null) {
        console.log(`Total de registros na tabela BLUEBAY_FATURAMENTO: ${totalCount}`);
      }
      
      const testData = await testRpcFunction();
      if (testData && testData.length > 0) {
        console.log("Função RPC retorna dados quando não há filtros de data:", 
          testData.map(item => ({
            data: item.DATA_EMISSAO,
            item: item.ITEM_CODIGO
          }))
        );
      } else {
        console.log("Função RPC sem filtros de data também não retorna dados");
      }
      
      const sampleData = await fetchSampleFaturamentoData();
      if (sampleData && sampleData.length > 0) {
        console.log("Amostra de dados recentes de faturamento:", sampleData);
        
        // Check if there are any records in the specified period
        const periodCount = await checkRecordsInPeriod(startDate, endDate);
        if (periodCount && periodCount > 0) {
          // Há dados no período, mas algo está errado com a consulta RPC
          // Vamos buscar os dados diretamente da tabela
          console.log(`Buscando ${periodCount} registros diretamente da tabela BLUEBAY_FATURAMENTO`);
          const { data: directData, error: directError } = await supabase
            .from('BLUEBAY_FATURAMENTO')
            .select('*')
            .gte('DATA_EMISSAO', startDate)
            .lte('DATA_EMISSAO', endDate + 'T23:59:59Z')
            .limit(10000); // Limite para não sobrecarregar
          
          if (directError) {
            console.error("Erro ao buscar dados diretos:", directError);
          } else if (directData && directData.length > 0) {
            console.log(`Processando ${directData.length} registros obtidos diretamente`);
            return await processDirectFaturamentoData(directData);
          }
        }
      }
      
      // Use test data if in development mode or if direct query also failed
      if (isDevelopmentEnvironment()) {
        console.log("Usando dados de teste para desenvolvimento");
        return generateTestData();
      }
      
      return [];
    }
    
    console.log(`Processing ${faturamentoData.length} faturamento records`);
    
    // Get unique item codes from faturamento
    const itemCodes = getUniqueItemCodes(faturamentoData);
    
    if (itemCodes.length === 0) {
      console.info("No items found in faturamento data");
      return [];
    }
    
    console.log(`Found ${itemCodes.length} unique item codes`);
    
    // Fetch item information
    const itemsData = await fetchItemsInformation(itemCodes);
    
    // Create map of item information 
    const itemsMap = createItemInfoMap(itemsData);
    
    // Process faturamento data into item reports
    const result = processItemReports(faturamentoData, itemsMap);
    
    console.log(`Generated report with ${result.length} items`);
    return result;
  } catch (error) {
    console.error("Error fetching item reports:", error);
    
    // In development, return test data if there's an error
    if (isDevelopmentEnvironment()) {
      console.log("Using test data due to error");
      return generateTestData();
    }
    
    throw error;
  }
};

/**
 * Process direct faturamento data when RPC fails
 */
const processDirectFaturamentoData = async (directData: any[]): Promise<ItemReport[]> => {
  try {
    // Get unique item codes from direct data
    const itemCodes = getUniqueItemCodes(directData);
    
    if (itemCodes.length === 0) {
      return [];
    }
    
    // Fetch item information
    const itemsData = await fetchItemsInformation(itemCodes);
    
    // Create map of item information 
    const itemsMap = createItemInfoMap(itemsData);
    
    // Process faturamento data into item reports
    return processItemReports(directData, itemsMap);
  } catch (error) {
    console.error("Error processing direct faturamento data:", error);
    return [];
  }
};
