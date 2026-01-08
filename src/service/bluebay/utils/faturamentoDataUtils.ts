
import { format } from 'date-fns';
import { 
  DailyFaturamento, 
  MonthlyFaturamento, 
  FaturamentoItem, 
  PedidoItem 
} from "../dashboardComercialTypes";

/**
 * Processa dados de faturamento para gerar agregados diários, mensais e totais
 * @param faturamentoItems Itens de faturamento a serem processados
 * @param pedidoItems Itens de pedido para referência
 * @returns Objeto com os dados processados
 */
export function processarDadosFaturamento(
  faturamentoItems: FaturamentoItem[],
  pedidoItems: PedidoItem[]
) {
  const dailyData: Record<string, DailyFaturamento> = {};
  const monthlyData: Record<string, MonthlyFaturamento> = {};
  let totalFaturado = 0;
  let totalItens = 0;
  let minDate: Date | null = null;
  let maxDate: Date | null = null;

  // Process each faturamento item
  faturamentoItems.forEach(item => {
    // Skip if no value or emission date
    if (!item.VALOR_NOTA || !item.DATA_EMISSAO) return;
    
    const valor = Number(item.VALOR_NOTA) || 0;
    const quantidade = Number(item.QUANTIDADE) || 0;
    const emissionDate = new Date(item.DATA_EMISSAO);
    
    // Update total values
    totalFaturado += valor;
    totalItens += quantidade;
    
    // Update min/max dates
    if (!minDate || emissionDate < minDate) minDate = emissionDate;
    if (!maxDate || emissionDate > maxDate) maxDate = emissionDate;
    
    // Format date for daily aggregation
    const dateStr = format(emissionDate, 'yyyy-MM-dd');
    if (!dailyData[dateStr]) {
      dailyData[dateStr] = {
        date: dateStr,
        total: 0,
        pedidoTotal: 0,
        formattedDate: format(emissionDate, 'dd/MM/yyyy')
      };
    }
    dailyData[dateStr].total += valor;
    
    // Format month for monthly aggregation
    const monthStr = format(emissionDate, 'yyyy-MM');
    if (!monthlyData[monthStr]) {
      monthlyData[monthStr] = {
        month: monthStr,
        total: 0,
        pedidoTotal: 0,
        formattedMonth: format(emissionDate, 'MMM/yyyy')
      };
    }
    monthlyData[monthStr].total += valor;
  });

  // Process pedido items for pedidoTotal
  pedidoItems.forEach(item => {
    if (!item.DATA_PEDIDO || !item.QTDE_PEDIDA || !item.VALOR_UNITARIO) return;
    
    const valor = Number(item.QTDE_PEDIDA) * Number(item.VALOR_UNITARIO);
    const pedidoDate = new Date(item.DATA_PEDIDO);
    
    const dateStr = format(pedidoDate, 'yyyy-MM-dd');
    if (dailyData[dateStr]) {
      dailyData[dateStr].pedidoTotal += valor;
    }
    
    const monthStr = format(pedidoDate, 'yyyy-MM');
    if (monthlyData[monthStr]) {
      monthlyData[monthStr].pedidoTotal += valor;
    }
  });

  // Convert to arrays and calculate average
  const dailyFaturamento = Object.values(dailyData);
  const monthlyFaturamento = Object.values(monthlyData);
  const mediaValorItem = totalItens > 0 ? totalFaturado / totalItens : 0;

  return {
    dailyFaturamento,
    monthlyFaturamento,
    totalFaturado,
    totalItens,
    mediaValorItem,
    minDate,
    maxDate
  };
}
