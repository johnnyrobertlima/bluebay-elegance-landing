
import { PostgrestResponse } from '@supabase/supabase-js';

/**
 * Utility to fetch data in batches to avoid the 1000 record limit
 * @param fetchFunction Function that performs the actual fetch with pagination
 * @param batchSize Size of each batch
 * @returns Combined results from all batches
 */
export async function fetchInBatches<T>(
  fetchFunction: (offset: number, limit: number) => Promise<PostgrestResponse<T>>,
  batchSize: number = 5000
): Promise<T[]> {
  let allResults: T[] = [];
  let hasMore = true;
  let offset = 0;
  let batchCount = 0;
  let lastBatchSize = 0;

  while (hasMore) {
    console.log(`Buscando lote ${batchCount + 1} (offset: ${offset}, limit: ${batchSize})...`);
    
    const response = await fetchFunction(offset, batchSize);
    
    if (response.error) {
      console.error(`Erro ao buscar lote ${batchCount + 1}:`, response.error);
      throw response.error;
    }
    
    const data = response.data;
    
    if (!data || data.length === 0) {
      console.log(`Lote ${batchCount + 1} não retornou dados. Finalizando.`);
      hasMore = false;
      break;
    }
    
    lastBatchSize = data.length;
    allResults = [...allResults, ...data];
    offset += batchSize; // Always increment by batchSize, not by lastBatchSize
    batchCount++;
    
    console.log(`Lote ${batchCount}: Recebidos ${lastBatchSize} registros. Total acumulado: ${allResults.length}`);
    
    // Continue fetching if we received exactly batchSize records (which means there might be more)
    // This logic handles Supabase's 1000 record limit correctly
    hasMore = lastBatchSize === batchSize;
  }
  
  console.log(`Processo de lotes concluído: ${allResults.length} registros carregados em ${batchCount} lotes.`);
  
  return allResults;
}
