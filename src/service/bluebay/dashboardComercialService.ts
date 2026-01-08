
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { fetchInBatches } from "./utils/batchFetchUtils";
import { processarDadosFaturamento } from "./utils/faturamentoDataUtils";
import { normalizeValue, createCompositeKey } from "./utils/matchingUtils";
import { DashboardComercialData, FaturamentoItem, PedidoItem } from "./dashboardComercialTypes";

/**
 * Encontra um pedido correspondente a um item de faturamento
 * usando uma estratégia em múltiplas etapas para melhorar a correspondência
 */
const encontrarPedidoCorrespondente = (faturamento: any, pedidos: PedidoItem[]): PedidoItem | null => {
  if (!faturamento.PED_NUMPEDIDO || !faturamento.PED_ANOBASE) return null;

  // Estratégia 1: Match completo com todas as chaves (mais preciso)
  const pedidoCompleto = pedidos.find(p => 
    normalizeValue(p.PED_NUMPEDIDO) === normalizeValue(faturamento.PED_NUMPEDIDO) &&
    normalizeValue(p.PED_ANOBASE) === normalizeValue(faturamento.PED_ANOBASE) &&
    normalizeValue(p.MPED_NUMORDEM) === normalizeValue(faturamento.MPED_NUMORDEM) &&
    normalizeValue(p.ITEM_CODIGO) === normalizeValue(faturamento.ITEM_CODIGO)
  );
  
  if (pedidoCompleto) return pedidoCompleto;

  // Estratégia 2: Match sem considerar ITEM_CODIGO (casos onde o item pode ser diferente)
  const pedidoSemItem = pedidos.find(p => 
    normalizeValue(p.PED_NUMPEDIDO) === normalizeValue(faturamento.PED_NUMPEDIDO) &&
    normalizeValue(p.PED_ANOBASE) === normalizeValue(faturamento.PED_ANOBASE) &&
    normalizeValue(p.MPED_NUMORDEM) === normalizeValue(faturamento.MPED_NUMORDEM)
  );
  
  if (pedidoSemItem) return pedidoSemItem;

  // Estratégia 3: Match só com PED_NUMPEDIDO e PED_ANOBASE (fallback)
  const pedidoSimplesMatch = pedidos.find(p => 
    normalizeValue(p.PED_NUMPEDIDO) === normalizeValue(faturamento.PED_NUMPEDIDO) &&
    normalizeValue(p.PED_ANOBASE) === normalizeValue(faturamento.PED_ANOBASE)
  );

  return pedidoSimplesMatch || null;
};

/**
 * Busca dados de faturamento para o dashboard comercial
 * Versão otimizada que consulta pedidos e faturamento de forma independente
 * exceto quando houver filtro de centro de custo
 */
