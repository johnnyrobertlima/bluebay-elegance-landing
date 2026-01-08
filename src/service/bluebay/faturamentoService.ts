
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
    console.log("Buscando dados de faturamento:", {
      startDate,
      endDate
    });

    // Usando uma query direta em vez da função RPC
    let query = supabase
      .from('BLUEBAY_FATURAMENTO')
      .select('*');
    
    if (startDate) {
      query = query.gte('DATA_EMISSAO', startDate);
    }
    
    if (endDate) {
      query = query.lte('DATA_EMISSAO', endDate + "T23:59:59Z");
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar dados de faturamento:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.info("Nenhum dado de faturamento encontrado para o período");
      return [];
    }

    console.log(`Encontrados ${data.length} registros de faturamento`);
    return data as BluebayFaturamentoItem[];
  } catch (error) {
    console.error("Erro ao buscar faturamento:", error);
    return [];
  }
};
