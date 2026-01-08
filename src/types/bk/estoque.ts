
export interface EstoqueItem {
  ITEM_CODIGO: string;
  DESCRICAO?: string;
  GRU_CODIGO?: string;
  GRU_DESCRICAO?: string;
  CODIGOAUX?: string;
  MATRIZ?: number;
  FILIAL?: number;
  LOCAL?: number;
  SUBLOCAL?: string;
  FISICO?: number;
  DISPONIVEL?: number;
  RESERVADO?: number;
  COMPRADO?: number;
  ENTROU?: number;
  LIMITE?: number;
}

export interface GroupedEstoque {
  groupName: string;
  groupCode?: string;
  items: EstoqueItem[];
  totalItems: number;
  totalFisico: number;
  totalDisponivel: number;
  totalReservado: number;
}

export interface AnaliseCompraItem extends EstoqueItem {
  QTDE_VENDIDA?: number;
  VALOR_MEDIO?: number;
  SUGESTAO_COMPRA?: number;
  DIAS_ESTOQUE?: number;
}

export interface GroupedAnaliseCompra {
  groupName: string;
  groupCode?: string;
  items: AnaliseCompraItem[];
  totalItems: number;
  totalFisico: number;
  totalSugestao: number;
}
