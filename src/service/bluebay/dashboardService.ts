
import { supabase } from "@/integrations/supabase/client";
import { 
  KpiData, 
  TimeSeriesData, 
  TimeSeriesPoint, 
  BrandData, 
  BrandPerformanceItem,
  DeliveryData,
  DashboardFilterParams
} from "@/types/bluebay/dashboardTypes";
import { format, subMonths, parseISO } from 'date-fns';

// Define tipos específicos para os dados das tabelas
interface BluebayPedidoItem {
  MATRIZ: number;
  FILIAL: number;
  PED_ANOBASE: number;
  MPED_NUMORDEM: number;
  PED_NUMPEDIDO: string;
  PES_CODIGO?: number;
  CENTROCUSTO?: string;
  STATUS?: string;
  QTDE_PEDIDA?: number;
  QTDE_ENTREGUE?: number;
  QTDE_SALDO?: number;
  VALOR_UNITARIO?: number;
  TOTAL_PRODUTO?: number;
  DATA_PEDIDO?: string | Date;
  ITEM_CODIGO?: string;
  REPRESENTANTE?: number;
  PEDIDO?: string;
  PEDIDO_CLIENTE?: string;
  PEDIDO_OUTRO?: string;
}

interface BluebayFaturamentoItem {
  MATRIZ: number;
  FILIAL: number;
  ID_EF_DOCFISCAL: number;
  ID_EF_DOCFISCAL_ITEM: number;
  PED_ANOBASE?: number;
  MPED_NUMORDEM?: number;
  PES_CODIGO?: number;
  TRANSACAO?: number;
  QUANTIDADE?: number;
  VALOR_UNITARIO?: number;
  VALOR_DESCONTO?: number;
  VALOR_NOTA?: number;
  DATA_EMISSAO?: string | Date;
  PED_NUMPEDIDO?: string;
  ITEM_CODIGO?: string;
  TIPO?: string;
  NOTA?: string;
  STATUS?: string;
}

/**
 * Busca dados do dashboard em lotes para superar limites de consulta
 */
export const fetchDashboardData = async (
  filters: {
    startDate: Date | null;
    endDate: Date | null;
    brand: string | null;
    status: string | null;
    pagination?: {
      brandPagination?: { page: number, pageSize: number };
      noLimits?: boolean;
    }
  }
) => {
  try {
    console.log("Buscando dados do dashboard com filtros aplicados:", JSON.stringify({
      startDate: filters.startDate,
      endDate: filters.endDate,
      brand: filters.brand,
      status: filters.status
    }, null, 2));
    
    const kpiData = await fetchKpiData(filters);
    const timeSeriesData = await fetchTimeSeriesData(filters);
    const brandResults = await fetchBrandData(filters);
    const deliveryData = await fetchDeliveryData(filters);

    // Registra contagens totais para paginação
    const totalCounts = {
      brands: brandResults.totalCount || 0
    };

    return {
      kpiData,
      timeSeriesData,
      brandData: brandResults.data,
      deliveryData,
      totalCounts
    };
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    throw error;
  }
};

/**
 * Busca dados em lotes para superar limite do Supabase
 * Função genérica para busca paginada
 */
