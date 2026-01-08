
// Common types shared across report services
export interface ItemReport {
  ITEM_CODIGO: string;
  DESCRICAO?: string;
  GRU_DESCRICAO?: string;
  TOTAL_QUANTIDADE: number;
  TOTAL_VALOR: number;
  OCORRENCIAS: number;
}

export interface ItemDetail {
  NOTA: string;
  DATA_EMISSAO: string;
  CLIENTE_NOME: string;
  PES_CODIGO: number;
  QUANTIDADE: number;
  VALOR_UNITARIO: number;
  FATOR_CORRECAO?: number | null;
}
