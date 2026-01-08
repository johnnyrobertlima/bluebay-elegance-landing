
/**
 * Normaliza valores antes da comparação, tratando nulos e indefinidos
 * @param value Valor a ser normalizado
 * @returns String normalizada
 */
export const normalizeValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

/**
 * Cria uma chave composta para identificar registros relacionados
 * @param record Registro com as colunas necessárias para a chave
 * @returns Uma string única que representa a chave composta
 */
export const createCompositeKey = (record: any): string => {
  const numPedido = normalizeValue(record.PED_NUMPEDIDO);
  const anoBase = normalizeValue(record.PED_ANOBASE);
  const numOrdem = normalizeValue(record.MPED_NUMORDEM);
  const itemCodigo = normalizeValue(record.ITEM_CODIGO);
  
  // Retorna uma chave padronizada no formato pedido|ano|ordem|item
  return `${numPedido}|${anoBase}|${numOrdem}|${itemCodigo}`;
};