const fetchInBatches = async <T>(
  query: Function,
  batchSize: number = 10000
): Promise<T[]> => {
  let allData: T[] = [];
  let hasMore = true;
  let offset = 0;
  let batchCount = 0;
  
  while (hasMore) {
    batchCount++;
    console.log(`Buscando lote ${batchCount} (offset: ${offset}, tamanho: ${batchSize})`);
    
    const { data, error } = await query(offset, batchSize);
    
    if (error) {
      console.error(`Erro ao buscar lote ${batchCount}:`, error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log(`Nenhum dado encontrado no lote ${batchCount}`);
      hasMore = false;
    } else {
      allData = [...allData, ...data];
      console.log(`Processado lote ${batchCount}: ${data.length} registros. Total acumulado: ${allData.length}`);
      hasMore = data.length === batchSize;
      offset += batchSize;
    }
  }
  
  console.log(`Total de ${allData.length} registros carregados em ${batchCount} lotes`);
  return allData;
};

/**
 * Busca dados KPI das tabelas de faturamento e pedidos
 * Implementação independente sem vínculo entre as tabelas
 */
const fetchKpiData = async (filters: {
  startDate: Date | null;
  endDate: Date | null;
  brand: string | null;
  status: string | null;
}): Promise<KpiData> => {
  try {
    // Converte as datas para strings no formato SQL
    const startDateStr = filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : '';
    const endDateStr = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : '';

    console.log(`Buscando dados KPI de ${startDateStr} até ${endDateStr}`);
    
    // Define os status válidos para filtrar
    const validStatuses = ['0', '1', '2', '3'];
    const statusFilter = filters.status && filters.status !== 'all' 
      ? [filters.status]
      : validStatuses;
    
    // Buscar dados de pedidos com os filtros aplicados usando batch fetching
    const fetchOrderBatch = (offset: number, limit: number) => {
      let pedidosQuery = supabase
        .from('BLUEBAY_PEDIDO')
        .select('*')
        .in('STATUS', statusFilter)
        .gte('DATA_PEDIDO', startDateStr)
        .lte('DATA_PEDIDO', `${endDateStr}T23:59:59`)
        .not('DATA_PEDIDO', 'is', null)
        .range(offset, offset + limit - 1);
      
      // Aplicar filtro de marca apenas se especificado, mas sem vinculo entre tabelas
      if (filters.brand && filters.brand !== 'all') {
        pedidosQuery = pedidosQuery.eq('CENTROCUSTO', filters.brand);
      }
      
      return pedidosQuery;
    };
    
    const orderData = await fetchInBatches<BluebayPedidoItem>(fetchOrderBatch);
    console.log(`Total de registros de pedidos recuperados: ${orderData?.length || 0}`);

    // Buscar dados de faturamento em lotes, sem vincular à tabela de pedidos
    const fetchBillingBatch = (offset: number, limit: number) => {
      return supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('*')
        .eq('TIPO', 'S') // Somente dados de vendas
        .gte('DATA_EMISSAO', startDateStr)
        .lte('DATA_EMISSAO', `${endDateStr}T23:59:59`)
        .range(offset, offset + limit - 1);
    };
    
    const billingData = await fetchInBatches<BluebayFaturamentoItem>(fetchBillingBatch);
    console.log(`Total de registros de faturamento recuperados: ${billingData?.length || 0}`);

    // Aplicar filtro de marca para faturamento usando uma abordagem diferente
    // Como não temos CENTROCUSTO em BLUEBAY_FATURAMENTO, vamos filtrar usando o PED_NUMPEDIDO
    // Mas sem depender de um JOIN que possa restringir resultados
    let filteredBillingData = billingData || [];
    
    if (filters.brand && filters.brand !== 'all') {
      // Primeiro, coletamos os números de pedido da marca desejada
      const brandPedidos = new Set();
      orderData?.forEach(order => {
        if (order.CENTROCUSTO === filters.brand) {
          // Criamos uma chave única para identificar o pedido
          const pedidoKey = `${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`;
          brandPedidos.add(pedidoKey);
        }
      });
      
      // Filtramos o faturamento pelos números de pedido da marca desejada
      filteredBillingData = billingData?.filter(billing => {
        if (!billing.PED_NUMPEDIDO || !billing.PED_ANOBASE) return false;
        const billingPedidoKey = `${billing.PED_NUMPEDIDO}-${billing.PED_ANOBASE}`;
        return brandPedidos.has(billingPedidoKey);
      }) || [];
      
      console.log(`Após filtro de marca, restaram ${filteredBillingData.length} registros de faturamento`);
    }

    // Processa e sumariza dados - usando cálculo correto (QTDE_PEDIDA * VALOR_UNITARIO)
    const totalOrders = (orderData || []).reduce((sum, item) => {
      const value = (item.QTDE_PEDIDA || 0) * (item.VALOR_UNITARIO || 0);
      return sum + parseFloat(value.toString());
    }, 0);

    const orderedPieces = (orderData || []).reduce((sum, item) => {
      const qty = item.QTDE_PEDIDA || 0;
      return sum + parseFloat(qty.toString());
    }, 0);

    // Calculando o total faturado usando QUANTIDADE * VALOR_UNITARIO
    const totalBilled = filteredBillingData.reduce((sum, item) => {
      const quantidade = parseFloat((item.QUANTIDADE || 0).toString());
      const valorUnitario = parseFloat((item.VALOR_UNITARIO || 0).toString());
      return sum + (quantidade * valorUnitario);
    }, 0);

    const billedPieces = filteredBillingData.reduce((sum, item) => {
      const qty = item.QUANTIDADE || 0;
      return sum + parseFloat(qty.toString());
    }, 0);

    // Calcular taxa de conversão
    const conversionRate = totalOrders > 0 ? (totalBilled / totalOrders) * 100 : 0;

    // Calcular médio ponderado de desconto
    const totalBeforeDiscount = filteredBillingData.reduce((sum, item) => {
      const qty = parseFloat((item.QUANTIDADE || 0).toString());
      const unitPrice = parseFloat((item.VALOR_UNITARIO || 0).toString());
      return sum + (qty * unitPrice);
    }, 0);

    const totalDiscount = filteredBillingData.reduce((sum, item) => {
      return sum + parseFloat((item.VALOR_DESCONTO || 0).toString());
    }, 0);

    const averageDiscount = totalBeforeDiscount > 0 ? (totalDiscount / totalBeforeDiscount) * 100 : 0;

    return {
      totalOrders,
      totalBilled,
      conversionRate,
      orderedPieces,
      billedPieces,
      averageDiscount
    };
  } catch (error) {
    console.error('Erro ao calcular dados KPI:', error);
    throw error;
  }
};

/**
 * Busca dados de séries temporais para o dashboard
 * Implementação independente para pedidos e faturamento
 */
const fetchTimeSeriesData = async (filters: {
  startDate: Date | null;
  endDate: Date | null;
  brand: string | null;
  status: string | null;
}): Promise<TimeSeriesData> => {
  try {
    // Converte datas para strings para a consulta
    let startDate = filters.startDate;
    let endDate = filters.endDate;
    
    if (!startDate || !endDate) {
      endDate = new Date();
      startDate = subMonths(endDate, 6);
    }
    
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');
    
    console.log(`Buscando dados de séries temporais de ${startDateStr} até ${endDateStr}`);

    // Define os status válidos para filtrar
    const validStatuses = ['0', '1', '2', '3'];
    const statusFilter = filters.status && filters.status !== 'all' 
      ? [filters.status]
      : validStatuses;
    
    // Obter dados de pedidos com batch fetching
    const fetchOrdersBatch = (offset: number, limit: number) => {
      let pedidosQuery = supabase
        .from('BLUEBAY_PEDIDO')
        .select('*')
        .in('STATUS', statusFilter)
        .gte('DATA_PEDIDO', startDateStr)
        .lte('DATA_PEDIDO', `${endDateStr}T23:59:59`)
        .not('DATA_PEDIDO', 'is', null)
        .range(offset, offset + limit - 1);
      
      // Aplicar filtro de marca apenas se especificado (sem vínculo com faturamento)
      if (filters.brand && filters.brand !== 'all') {
        pedidosQuery = pedidosQuery.eq('CENTROCUSTO', filters.brand);
      }
      
      return pedidosQuery;
    };
    
    const orderData = await fetchInBatches<BluebayPedidoItem>(fetchOrdersBatch);
    console.log(`Total de registros de pedidos para séries temporais: ${orderData?.length || 0}`);

    // Obter dados de faturamento com batch fetching
    const fetchBillingBatch = (offset: number, limit: number) => {
      return supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('*')
        .eq('TIPO', 'S') // Somente vendas
        .gte('DATA_EMISSAO', startDateStr)
        .lte('DATA_EMISSAO', `${endDateStr}T23:59:59`)
        .range(offset, offset + limit - 1);
    };
    
    const allBillingData = await fetchInBatches<BluebayFaturamentoItem>(fetchBillingBatch);
    console.log(`Total de registros de faturamento para séries temporais: ${allBillingData?.length || 0}`);

    // Filtrar o faturamento por marca, se necessário
    let billingData = allBillingData || [];
    
    if (filters.brand && filters.brand !== 'all') {
      // Coletamos os números de pedido da marca selecionada
      const brandPedidos = new Set();
      orderData?.forEach(order => {
        if (order.CENTROCUSTO === filters.brand) {
          const pedidoKey = `${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`;
          brandPedidos.add(pedidoKey);
        }
      });
      
      // Filtramos o faturamento pelos números de pedido da marca
      billingData = allBillingData?.filter(billing => {
        if (!billing.PED_NUMPEDIDO || !billing.PED_ANOBASE) return false;
        const billingPedidoKey = `${billing.PED_NUMPEDIDO}-${billing.PED_ANOBASE}`;
        return brandPedidos.has(billingPedidoKey);
      }) || [];
      
      console.log(`Após filtro de marca, restaram ${billingData.length} registros de faturamento para séries temporais`);
    }

    // Agrupar dados por mês
    const monthlyData = new Map<string, TimeSeriesPoint>();

    // Processar dados de pedidos
    (orderData || []).forEach(order => {
      if (!order.DATA_PEDIDO) return;
      
      const orderDate = typeof order.DATA_PEDIDO === 'string' ? parseISO(order.DATA_PEDIDO) : new Date(order.DATA_PEDIDO);
      const monthKey = format(orderDate, 'yyyy-MM');
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          date: monthKey,
          ordersValue: 0,
          billedValue: 0,
          orderedPieces: 0,
          billedPieces: 0
        });
      }
      
      const monthData = monthlyData.get(monthKey)!;
      // Cálculo correto usando QTDE_PEDIDA * VALOR_UNITARIO
      const orderValue = (order.QTDE_PEDIDA || 0) * (order.VALOR_UNITARIO || 0);
      monthData.ordersValue += parseFloat(orderValue.toString());
      monthData.orderedPieces += parseFloat((order.QTDE_PEDIDA || 0).toString());
    });

    // Processar dados de faturamento
    (billingData || []).forEach(item => {
      if (!item.DATA_EMISSAO) return;
      
      const billingDate = typeof item.DATA_EMISSAO === 'string' ? parseISO(item.DATA_EMISSAO) : new Date(item.DATA_EMISSAO);
      const monthKey = format(billingDate, 'yyyy-MM');
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          date: monthKey,
          ordersValue: 0,
          billedValue: 0,
          orderedPieces: 0,
          billedPieces: 0
        });
      }
      
      const monthData = monthlyData.get(monthKey)!;
      
      // Cálculo correto usando QUANTIDADE * VALOR_UNITARIO
      const quantidade = parseFloat((item.QUANTIDADE || 0).toString());
      const valorUnitario = parseFloat((item.VALOR_UNITARIO || 0).toString());
      monthData.billedValue += quantidade * valorUnitario;
      
      monthData.billedPieces += parseFloat((item.QUANTIDADE || 0).toString());
    });

    // Converter mapa para array e ordenar por data
    const monthlySeries = Array.from(monthlyData.values())
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });

    return { monthlySeries };
  } catch (error) {
    console.error('Erro ao buscar dados de séries temporais:', error);
    throw error;
  }
};

