
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatTableDate = (dateString: string | null) => {
  if (!dateString) return "-";
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  } catch (e) {
    return "-";
  }
};

export const formatTableNumber = (num: number | null, decimals = 2) => {
  if (num === null || num === undefined) return "-";
  return num.toLocaleString('pt-BR', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatTablePercentage = (num: number | null) => {
  if (num === null || num === undefined) return "-";
  return `${num.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}%`;
};

export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: Date | null): string => {
  if (!date) return "-";
  try {
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  } catch (e) {
    return "-";
  }
};

export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0';
  
  return new Intl.NumberFormat('pt-BR').format(value);
};

export const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0%';
  
  return `${value.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}%`;
};
