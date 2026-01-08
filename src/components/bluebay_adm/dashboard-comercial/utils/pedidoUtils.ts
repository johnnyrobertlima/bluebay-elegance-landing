
import { FaturamentoItem, PedidoItem } from '@/services/bluebay/dashboardComercialTypes';

/**
 * Normaliza valores antes da comparação, tratando nulos e indefinidos
 */
export const normalizeValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

/**
 * Encontra um pedido correspondente a um item de faturamento
 * usando uma estratégia em três etapas para melhorar a correspondência
 */
export const encontrarPedidoCorrespondente = (item: any, pedidos: any[]) => {
  if (!item.PED_NUMPEDIDO || !item.PED_ANOBASE) return null;

  const itemNumPedido = normalizeValue(item.PED_NUMPEDIDO);
  const itemAnoBase = normalizeValue(item.PED_ANOBASE);
  
  // Primeiro, tentamos com correspondência completa (PED_NUMPEDIDO, PED_ANOBASE e MPED_NUMORDEM)
  if (item.MPED_NUMORDEM !== null && item.MPED_NUMORDEM !== undefined) {
    const itemNumOrdem = normalizeValue(item.MPED_NUMORDEM);
    
    const pedidoCompleto = pedidos.find(p => 
      normalizeValue(p.PED_NUMPEDIDO) === itemNumPedido &&
      normalizeValue(p.PED_ANOBASE) === itemAnoBase &&
      normalizeValue(p.MPED_NUMORDEM) === itemNumOrdem
    );
    
    if (pedidoCompleto) return pedidoCompleto;
  }

  // Segunda tentativa - PED_NUMPEDIDO e PED_ANOBASE (sem MPED_NUMORDEM)
  // CORREÇÃO: Garantir que o valor de PED_ANOBASE seja comparado de forma consistente
  const pedidoSemNumOrdem = pedidos.find(p => 
    normalizeValue(p.PED_NUMPEDIDO) === itemNumPedido &&
    normalizeValue(p.PED_ANOBASE) === itemAnoBase
  );

  if (pedidoSemNumOrdem) return pedidoSemNumOrdem;

  // Última tentativa - flexibilizar um pouco para casos potenciais de inconsistência de tipos
  const pedidoFallback = pedidos.find(p => {
    const pNumPedido = normalizeValue(p.PED_NUMPEDIDO);
    const pAnoBase = normalizeValue(p.PED_ANOBASE);
    
    return pNumPedido === itemNumPedido && pAnoBase === itemAnoBase;
  });

  return pedidoFallback;
};

/**
 * Processa dados de faturamento e pedidos para gerar indicadores por centro de custo
 */
export interface CentroCustoData {
  nome: string;
  totalFaturado: number;
  totalItensFaturados: number;
  ticketMedioFaturado: number;
  totalPedidos: number;
  totalItensPedidos: number;
}

