
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
}

export interface DailyFaturamento {
  date: string;
  total: number;
  pedidoTotal: number;
  formattedDate: string;
}

export interface MonthlyFaturamento {
  month: string;
  total: number;
  pedidoTotal: number;
  formattedMonth: string;
}

export interface DashboardComercialData {
  dailyFaturamento: DailyFaturamento[];
  monthlyFaturamento: MonthlyFaturamento[];
  totalFaturado: number;
  totalItens: number;
  mediaValorItem: number;
  faturamentoItems: FaturamentoItem[];
  pedidoItems: PedidoItem[];
  dataRangeInfo: {
    startDateRequested: string;
    endDateRequested: string;
    startDateActual: string | null;
    endDateActual: string | null;
    hasCompleteData: boolean;
  };
}
