
import { handleApiError } from "../errorHandlingService";
import { fetchInBatches } from "./batchQueryExecutor";

/**
 * Fetch item data in batches for given item codes
 */
export const fetchItemDataInBatches = async (itemCodes: string[]): Promise<any[]> => {
  try {
    if (!itemCodes || itemCodes.length === 0) {
      console.warn("Nenhum código de item fornecido para busca");
      return [];
    }
    
    // Processa em blocos de 1000 códigos de itens por vez (limitação do Supabase)
    const batchSize = 1000;
    let allItemData: any[] = [];
    let batchesCount = Math.ceil(itemCodes.length / batchSize);
    
    console.log(`Iniciando busca de ${itemCodes.length} itens em ${batchesCount} lotes`);
    
    for (let i = 0; i < itemCodes.length; i += batchSize) {
      const batchCodes = itemCodes.slice(i, i + batchSize);
      const currentBatch = Math.floor(i / batchSize) + 1;
      
      console.log(`Processando lote ${currentBatch}/${batchesCount} de itens (${batchCodes.length} códigos)`);
      
      try {
        const batchData = await fetchInBatches({
          table: "BLUEBAY_ITEM",
          selectFields: `
            "ITEM_CODIGO",
            "DESCRICAO",
            "GRU_DESCRICAO",
            "DATACADASTRO"
          `,
          conditions: [
            { type: 'in', column: 'ITEM_CODIGO', value: batchCodes }
          ],
          batchSize: 1000,
          logPrefix: `itens (lote ${currentBatch}/${batchesCount})`
        });
        
        if (batchData && batchData.length > 0) {
          allItemData = [...allItemData, ...batchData];
          console.log(`Adicionados ${batchData.length} itens do lote ${currentBatch}. Total: ${allItemData.length}`);
        } else {
          console.warn(`Nenhum item encontrado no lote ${currentBatch}`);
        }
      } catch (batchError) {
        console.error(`Erro ao processar lote ${currentBatch} de itens:`, batchError);
        // Continua processando os outros lotes mesmo com erro
      }
    }
    
    console.log(`Concluído: ${allItemData.length} itens carregados de ${itemCodes.length} códigos`);
    return allItemData;
  } catch (error) {
    handleApiError("Erro ao buscar dados de itens em lote", error);
    throw error;
  }
};

/**
 * Fetch batch of item details by item codes
 */
export const fetchItemDetailsBatch = async (itemCodes: string[], batchSize = 500): Promise<any[]> => {
  try {
    if (!itemCodes || itemCodes.length === 0) {
      return [];
    }
    
    let allItemDetails: any[] = [];
    let batchesProcessed = 0;
    const totalBatches = Math.ceil(itemCodes.length / batchSize);
    
    for (let i = 0; i < itemCodes.length; i += batchSize) {
      const batchCodes = itemCodes.slice(i, i + batchSize);
      batchesProcessed++;
      
      console.log(`Processando lote ${batchesProcessed}/${totalBatches} de detalhes de itens (${batchCodes.length} códigos)`);
      
      try {
        const itemDetails = await fetchInBatches({
          table: "BLUEBAY_ITEM",
          selectFields: "*",
          conditions: [
            { type: 'in', column: 'ITEM_CODIGO', value: batchCodes }
          ],
          batchSize: 1000,
          logPrefix: `detalhes de itens (lote ${batchesProcessed}/${totalBatches})`
        });
        
        if (itemDetails && itemDetails.length > 0) {
          allItemDetails = [...allItemDetails, ...itemDetails];
          console.log(`Adicionados ${itemDetails.length} detalhes do lote ${batchesProcessed}. Total: ${allItemDetails.length}`);
        }
      } catch (batchError) {
        console.error(`Erro no lote ${batchesProcessed} de detalhes:`, batchError);
        // Continua processando os outros lotes
      }
    }
    
    console.log(`Concluído: ${allItemDetails.length} detalhes de itens carregados`);
    return allItemDetails;
  } catch (error) {
    handleApiError("Erro ao buscar detalhes de itens em lote", error);
    throw error;
  }
};