/**
 * Busca dados de todas as marcas (CENTROCUSTO)
 * Implementação independente sem restringir marcas
 */
const fetchBrandData = async (filters: {
  startDate: Date | null;
  endDate: Date | null;
  brand: string | null;
  status: string | null;
  pagination?: {
    brandPagination?: { page: number, pageSize: number };
    noLimits?: boolean;
  };
}): Promise<{data: BrandData, totalCount: number}> => {
  try {
    // Converte datas para strings para a consulta
    const startDateStr = filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : '';
    const endDateStr = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : '';
    
    console.log(`Buscando dados de marcas de ${startDateStr} até ${endDateStr}`);

    // Define os status válidos para filtrar
    const validStatuses = ['0', '1', '2', '3'];
    const statusFilter = filters.status && filters.status !== 'all' 
      ? [filters.status]
      : validStatuses;
    
    // Busca todos os pedidos com batch fetching
    const fetchOrdersBatch = (offset: number, limit: number) => {
      let pedidosQuery = supabase
        .from('BLUEBAY_PEDIDO')
        .select('*')
        .in('STATUS', statusFilter)
        .gte('DATA_PEDIDO', startDateStr)
        .lte('DATA_PEDIDO', `${endDateStr}T23:59:59`)
        .not('CENTROCUSTO', 'is', null)
        .not('DATA_PEDIDO', 'is', null)
        .range(offset, offset + limit - 1);
      
      // Aplicar filtro de marca apenas se especificado
      if (filters.brand && filters.brand !== 'all') {
        pedidosQuery = pedidosQuery.eq('CENTROCUSTO', filters.brand);
      }
      
      return pedidosQuery;
    };
    
    const orderData = await fetchInBatches<BluebayPedidoItem>(fetchOrdersBatch);
    console.log(`Total de registros de pedidos para marcas: ${orderData?.length || 0}`);
    
    // Obtém marcas únicas
    const uniqueBrands = [...new Set(orderData?.map(item => item.CENTROCUSTO))].filter(Boolean) as string[];
    console.log(`Encontradas ${uniqueBrands.length} marcas únicas:`, uniqueBrands);

    // Busca dados de faturamento com batch fetching
    const fetchBillingBatch = (offset: number, limit: number) => {
      return supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('*')
        .eq('TIPO', 'S') // Somente vendas
        .gte('DATA_EMISSAO', startDateStr)
        .lte('DATA_EMISSAO', `${endDateStr}T23:59:59`)
        .range(offset, offset + limit - 1);
    };
    
    const allBillingData = await fetchInBatches<BluebayFaturamentoItem>(fetchBillingBatch);
    console.log(`Total de registros de faturamento para marcas: ${allBillingData?.length || 0}`);

    // Criaremos um mapa de números de pedido por marca para filtrar o faturamento posteriormente
    const pedidosByBrand = new Map<string, Set<string>>();
    
    // Agrupamos os pedidos por marca
    orderData?.forEach(order => {
      const brand = order.CENTROCUSTO || 'Sem Marca';
      if (!pedidosByBrand.has(brand)) {
        pedidosByBrand.set(brand, new Set());
      }
      const pedidoKey = `${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`;
      pedidosByBrand.get(brand)?.add(pedidoKey);
    });

    // Agrupa dados de pedidos por marca usando o cálculo correto (QTDE_PEDIDA * VALOR_UNITARIO)
    const brandOrderMap = new Map<string, { total: number, pieces: number }>();
    
    orderData?.forEach(order => {
      const brand = order.CENTROCUSTO || 'Sem Marca';
      const value = (order.QTDE_PEDIDA || 0) * (order.VALOR_UNITARIO || 0);
      const pieces = parseFloat((order.QTDE_PEDIDA || 0).toString());
      
      if (!brandOrderMap.has(brand)) {
        brandOrderMap.set(brand, { total: 0, pieces: 0 });
      }
      
      const currentData = brandOrderMap.get(brand)!;
      currentData.total += value;
      currentData.pieces += pieces;
    });

    // Calculamos o valor faturado por marca usando os pedidos como referência
    // mas sem restringir a outras marcas
    const brandBillingMap = new Map<string, number>();
    
    // Inicializamos o mapa de faturamento para todas as marcas encontradas
    uniqueBrands.forEach(brand => {
      brandBillingMap.set(brand, 0);
    });
    
    // Processamos o faturamento
    allBillingData?.forEach(item => {
      // Pulamos itens sem número de pedido ou ano base
      if (!item.PED_NUMPEDIDO || !item.PED_ANOBASE) return;
      
      const pedidoKey = `${item.PED_NUMPEDIDO}-${item.PED_ANOBASE}`;
      
      // Verificamos a qual marca pertence esse pedido
      for (const [brand, pedidoSet] of pedidosByBrand.entries()) {
        if (pedidoSet.has(pedidoKey)) {
          // Calculamos o valor faturado
          const quantidade = parseFloat((item.QUANTIDADE || 0).toString());
          const valorUnitario = parseFloat((item.VALOR_UNITARIO || 0).toString());
          const valorFaturado = quantidade * valorUnitario;
          
          // Atualizamos o valor faturado para esta marca
          brandBillingMap.set(brand, (brandBillingMap.get(brand) || 0) + valorFaturado);
          break;  // Um pedido só pertence a uma marca
        }
      }
    });

    // Combina os dados para todas as marcas únicas
    const brandItems: BrandPerformanceItem[] = [];
    
    // Processa todas as marcas únicas
    uniqueBrands.forEach(brand => {
      // Pula se o filtro de marca for aplicado e não for esta marca
      if (filters.brand && filters.brand !== 'all' && brand !== filters.brand) {
        return;
      }
      
      const orderData = brandOrderMap.get(brand) || { total: 0, pieces: 0 };
      const totalBilled = brandBillingMap.get(brand) || 0;
      const conversionRate = orderData.total > 0 ? (totalBilled / orderData.total) * 100 : 0;
      
      brandItems.push({
        brand,
        totalOrders: orderData.total,
        totalBilled,
        conversionRate,
        volume: orderData.pieces
      });
    });

    // Ordena por valor faturado
    brandItems.sort((a, b) => b.totalBilled - a.totalBilled);

    // Pagina os resultados se requerido
    let paginatedItems = brandItems;
    if (!filters.pagination?.noLimits && filters.pagination?.brandPagination) {
      const { page, pageSize } = filters.pagination.brandPagination;
      const startIdx = (page - 1) * pageSize;
      const endIdx = startIdx + pageSize;
      paginatedItems = brandItems.slice(startIdx, endIdx);
    }

    return { 
      data: { items: paginatedItems },
      totalCount: uniqueBrands.length
    };
  } catch (error) {
    console.error('Erro ao buscar dados de marcas:', error);
    throw error;
  }
};

