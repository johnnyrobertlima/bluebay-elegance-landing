
import { handleApiError } from "../../errorHandlingService";
import { fetchInBatches } from "../batchQueryExecutor";

/**
 * Improved paginated stock items fetching with all required filters:
 * - LOCAL=1
 * - FISICO>0
 * - DATACADASTRO>=2022
 */
export const fetchStockItemsPaginated = async (): Promise<any[]> => {
  try {
    console.log("Iniciando busca paginada de itens de estoque com filtros LOCAL=1, FISICO>0 e DATACADASTRO>=2022");
    
    // First, get all stock items with LOCAL=1 and FISICO>0
    const stockItems = await fetchInBatches({
      table: "BLUEBAY_ESTOQUE",
      selectFields: "*",
      filters: {
        "LOCAL": 1, // Filter for LOCAL = 1
      },
      conditions: [
        {
          type: 'gt',
          column: 'FISICO',
          value: 0 // Filter for FISICO > 0
        }
      ],
      batchSize: 5000, // Maior tamanho de lote para processamento mais rápido
      logPrefix: "estoque paginado",
      count: true // Contar para acompanhar progresso
    });
    
    if (!stockItems || stockItems.length === 0) {
      console.warn("Nenhum item de estoque encontrado com os filtros LOCAL=1 e FISICO>0");
      return [];
    }
    
    console.log(`Busca paginada: ${stockItems.length} itens de estoque obtidos com LOCAL=1 e FISICO>0`);
    
    // Extract item codes to filter by DATACADASTRO
    const itemCodes = stockItems.map(item => item.ITEM_CODIGO);
    
    // Processar códigos de item em lotes para evitar limitações de tamanho de consulta
    const batchSize = 5000;
    let allItemData: any[] = [];
    let processedBatches = 0;
    const totalBatches = Math.ceil(itemCodes.length / batchSize);
    
    for (let i = 0; i < itemCodes.length; i += batchSize) {
      processedBatches++;
      const batchCodes = itemCodes.slice(i, Math.min(i + batchSize, itemCodes.length));
      
      console.log(`Processando lote ${processedBatches}/${totalBatches} de códigos de item (${batchCodes.length} itens)`);
      
      // Get item data with DATACADASTRO >= 2022
      const startDate = new Date('2022-01-01').toISOString();
      const batchItemData = await fetchInBatches({
        table: "BLUEBAY_ITEM",
        selectFields: `"ITEM_CODIGO", "DATACADASTRO", "DESCRICAO", "GRU_DESCRICAO"`,
        conditions: [
          { 
            type: 'in', 
            column: 'ITEM_CODIGO', 
            value: batchCodes 
          },
          { 
            type: 'gte', 
            column: 'DATACADASTRO', 
            value: startDate 
          }
        ],
        batchSize: 5000,
        logPrefix: `itens com data >= 2022 (lote ${processedBatches}/${totalBatches})`
      });
      
      if (batchItemData && batchItemData.length > 0) {
        allItemData = [...allItemData, ...batchItemData];
        console.log(`Lote ${processedBatches}: Obtidos ${batchItemData.length} itens com data >= 2022`);
      }
    }
    
    if (!allItemData || allItemData.length === 0) {
      console.warn("Nenhum item encontrado com data de cadastro >= 2022");
      return [];
    }
    
    // Create a set of valid item codes (those with DATACADASTRO >= 2022)
    const validItemCodes = new Set(allItemData.map(item => item.ITEM_CODIGO));
    console.log(`Encontrados ${validItemCodes.size} itens com data de cadastro >= 2022`);
    
    // Create a map of item details for quick lookup
    const itemDetailsMap = new Map();
    allItemData.forEach(item => {
      itemDetailsMap.set(item.ITEM_CODIGO, {
        DESCRICAO: item.DESCRICAO,
        GRU_DESCRICAO: item.GRU_DESCRICAO,
        DATACADASTRO: item.DATACADASTRO
      });
    });
    
    // Filter stock data to only include items with DATACADASTRO >= 2022
    // And combine with item details
    const filteredAndEnrichedStockItems = stockItems
      .filter(item => validItemCodes.has(item.ITEM_CODIGO))
      .map(item => {
        const details = itemDetailsMap.get(item.ITEM_CODIGO) || {};
        return {
          ...item,
          DESCRICAO: details.DESCRICAO,
          GRU_DESCRICAO: details.GRU_DESCRICAO,
          DATACADASTRO: details.DATACADASTRO
        };
      });
    
    console.log(`Resultado final: ${filteredAndEnrichedStockItems.length} itens que atendem a todos os critérios de filtro`);
    
    return filteredAndEnrichedStockItems;
  } catch (error) {
    handleApiError("Erro ao buscar itens de estoque paginados", error);
    throw error;
  }
};