export const fetchDashboardComercialData = async (
  startDate: Date | null,
  endDate: Date | null,
  centroCusto?: string | null
): Promise<DashboardComercialData> => {
  try {
    // Converte as datas para strings no formato SQL
    const startDateStr = startDate ? format(startDate, 'yyyy-MM-dd') : '';
    const endDateStr = endDate ? format(endDate, 'yyyy-MM-dd') : '';

    console.log(`Buscando dados de dashboard comercial de ${startDateStr} até ${endDateStr}`);
    if (centroCusto) {
      console.log(`Filtrando por centro de custo: ${centroCusto}`);
    }
    
    // Formatar datas para consulta
    const formattedStartDate = `${startDateStr}T00:00:00.000`;
    const formattedEndDate = `${endDateStr}T23:59:59.999`;
    
    let faturamentoItems: FaturamentoItem[] = [];
    let pedidoItems: PedidoItem[] = [];

    // Caso especial: quando o filtro é "Não identificado", precisamos buscar todos os 
    // faturamentos e depois filtrar os não associados a pedidos
    if (centroCusto === "Não identificado") {
      console.log("Buscando faturamentos sem centro de custo associado");
      
      // Buscar todos os faturamentos no período
      faturamentoItems = await fetchInBatches<FaturamentoItem>(
        async (offset, limit) => {
          return supabase
            .from('BLUEBAY_FATURAMENTO')
            .select('*')
            .gte('DATA_EMISSAO', formattedStartDate)
            .lte('DATA_EMISSAO', formattedEndDate)
            .range(offset, offset + limit - 1);
        },
        1000
      );
      
      console.log(`Encontrados ${faturamentoItems.length} registros de faturamento para verificação`);
      
      // Buscar todos os pedidos para poder associar e encontrar os "não identificados"
      const todosOsPedidos = await fetchInBatches<PedidoItem>(
        async (offset, limit) => {
          return supabase
            .from('BLUEBAY_PEDIDO')
            .select('*')
            .gte('DATA_PEDIDO', formattedStartDate)
            .lte('DATA_PEDIDO', formattedEndDate)
            .range(offset, offset + limit - 1);
        },
        1000
      );
      
      console.log(`Encontrados ${todosOsPedidos.length} pedidos para associação`);
      
      // Criar um Map de pedidos indexados por chave composta para busca rápida
      const pedidosMap = new Map<string, PedidoItem>();
      todosOsPedidos.forEach(pedido => {
        // Criar múltiplas chaves para cada pedido para permitir diferentes estratégias de match
        if (pedido.PED_NUMPEDIDO && pedido.PED_ANOBASE) {
          // Chave com todos os campos
          const chaveCompleta = createCompositeKey(pedido);
          pedidosMap.set(chaveCompleta, pedido);
          
          // Chave sem item_codigo
          const chaveSemItem = `${normalizeValue(pedido.PED_NUMPEDIDO)}|${normalizeValue(pedido.PED_ANOBASE)}|${normalizeValue(pedido.MPED_NUMORDEM)}|`;
          pedidosMap.set(chaveSemItem, pedido);
          
          // Chave simplificada apenas com número de pedido e ano
          const chaveSimples = `${normalizeValue(pedido.PED_NUMPEDIDO)}|${normalizeValue(pedido.PED_ANOBASE)}||`;
          pedidosMap.set(chaveSimples, pedido);
        }
      });
      
      // Filtrar apenas os faturamentos que não têm pedido correspondente ou que não possuem centro de custo
      const naoIdentificados = faturamentoItems.filter(faturamento => {
        // Se não tiver número de pedido, é não identificado
        if (!faturamento.PED_NUMPEDIDO || !faturamento.PED_ANOBASE) return true;
        
        // Tentar encontrar pedido correspondente
        let pedidoCorrespondente: PedidoItem | undefined;
        
        // Verificar com a chave composta
        const chaveCompleta = createCompositeKey(faturamento);
        pedidoCorrespondente = pedidosMap.get(chaveCompleta);
        
        if (!pedidoCorrespondente) {
          // Verificar com chave sem item
          const chaveSemItem = `${normalizeValue(faturamento.PED_NUMPEDIDO)}|${normalizeValue(faturamento.PED_ANOBASE)}|${normalizeValue(faturamento.MPED_NUMORDEM)}|`;
          pedidoCorrespondente = pedidosMap.get(chaveSemItem);
        }
        
        if (!pedidoCorrespondente) {
          // Verificar com chave simples
          const chaveSimples = `${normalizeValue(faturamento.PED_NUMPEDIDO)}|${normalizeValue(faturamento.PED_ANOBASE)}||`;
          pedidoCorrespondente = pedidosMap.get(chaveSimples);
        }
        
        // Se não encontrou pedido OU o pedido não tem centro de custo, é "não identificado"
        return !pedidoCorrespondente || !pedidoCorrespondente.CENTROCUSTO;
      });
      
      // Atualizar faturamentoItems para conter apenas os não identificados
      faturamentoItems = naoIdentificados;
      console.log(`Encontrados ${faturamentoItems.length} registros de faturamento sem centro de custo identificado`);
      
      // Os pedidos ficam vazios, já que "Não identificado" significa que não há pedido correspondente
      pedidoItems = [];
    }
    // Caso 1: Se houver filtro de centro de custo (diferente de "Não identificado"), 
    // fazemos primeiramente a busca de pedidos e depois buscamos o faturamento correspondente
    else if (centroCusto) {
      console.log("Buscando pedidos filtrados por centro de custo:", centroCusto);
      
      // 1. Primeiro, buscar os pedidos do centro de custo específico 
      pedidoItems = await fetchInBatches<PedidoItem>(
        async (offset, limit) => {
          return supabase
            .from('BLUEBAY_PEDIDO')
            .select('*')
            .eq('CENTROCUSTO', centroCusto)
            .gte('DATA_PEDIDO', formattedStartDate)
            .lte('DATA_PEDIDO', formattedEndDate)
            .range(offset, offset + limit - 1);
        },
        1000 // tamanho do lote, irá buscar em lotes de 1000
      );
      
      console.log(`Encontrados ${pedidoItems.length} pedidos do centro de custo ${centroCusto}`);
      
      // 2. Extrair os números de pedido para buscar os faturamentos correspondentes
      if (pedidoItems.length > 0) {
        // Criar um Map de pedidos indexados por chave composta para busca rápida
        const pedidosMap = new Map<string, PedidoItem>();
        pedidoItems.forEach(pedido => {
          // Criar múltiplas chaves para cada pedido para permitir diferentes estratégias de match
          const chaveCompleta = createCompositeKey(pedido);
          const chaveSemItem = `${normalizeValue(pedido.PED_NUMPEDIDO)}|${normalizeValue(pedido.PED_ANOBASE)}|${normalizeValue(pedido.MPED_NUMORDEM)}|`;
          const chaveSimples = `${normalizeValue(pedido.PED_NUMPEDIDO)}|${normalizeValue(pedido.PED_ANOBASE)}||`;
          
          pedidosMap.set(chaveCompleta, pedido);
          pedidosMap.set(chaveSemItem, pedido);
          pedidosMap.set(chaveSimples, pedido);
        });
        
        // Buscar faturamentos relacionados por lotes de critérios de pedidos
        const buscarFaturamentosPorLoteDePedidos = async () => {
          const resultado: FaturamentoItem[] = [];
          // Processar em lotes de 50 pedidos para não sobrecarregar o filtro or()
          const tamanhoBatch = 50;
          
          for (let i = 0; i < pedidoItems.length; i += tamanhoBatch) {
            const lotePedidos = pedidoItems.slice(i, i + tamanhoBatch);
            
            console.log(`Buscando faturamentos para lote de ${lotePedidos.length} pedidos (${i+1} até ${Math.min(i + tamanhoBatch, pedidoItems.length)} de ${pedidoItems.length})`);
            
            // Executar consultas em paralelo para cada pedido no lote
            const faturamentosPromises = lotePedidos.map(pedido => 
              supabase
                .from('BLUEBAY_FATURAMENTO')
                .select('*')
                .eq('PED_NUMPEDIDO', pedido.PED_NUMPEDIDO)
                .eq('PED_ANOBASE', pedido.PED_ANOBASE)
                .eq('MPED_NUMORDEM', pedido.MPED_NUMORDEM)
                .gte('DATA_EMISSAO', formattedStartDate)
                .lte('DATA_EMISSAO', formattedEndDate)
            );
            
            const faturamentosResponses = await Promise.all(faturamentosPromises);
            
            // Processar os resultados e associar aos pedidos correspondentes
            faturamentosResponses.forEach((response, index) => {
              const pedido = lotePedidos[index];
              
              if (response.error) {
                console.error(`Erro ao buscar faturamentos para pedido ${pedido.PED_NUMPEDIDO}:`, response.error);
                return;
              }
              
              if (response.data && response.data.length > 0) {
                // Enriquece cada faturamento com os dados do pedido correspondente
                const faturamentosEnriquecidos = response.data.map(faturamento => {
                  const itemEnriquecido: FaturamentoItem = {
                    ...faturamento,
                    CENTROCUSTO: pedido.CENTROCUSTO || null,
                    CENTRO_CUSTO: pedido.CENTRO_CUSTO || pedido.CENTROCUSTO || null,
                    DATA_PEDIDO: pedido.DATA_PEDIDO || null,
                    REPRESENTANTE: pedido.REPRESENTANTE || null,
                    // Adicionar o pedido completo como uma propriedade para acesso fácil
                    pedido: pedido
                  };
                  
                  return itemEnriquecido;
                });
                
                resultado.push(...faturamentosEnriquecidos);
                console.log(`Adicionados ${faturamentosEnriquecidos.length} faturamentos para o pedido ${pedido.PED_NUMPEDIDO}`);
              }
            });
          }
          
          return resultado;
        };
        
        // Executar a busca em lotes
        faturamentoItems = await buscarFaturamentosPorLoteDePedidos();
        console.log(`Total de ${faturamentoItems.length} itens de faturamento encontrados para pedidos do centro de custo ${centroCusto}`);
      }
    } 
    // Caso 2: Sem filtro de centro de custo, consultamos as tabelas independentemente
    else {
      console.log("Realizando consultas independentes para FATURAMENTO e PEDIDO");
      
      // 1. Buscar dados de faturamento usando fetchInBatches para evitar limitação
      faturamentoItems = await fetchInBatches<FaturamentoItem>(
        async (offset, limit) => {
          return supabase
            .from('BLUEBAY_FATURAMENTO')
            .select('*')
            .gte('DATA_EMISSAO', formattedStartDate)
            .lte('DATA_EMISSAO', formattedEndDate)
            .range(offset, offset + limit - 1);
        },
        1000 // tamanho do lote, irá buscar em lotes de 1000
      );
      
      console.log(`Encontrados ${faturamentoItems.length} registros de faturamento`);

      // 2. Buscar dados de pedidos usando fetchInBatches
      pedidoItems = await fetchInBatches<PedidoItem>(
        async (offset, limit) => {
          return supabase
            .from('BLUEBAY_PEDIDO')
            .select('*')
            .gte('DATA_PEDIDO', formattedStartDate)
            .lte('DATA_PEDIDO', formattedEndDate)
            .range(offset, offset + limit - 1);
        },
        1000 // tamanho do lote
      );
      
      console.log(`Encontrados ${pedidoItems.length} registros de pedidos`);
      
      // 3. Enriquecer os dados de faturamento com informações de pedidos
      console.log("Enriquecendo os dados de faturamento com informações de pedidos...");
      
      // Criar um Map de pedidos indexados por chave composta para busca rápida
      const pedidosMap = new Map<string, PedidoItem>();
      pedidoItems.forEach(pedido => {
        // Criar múltiplas chaves para cada pedido para permitir diferentes estratégias de match
        if (pedido.PED_NUMPEDIDO && pedido.PED_ANOBASE) {
          // Chave com todos os campos
          const chaveCompleta = createCompositeKey(pedido);
          pedidosMap.set(chaveCompleta, pedido);
          
          // Chave sem item_codigo
          const chaveSemItem = `${normalizeValue(pedido.PED_NUMPEDIDO)}|${normalizeValue(pedido.PED_ANOBASE)}|${normalizeValue(pedido.MPED_NUMORDEM)}|`;
          pedidosMap.set(chaveSemItem, pedido);
          
          // Chave simplificada apenas com número de pedido e ano
          const chaveSimples = `${normalizeValue(pedido.PED_NUMPEDIDO)}|${normalizeValue(pedido.PED_ANOBASE)}||`;
          pedidosMap.set(chaveSimples, pedido);
        }
      });
      
      // Processar cada faturamento em lotes para não sobrecarregar a memória
      const BATCH_SIZE = 1000;
      for (let i = 0; i < faturamentoItems.length; i += BATCH_SIZE) {
        const batchEnd = Math.min(i + BATCH_SIZE, faturamentoItems.length);
        console.log(`Processando lote de faturamentos ${i+1} a ${batchEnd} de ${faturamentoItems.length}`);
        
        for (let j = i; j < batchEnd; j++) {
          const faturamento = faturamentoItems[j];
          
          // Tentar encontrar o pedido usando as diferentes chaves
          if (faturamento.PED_NUMPEDIDO && faturamento.PED_ANOBASE) {
            // Tenta com a chave completa primeiro
            let pedidoCorrespondente: PedidoItem | undefined;
            
            const chaveCompleta = createCompositeKey(faturamento);
            pedidoCorrespondente = pedidosMap.get(chaveCompleta);
            
            if (!pedidoCorrespondente) {
              // Tenta com chave sem item_codigo
              const chaveSemItem = `${normalizeValue(faturamento.PED_NUMPEDIDO)}|${normalizeValue(faturamento.PED_ANOBASE)}|${normalizeValue(faturamento.MPED_NUMORDEM)}|`;
              pedidoCorrespondente = pedidosMap.get(chaveSemItem);
            }
            
            if (!pedidoCorrespondente) {
              // Último recurso: tenta só com número de pedido e ano
              const chaveSimples = `${normalizeValue(faturamento.PED_NUMPEDIDO)}|${normalizeValue(faturamento.PED_ANOBASE)}||`;
              pedidoCorrespondente = pedidosMap.get(chaveSimples);
            }
            
            if (pedidoCorrespondente) {
              // Adiciona as informações do pedido ao faturamento
              faturamento.CENTROCUSTO = pedidoCorrespondente.CENTROCUSTO || null;
              faturamento.CENTRO_CUSTO = pedidoCorrespondente.CENTRO_CUSTO || pedidoCorrespondente.CENTROCUSTO || null;
              faturamento.DATA_PEDIDO = pedidoCorrespondente.DATA_PEDIDO || null;
              faturamento.REPRESENTANTE = pedidoCorrespondente.REPRESENTANTE || null;
              faturamento.pedido = pedidoCorrespondente;
            }
          }
        }
      }
    }

    console.log(`Total de registros recuperados: ${faturamentoItems.length} faturamentos e ${pedidoItems.length} pedidos`);

    // Processar os dados de faturamento para gerar os agregados
    const {
      dailyFaturamento,
      monthlyFaturamento,
      totalFaturado,
      totalItens,
      mediaValorItem,
      minDate,
      maxDate
    } = processarDadosFaturamento(faturamentoItems, pedidoItems);

    // Considerar dados completos se houver pelo menos algum dado
    const hasCompleteData = faturamentoItems.length > 0 || pedidoItems.length > 0;

    // Retornar os dados processados
    const returnData: DashboardComercialData = {
      dailyFaturamento,
      monthlyFaturamento,
      totalFaturado,
      totalItens,
      mediaValorItem,
      faturamentoItems,
      pedidoItems,
      dataRangeInfo: {
        startDateRequested: startDateStr,
        endDateRequested: endDateStr,
        startDateActual: minDate ? format(minDate, 'yyyy-MM-dd') : null,
        endDateActual: maxDate ? format(maxDate, 'yyyy-MM-dd') : null,
        hasCompleteData
      }
    };

    return returnData;
  } catch (error) {
    console.error('Erro ao buscar dados de dashboard comercial:', error);
    throw error;
  }
};
