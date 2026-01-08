
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch sample data for diagnostic purposes
 */
export const fetchSampleFaturamentoData = async () => {
  try {
    const { data: sampleData, error: sampleError } = await supabase
      .from('BLUEBAY_FATURAMENTO')
      .select('DATA_EMISSAO, PED_NUMPEDIDO, ITEM_CODIGO')
      .order('DATA_EMISSAO', { ascending: false })
      .limit(5);
    
    if (sampleError) {
      console.error("Erro ao buscar amostra de dados:", sampleError);
      return null;
    }
    
    return sampleData;
  } catch (error) {
    console.error("Error fetching sample data:", error);
    return null;
  }
};

/**
 * Check if there are records in the specified date range
 */
export const checkRecordsInPeriod = async (startDate: string, endDate: string) => {
  try {
    // Realizar a consulta com contagem precisa
    const { count, error } = await supabase
      .from('BLUEBAY_FATURAMENTO')
      .select('*', { count: 'exact', head: true })
      .gte('DATA_EMISSAO', startDate)
      .lte('DATA_EMISSAO', endDate + 'T23:59:59');
    
    if (error) {
      console.error("Erro ao verificar dados no período:", error);
      return null;
    }
    
    console.log(`Quantidade de registros no período ${startDate} a ${endDate}: ${count}`);
    return count;
  } catch (countError) {
    console.error("Erro na consulta de contagem:", countError);
    return null;
  }
};

/**
 * Test the RPC function with no filters
 */
export const testRpcFunction = async () => {
  try {
    const { data: testData, error: testError } = await supabase
      .rpc('get_bluebay_faturamento', { 
        start_date: null,
        end_date: null
      })
      .limit(5);
    
    if (testError) {
      console.error("Erro no teste da função RPC:", testError);
      return null;
    }
    
    return testData;
  } catch (error) {
    console.error("Error testing RPC function:", error);
    return null;
  }
};

/**
 * Get the total count of records in the faturamento table
 */
export const getTotalFaturamentoCount = async () => {
  try {
    const { count, error } = await supabase
      .from('BLUEBAY_FATURAMENTO')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error("Erro ao verificar quantidade total de itens:", error);
      return null;
    }
    
    return count;
  } catch (error) {
    console.error("Error getting total count:", error);
    return null;
  }
};