export const processarIndicadoresCentroCusto = (
  faturamentoItems: FaturamentoItem[], 
  pedidoItems: PedidoItem[]
): CentroCustoData[] => {
  const centroCustoMap = new Map<string, CentroCustoData>();
  
  // Criar mapa de faturamento usando chave composta de PED_NUMPEDIDO e PED_ANOBASE
  const faturamentoPorPedido = new Map<string, FaturamentoItem[]>();
  faturamentoItems.forEach(item => {
    if (!item.PED_NUMPEDIDO || !item.PED_ANOBASE) return;
    
    // CORREÇÃO: Usar chave composta que inclui PED_ANOBASE
    const pedidoKey = `${normalizeValue(item.PED_NUMPEDIDO)}-${normalizeValue(item.PED_ANOBASE)}-${normalizeValue(item.MPED_NUMORDEM || '')}`;
    if (!faturamentoPorPedido.has(pedidoKey)) {
      faturamentoPorPedido.set(pedidoKey, []);
    }
    faturamentoPorPedido.get(pedidoKey)?.push(item);
  });
  
  // Processar dados de pedidos
  pedidoItems.forEach(item => {
    const centroCusto = item.CENTROCUSTO || 'Não identificado';
    
    if (!centroCustoMap.has(centroCusto)) {
      centroCustoMap.set(centroCusto, {
        nome: centroCusto,
        totalFaturado: 0,
        totalItensFaturados: 0,
        ticketMedioFaturado: 0,
        totalPedidos: 0,
        totalItensPedidos: 0
      });
    }
    
    const data = centroCustoMap.get(centroCusto)!;
    
    // Acumular valores de pedidos
    const valorPedido = (item.QTDE_PEDIDA || 0) * (item.VALOR_UNITARIO || 0);
    data.totalPedidos += valorPedido;
    data.totalItensPedidos += item.QTDE_PEDIDA || 0;
    
    // CORREÇÃO: Usar chave composta para buscar faturamento relacionado
    const pedidoKey = `${normalizeValue(item.PED_NUMPEDIDO)}-${normalizeValue(item.PED_ANOBASE)}-${normalizeValue(item.MPED_NUMORDEM || '')}`;
    const simplePedidoKey = `${normalizeValue(item.PED_NUMPEDIDO)}-${normalizeValue(item.PED_ANOBASE)}-`;
    
    const faturamentos = faturamentoPorPedido.get(pedidoKey) || faturamentoPorPedido.get(simplePedidoKey) || [];
    
    // Acumular valores de faturamento relacionados a este pedido
    faturamentos.forEach(fatItem => {
      data.totalFaturado += fatItem.VALOR_NOTA || 0;
      data.totalItensFaturados += fatItem.QUANTIDADE || 0;
    });
  });
  
  // Processar notas fiscais sem pedidos associados (não identificado)
  const pedidosProcessados = new Set<string>();
  
  // Marcar todos os pedidos já processados usando chave composta
  pedidoItems.forEach(item => {
    if (!item.PED_NUMPEDIDO || !item.PED_ANOBASE) return;
    
    // CORREÇÃO: Usar chaves compostas para rastrear pedidos processados
    const pedidoKeyFull = `${normalizeValue(item.PED_NUMPEDIDO)}-${normalizeValue(item.PED_ANOBASE)}-${normalizeValue(item.MPED_NUMORDEM || '')}`;
    const pedidoKeySimple = `${normalizeValue(item.PED_NUMPEDIDO)}-${normalizeValue(item.PED_ANOBASE)}-`;
    
    pedidosProcessados.add(pedidoKeyFull);
    pedidosProcessados.add(pedidoKeySimple);
  });
  
  // Verificar notas fiscais sem pedidos associados e atribuir ao "Não identificado"
  faturamentoItems.forEach(item => {
    // Casos em que a nota não tem referência a pedido
    if (!item.PED_NUMPEDIDO || !item.PED_ANOBASE) {
      const centroCusto = 'Não identificado';
      
      if (!centroCustoMap.has(centroCusto)) {
        centroCustoMap.set(centroCusto, {
          nome: centroCusto,
          totalFaturado: 0,
          totalItensFaturados: 0,
          ticketMedioFaturado: 0,
          totalPedidos: 0,
          totalItensPedidos: 0
        });
      }
      
      const data = centroCustoMap.get(centroCusto)!;
      data.totalFaturado += item.VALOR_NOTA || 0;
      data.totalItensFaturados += item.QUANTIDADE || 0;
      return;
    }
    
    // CORREÇÃO: Usar a função encontrarPedidoCorrespondente que agora usa ambos os campos
    const pedidoCorrespondente = encontrarPedidoCorrespondente(item, pedidoItems);
    
    if (!pedidoCorrespondente) {
      // Este item de faturamento não tem pedido correspondente
      const centroCusto = 'Não identificado';
      
      if (!centroCustoMap.has(centroCusto)) {
        centroCustoMap.set(centroCusto, {
          nome: centroCusto,
          totalFaturado: 0,
          totalItensFaturados: 0,
          ticketMedioFaturado: 0,
          totalPedidos: 0,
          totalItensPedidos: 0
        });
      }
      
      const data = centroCustoMap.get(centroCusto)!;
      data.totalFaturado += item.VALOR_NOTA || 0;
      data.totalItensFaturados += item.QUANTIDADE || 0;
    }
  });
  
  // Calcular ticket médio para cada centro de custo
  centroCustoMap.forEach(data => {
    data.ticketMedioFaturado = data.totalItensFaturados > 0 ? 
      data.totalFaturado / data.totalItensFaturados : 0;
  });
  
  // Converter Map para array e ordenar por nome
  return Array.from(centroCustoMap.values())
    .sort((a, b) => a.nome.localeCompare(b.nome));
};
