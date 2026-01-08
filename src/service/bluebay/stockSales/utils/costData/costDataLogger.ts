
/**
 * Logging utilities for cost data debugging
 */

/**
 * Logs a sample of cost data (first 3 items)
 */
export const logCostDataSample = (data: any[]): void => {
  if (!data || data.length === 0) return;
  
  console.log("Amostra de dados de custo (primeiros 3 itens):");
  const sampleSize = Math.min(3, data.length);
  
  for (let i = 0; i < sampleSize; i++) {
    const item = data[i];
    console.log(`Item ${i + 1}:`, {
      codigo: item.ITEM_CODIGO || item.item_codigo,
      custo: item.media_valor_unitario || item.MEDIA_VALOR_UNITARIO,
      quantidade: item.total_quantidade || item.TOTAL_QUANTIDADE
    });
  }
};

/**
 * Logs details for a specific item
 */
export const logItemDetails = (data: any[], itemCode: string): void => {
  const item = data.find(i => 
    (i.ITEM_CODIGO && i.ITEM_CODIGO === itemCode) || 
    (i.item_codigo && i.item_codigo === itemCode)
  );
  
  if (item) {
    console.log(`Encontrado item específico ${itemCode}:`, {
      ITEM_CODIGO: item.ITEM_CODIGO || item.item_codigo,
      media_valor_unitario: item.media_valor_unitario || item.MEDIA_VALOR_UNITARIO,
      total_quantidade: item.total_quantidade || item.TOTAL_QUANTIDADE
    });
  } else {
    console.log(`Item ${itemCode} não encontrado nos dados de custo`);
  }
};