/**
 * Busca dados de eficiência de entrega
 * Implementação independente sem restrição por marca
 */
const fetchDeliveryData = async (filters: {
  startDate: Date | null;
  endDate: Date | null;
  brand: string | null;
  status: string | null;
}): Promise<DeliveryData> => {
  try {
    // Converte datas para strings para a consulta
    const startDateStr = filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : '';
    const endDateStr = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : '';
    
    console.log(`Buscando dados de eficiência de entrega de ${startDateStr} até ${endDateStr}`);

    // Define os status válidos para filtrar
    const validStatuses = ['0', '1', '2', '3'];
    const statusFilter = filters.status && filters.status !== 'all' 
      ? [filters.status]
      : validStatuses;
    
    // Busca dados de pedidos com batch fetching
    const fetchOrdersBatch = (offset: number, limit: number) => {
      let pedidosQuery = supabase
        .from('BLUEBAY_PEDIDO')
        .select('*')
        .in('STATUS', statusFilter)
        .gte('DATA_PEDIDO', startDateStr)
        .lte('DATA_PEDIDO', `${endDateStr}T23:59:59`)
        .not('DATA_PEDIDO', 'is', null)
        .range(offset, offset + limit - 1);
      
      // Aplicar filtro de marca apenas se especificado
      if (filters.brand && filters.brand !== 'all') {
        pedidosQuery = pedidosQuery.eq('CENTROCUSTO', filters.brand);
      }
      
      return pedidosQuery;
    };
    
    const orderData = await fetchInBatches<BluebayPedidoItem>(fetchOrdersBatch);
    console.log(`Processando ${orderData?.length || 0} pedidos para análise de eficiência de entrega`);

    // Contadores para análise
    let totalFullyDelivered = 0;
    let totalPartialDelivered = 0;
    let totalOpen = 0;
    let totalItems = 0;
    let totalRemainingQuantity = 0;

    // Analisa cada pedido
    (orderData || []).forEach(order => {
      // Obtém quantidades
      const qtdePedida = parseFloat((order.QTDE_PEDIDA || 0).toString());
      const qtdeEntregue = parseFloat((order.QTDE_ENTREGUE || 0).toString());
      const qtdeSaldo = parseFloat((order.QTDE_SALDO || 0).toString());
      
      // Incrementa contador total
      totalItems++;
      
      // Acumula quantidade pendente
      totalRemainingQuantity += qtdeSaldo;
      
      // Classifica o item
      if (qtdeSaldo === 0 && qtdeEntregue > 0) {
        // Totalmente entregue
        totalFullyDelivered++;
      } else if (qtdeEntregue > 0 && qtdeSaldo > 0) {
        // Parcialmente entregue
        totalPartialDelivered++;
      } else if (qtdeSaldo > 0 && qtdeEntregue === 0) {
        // Totalmente em aberto
        totalOpen++;
      }
    });

    // Calcula percentuais
    const fullyDeliveredPercentage = totalItems > 0 ? (totalFullyDelivered / totalItems) * 100 : 0;
    const partialPercentage = totalItems > 0 ? (totalPartialDelivered / totalItems) * 100 : 0;
    const openPercentage = totalItems > 0 ? (totalOpen / totalItems) * 100 : 0;
    const averageRemainingQuantity = totalItems > 0 ? totalRemainingQuantity / totalItems : 0;

    return {
      fullyDeliveredPercentage,
      partialPercentage,
      openPercentage,
      averageRemainingQuantity
    };
  } catch (error) {
    console.error('Erro ao buscar dados de eficiência de entrega:', error);
    throw error;
  }
};
