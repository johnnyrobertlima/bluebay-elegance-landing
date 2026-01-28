
export interface FaturamentoItem {
  MATRIZ?: number;
  FILIAL?: number;
  ID_EF_DOCFISCAL?: number;
  ID_EF_DOCFISCAL_ITEM?: number;
  PED_NUMPEDIDO?: string;
  PED_ANOBASE?: number;
  MPED_NUMORDEM?: number;
  ITEM_CODIGO?: string;
  PES_CODIGO?: number;
  TIPO?: string;
  NOTA?: string;
  TRANSACAO?: number;
  QUANTIDADE?: number;
  VALOR_UNITARIO?: number;
  VALOR_DESCONTO?: number;
  VALOR_NOTA?: number;
  STATUS?: string;
  DATA_EMISSAO?: string | Date;
  // Additional fields from the materialized view
  CENTROCUSTO?: string | null;
  CENTRO_CUSTO?: string;
  DATA_PEDIDO?: string | Date | null;
  REPRESENTANTE?: number | null;
  RAZAOSOCIAL?: string | null;
  APELIDO?: string | null;
  DESCRICAO?: string | null;
  // Add the pedido relation
  pedido?: {
    CENTROCUSTO?: string;
    MATRIZ?: number;
    FILIAL?: number;
    PED_NUMPEDIDO?: string;
    PED_ANOBASE?: number;
    MPED_NUMORDEM?: number;
    ITEM_CODIGO?: string;
    PES_CODIGO?: number;
    QTDE_PEDIDA?: number;
    QTDE_ENTREGUE?: number;
    QTDE_SALDO?: number;
    STATUS?: string;
    DATA_PEDIDO?: string | Date;
    VALOR_UNITARIO?: number;
    REPRESENTANTE?: number;
  };
  // Add the faturamento relation
  faturamento?: {
    NOTA?: string;
    MATRIZ?: number;
    FILIAL?: number;
    ID_EF_DOCFISCAL?: number;
    ID_EF_DOCFISCAL_ITEM?: number;
    PED_NUMPEDIDO?: string;
    PED_ANOBASE?: number;
    MPED_NUMORDEM?: number;
    ITEM_CODIGO?: string;
    QUANTIDADE?: number;
    VALOR_UNITARIO?: number;
    VALOR_DESCONTO?: number;
    VALOR_NOTA?: number;
    STATUS?: string;
    DATA_EMISSAO?: string | Date;
    PES_CODIGO?: number;
    TIPO?: string;
  };
  REPRESENTANTE_NOME?: string; // Fetched separately (Apelido do Representante)
}

export interface PedidoItem {
  MATRIZ: number;
  FILIAL: number;
  PED_NUMPEDIDO: string;
  PED_ANOBASE: number;
  MPED_NUMORDEM: number;
  ITEM_CODIGO?: string;
  PES_CODIGO?: number;
  QTDE_PEDIDA?: number;
  QTDE_ENTREGUE?: number;
  QTDE_SALDO?: number;
  STATUS?: string;
  DATA_PEDIDO?: string | Date;
  VALOR_UNITARIO?: number;
  CENTROCUSTO?: string;
  CENTRO_CUSTO?: string; // Added for compatibility with the materialized view
  REPRESENTANTE?: number; // Added the missing REPRESENTANTE property
  REPRESENTANTE_NOME?: string; // Added for the Level 2 grid display
  APELIDO?: string; // Fetched from BLUEBAY_PESSOA
  DESCRICAO?: string; // Fetched from BLUEBAY_ITEM
}

export interface DailyFaturamento {
  date: string;
  total: number;
  faturamentoCount?: number;
  pedidoTotal: number;
  pedidoCount?: number;
  formattedDate: string;
}

export interface MonthlyFaturamento {
  month: string;
  total: number;
  pedidoTotal: number;
  formattedMonth: string;
}

export interface DashboardComercialStats {
  daily: DailyFaturamento[];
  monthly: MonthlyFaturamento[];
  totals: {
    totalFaturado: number;
    totalItens: number;
    mediaValorItem: number;
    totalPedidosValue: number;
    totalPedidosQty: number;
  };
  costCenters: {
    nome: string;
    totalFaturado: number;
    totalItensFaturados: number;
    totalPedidos: number;
    totalItensPedidos: number;
    ticketMedioFaturado: number;
  }[];
  representativeStats?: {
    id: string;
    nome: string;
    totalFaturado: number;
    totalItensFaturados: number;
    totalPedidos: number;
    totalItensPedidos: number;
    ticketMedioFaturado: number;
  }[];
  cityStats?: CitySalesStat[];
}

export interface CitySalesStat {
  city: string;
  uf: string;
  totalFaturado: number;
  totalFaturadoCount: number;
  totalPedidosValue: number;
  totalPedidosCount: number;
}

export interface DashboardComercialData {
  dailyFaturamento: DailyFaturamento[];
  monthlyFaturamento: MonthlyFaturamento[];
  totalFaturado: number;
  totalItens: number;
  mediaValorItem: number;
  faturamentoItems: FaturamentoItem[];
  pedidoItems: PedidoItem[];
  costCenterStats?: DashboardComercialStats['costCenters']; // Added for staged loading
  representativeStats?: DashboardComercialStats['representativeStats']; // Added
  totals?: DashboardComercialStats['totals']; // Added
  comparisonTotals?: DashboardComercialStats['totals'] & { costCenters?: DashboardComercialStats['costCenters'] }; // Added for comparison
  dataRangeInfo: {
    startDateRequested: string;
    endDateRequested: string;
    startDateActual: string | null;
    endDateActual: string | null;
    hasCompleteData: boolean;
  };
  clientStats?: ClientStat[];
  productStats?: ProductCategoryStat[];
}

export interface ProductCategoryStat {
  GRU_DESCRICAO: string;
  VALOR_PEDIDO: number;
  QTDE_ITENS: number;
  VALOR_FATURADO: number;
  QTDE_FATURADA: number;
  TM: number;
  items: ProductItemStat[];
}

export interface ProductItemStat {
  ITEM_CODIGO: string;
  DESCRICAO: string;
  VALOR_PEDIDO: number;
  QTDE_ITENS: number;
  VALOR_FATURADO: number;
  QTDE_FATURADA: number;
  TM: number;
  orders: {
    PED_NUMPEDIDO: string;
    APELIDO: string;
    DATA_PEDIDO: string;
    QTDE_PEDIDA: number;
    VALOR_UNITARIO: number;
    VALOR_TOTAL: number;
    QTDE_ENTREGUE: number;
    VALOR_FATURADO: number;
  }[];
}

export interface ClientStat {
  PES_CODIGO: string; // Keep as string for map keys usually, or number? DB is number. Let's use string for flexibility in keys.
  APELIDO: string;
  NOME_CATEGORIA?: string;
  TOTAL_FATURADO: number;
  ITENS_FATURADOS: number;
  TM_ITEM_FATURADO: number;
  TOTAL_PEDIDO: number;
  ITENS_PEDIDOS: number;
}
