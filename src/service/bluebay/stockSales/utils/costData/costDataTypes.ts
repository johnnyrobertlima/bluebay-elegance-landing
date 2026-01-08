
/**
 * Represents a record from the cost data view
 */
export interface CostDataRecord {
  // Item identification
  ITEM_CODIGO: string;
  DESCRICAO?: string;
  
  // Cost information - may vary depending on the cost calculation method
  CUSTO_MEDIO?: number;
  CUSTO_ATUAL?: number;
  CUSTO_REPOSICAO?: number;
  CUSTO_ULTIMA_ENTRADA?: number;
  
  // Timestamps for tracking
  DATA_ATUALIZACAO?: string | Date;
  
  // Added fields for backward compatibility
  ENTROU?: number;
  teste?: number;
  
  // Additional fields that might be in the cost view
  [key: string]: any;
}
