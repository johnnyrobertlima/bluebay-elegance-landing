
export interface FinancialTitle {
  ANOBASE: number;
  NUMLCTO: number;
  MATRIZ: number;
  FILIAL: number;
  TIPO: string;
  NUMDOCUMENTO?: string | null;
  NUMNOTA?: number | null;
  PES_CODIGO?: string | null;
  CLIENTE_NOME?: string;
  STATUS?: string | null;
  DTEMISSAO?: string | null;
  DTVENCIMENTO?: string | null;
  DTVENCTO?: string | null;
  DTPAGTO?: string | null;
  VLRTITULO?: number | null;
  VLRDESCONTO?: number | null;
  VLRABATIMENTO?: number | null;
  VLRSALDO?: number | null;
}

export interface ClientDebtSummary {
  PES_CODIGO: string;
  CLIENTE_NOME: string;
  CLIENTE_EMAIL?: string;
  totalTitulos: number;
  totalVencido: number;
  totalAVencer: number;
  titulosVencidos: number;
  titulosAVencer: number;
  diasAtraso: number;
  ultimoVencimento?: string;
  TOTAL_SALDO: number;
  QUANTIDADE_TITULOS: number;
  DIAS_VENCIDO_MAX: number;
}

export interface CollectionRecord {
  id: string;
  cliente_codigo: string;
  clientCode: string;
  cliente_nome: string;
  clientName: string;
  data_cobranca: string;
  date: string;
  valor_cobrado: number;
  observacao?: string;
  usuario_id?: string;
  collectedBy?: string;
  status?: string;
  created_at: string;
}

export interface FinancialSummary {
  totalVencido: number;
  totalAVencer: number;
  totalPago: number;
  totalGeral: number;
  qtdVencidos: number;
  qtdAVencer: number;
  qtdPagos: number;
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
}
