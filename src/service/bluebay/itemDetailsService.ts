
import { supabase } from "@/integrations/supabase/client";
import { fetchBluebayFaturamento } from "./faturamentoService";
import { ItemDetail } from "./types";
import { isDevelopmentEnvironment } from "./utils/testDataGenerator";

/**
 * Fetch item details for a specific item code
 */
export const fetchItemDetails = async (
  itemCode: string,
  startDate: string,
  endDate: string
): Promise<ItemDetail[]> => {
  try {
    console.log(`Fetching details for item ${itemCode}`);
    
    // Get faturamento data filtered by date
    const faturamentoData = await fetchBluebayFaturamento(startDate, endDate);
    
    if (!Array.isArray(faturamentoData) || faturamentoData.length === 0) {
      console.info("No faturamento data found for the period");
      
      // Return test data in development environment
      if (isDevelopmentEnvironment()) {
        return generateTestItemDetails(itemCode);
      }
      
      return [];
    }
    
    // Filter faturamento data by item code
    const itemFaturamento = faturamentoData.filter(
      item => item.ITEM_CODIGO === itemCode
    );
    
    if (itemFaturamento.length === 0) {
      console.info(`No faturamento data found for item ${itemCode}`);
      return [];
    }
    
    // Get unique PES_CODIGO values for client information lookup
    const pesCodigoValues = Array.from(
      new Set(
        itemFaturamento
          .filter(item => item.PES_CODIGO)
          .map(item => item.PES_CODIGO)
      )
    );
    
    // Fetch client information for the PES_CODIGO values
    const { data: clientsData, error: clientsError } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO, APELIDO, RAZAOSOCIAL')
      .in('PES_CODIGO', pesCodigoValues);
    
    if (clientsError) {
      console.error("Error fetching client information:", clientsError);
      throw clientsError;
    }
    
    // Create a map of PES_CODIGO to client information
    const clientsMap = new Map();
    (clientsData || []).forEach(client => {
      clientsMap.set(
        client.PES_CODIGO, 
        client.APELIDO || client.RAZAOSOCIAL || `Cliente ${client.PES_CODIGO}`
      );
    });
    
    // Map faturamento data to item details
    const details: ItemDetail[] = itemFaturamento.map(item => ({
      NOTA: item.NOTA || '',
      DATA_EMISSAO: item.DATA_EMISSAO || '',
      CLIENTE_NOME: clientsMap.get(item.PES_CODIGO) || `Cliente ${item.PES_CODIGO}`,
      PES_CODIGO: item.PES_CODIGO || 0,
      QUANTIDADE: item.QUANTIDADE || 0,
      VALOR_UNITARIO: item.VALOR_UNITARIO || 0,
      FATOR_CORRECAO: null // If you need to add this information, do it here
    }));
    
    return details;
  } catch (error) {
    console.error(`Error fetching details for item ${itemCode}:`, error);
    throw error;
  }
};

/**
 * Generate test item details for development
 */
const generateTestItemDetails = (itemCode: string): ItemDetail[] => {
  return [
    {
      NOTA: "NF001",
      DATA_EMISSAO: "2025-03-15",
      CLIENTE_NOME: "Cliente Teste 1",
      PES_CODIGO: 1001,
      QUANTIDADE: 10,
      VALOR_UNITARIO: 150,
      FATOR_CORRECAO: null
    },
    {
      NOTA: "NF002",
      DATA_EMISSAO: "2025-03-20",
      CLIENTE_NOME: "Cliente Teste 2",
      PES_CODIGO: 1002,
      QUANTIDADE: 5,
      VALOR_UNITARIO: 160,
      FATOR_CORRECAO: null
    },
    {
      NOTA: "NF003",
      DATA_EMISSAO: "2025-03-25",
      CLIENTE_NOME: "Cliente Teste 1",
      PES_CODIGO: 1001,
      QUANTIDADE: 15,
      VALOR_UNITARIO: 155,
      FATOR_CORRECAO: 1.05
    }
  ];
};
