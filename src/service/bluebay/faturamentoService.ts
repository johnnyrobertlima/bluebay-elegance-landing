
import { supabase } from "@/integrations/supabase/client";

// Definir uma interface específica para evitar problemas de tipo excessivamente profundo
export interface BluebayFaturamentoItem {
  MATRIZ: number;
  FILIAL: number;
  ID_EF_DOCFISCAL: number;
  ID_EF_DOCFISCAL_ITEM: number;
  PED_ANOBASE?: number;
  MPED_NUMORDEM?: number;
  PES_CODIGO?: number;
  TRANSACAO?: number;
  QUANTIDADE?: number;
  VALOR_UNITARIO?: number;
  VALOR_DESCONTO?: number;
  VALOR_NOTA?: number;
  DATA_EMISSAO?: string;
  PED_NUMPEDIDO?: string;
  ITEM_CODIGO?: string;
  TIPO?: string;
  NOTA?: string;
  STATUS?: string;
}

export const fetchBluebayFaturamento = async (
  startDate?: string,
  endDate?: string
): Promise<BluebayFaturamentoItem[]> => {
  try {
    console.log("Buscando dados de faturamento com função RPC:", {
      startDate,
      endDate
    });

    // Usando uma query direta em vez da função RPC que pode estar com problemas
    const { data, error } = await supabase
      .from('BLUEBAY_FATURAMENTO')
      .select('*')
      .gte('DATA_EMISSAO', startDate || '')
      .lte('DATA_EMISSAO', endDate ? endDate + "T23:59:59Z" : '');

    if (error) {
      console.error("Erro ao buscar dados de faturamento:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.info("Nenhum dado de faturamento encontrado para o período");
      
      // Diagnóstico adicional para verificar se há dados na tabela
      const { count: totalItems, error: countError } = await supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error("Erro ao verificar quantidade total de itens:", countError);
      } else {
        console.log(`Total de registros na tabela BLUEBAY_FATURAMENTO: ${totalItems}`);
      }
      
      // Verificar o uso da função RPC diretamente
      const { data: testData, error: testError } = await supabase
        .rpc('get_bluebay_faturamento', { 
          start_date: null,
          end_date: null
        })
        .limit(5);
      
      if (testError) {
        console.error("Erro no teste da função RPC:", testError);
      } else if (testData && testData.length > 0) {
        console.log("Função RPC retorna dados quando não há filtros de data:", 
          testData.map(item => ({
            data: item.DATA_EMISSAO,
            item: item.ITEM_CODIGO
          }))
        );
      } else {
        console.log("Função RPC sem filtros de data também não retorna dados");
      }
      
      return [];
    }
    
    console.info(`Buscados ${data.length} registros de faturamento`);
    return data;
  } catch (error) {
    console.error("Erro ao buscar dados de faturamento:", error);
    throw error;
  }
};
