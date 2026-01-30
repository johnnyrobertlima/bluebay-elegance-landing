
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from 'date-fns';
import { DashboardComercialData, DashboardComercialStats, FaturamentoItem } from "./dashboardComercialTypes";

/**
 * Busca estatísticas agregadas para os gráficos e KPIs (Rápido)
 */
export const fetchDashboardStats = async (
  startDate: Date,
  endDate: Date,
  centroCusto: string | null = null,
  representative: string[] = [],
  cliente: string[] = [],
  produto: string[] = [],
  signal?: AbortSignal
): Promise<Partial<DashboardComercialData>> => {
  // If we have complex filters (Clients, Products, or MULTIPLE Representatives), usage Manual Calc.
  // Standard RPC only supports 1 representative and no client/product filters currently.
  const hasMultipleReps = representative && representative.length > 1;
  const hasClientFilter = cliente && cliente.length > 0;
  const hasProductFilter = produto && produto.length > 0;

  if (hasClientFilter || hasProductFilter || hasMultipleReps) {
    return calcDashboardStatsManual(startDate, endDate, centroCusto, representative, cliente, produto);
  }

  // Single Rep or No Rep -> Try RPC
  const singleRep = (representative && representative.length === 1) ? representative[0] : null;

  try {
    const formattedStartDate = format(startDate, 'yyyy-MM-dd 00:00:00');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd 23:59:59');

    console.log(`[SERVICE] Buscando estatísticas via RPC: ${formattedStartDate} até ${formattedEndDate}`);
    console.log(`[SERVICE] Params -> CostCenter: ${centroCusto}, Rep: ${singleRep}`);

    const { data: stats, error: statsError } = await supabase.rpc('get_commercial_dashboard_stats_v3', {
      p_start_date: formattedStartDate,
      p_end_date: formattedEndDate,
      p_centro_custo: centroCusto && centroCusto !== "none" ? centroCusto : null,
      p_representante: singleRep && singleRep !== "none" ? singleRep : null
      // p_cliente and p_produto are not supported by this RPC version
    });

    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    if (statsError) {
      console.error('[SERVICE] Erro no RPC get_commercial_dashboard_stats:', statsError);
      throw statsError;
    }

    console.log('[SERVICE] RPC Response RAW:', JSON.stringify(stats));

    // Handle potential array wrapping from Supabase in some contexts
    let rawStats = stats as any;
    if (Array.isArray(rawStats) && rawStats.length > 0) {
      // ... existing code ...
    }

    console.log('[SERVICE_DEBUG] RPC Totals Keys:', Object.keys(rawStats?.totals || {}));
    console.log('[SERVICE_DEBUG] RPC Totals Values:', rawStats?.totals);

    // Ensure rawStats is an object
    if (!rawStats || typeof rawStats !== 'object') {
      console.warn('[SERVICE] RPC returned invalid format:', rawStats);
      rawStats = { daily: [], totals: {}, costCenters: [], representatives: [], monthly: [] };
    }

    const rawDaily = rawStats.daily || [];

    // Map direct RPC results to DailyFaturamento (RPC already aggregates by date)
    const mergedDaily = rawDaily.map((row: any) => ({
      date: typeof row.date === 'string' ? row.date.split('T')[0] : format(new Date(row.date), 'yyyy-MM-dd'),
      formattedDate: row.formattedDate || format(parseISO(row.date), 'dd/MM/yyyy'),
      total: Number(row.total || row.total_faturado) || 0,
      pedidoTotal: Number(row.pedidoTotal || row.pedido_total) || 0,
      faturamentoCount: Number(row.faturamentoCount || row.faturamento_count) || 0,
      pedidoCount: Number(row.pedidoCount || row.pedido_count) || 0
    })).sort((a: any, b: any) =>
      (b.date || "").localeCompare(a.date || "")
    );

    const { totals, costCenters, monthly, representatives } = rawStats;

    // Fetch Representative Names
    let processedRepresentatives = representatives || [];
    if (representatives && representatives.length > 0) {
      const repIds = representatives.map((r: any) => r.id).filter((id: any) => id && id !== '0');

      if (repIds.length > 0) {
        const { data: peopleData } = await supabase
          .from('BLUEBAY_PESSOA')
          .select('PES_CODIGO, APELIDO')
          .in('PES_CODIGO', repIds);

        const nameMap = new Map<string, string>();
        if (peopleData) {
          peopleData.forEach((p: any) => {
            nameMap.set(String(p.PES_CODIGO), p.APELIDO || `Rep ${p.PES_CODIGO}`);
          });
        }

        processedRepresentatives = representatives.map((r: any) => ({
          ...r,
          nome: r.id === '0' || !r.id ? 'Não identificado' : (nameMap.get(String(r.id)) || `Rep ${r.id}`)
        }));
      }
    }

    return {
      dailyFaturamento: mergedDaily,
      monthlyFaturamento: monthly || [],
      totalFaturado: totals?.totalFaturado || 0,
      totalItens: totals?.totalItens || 0,
      mediaValorItem: totals?.mediaValorItem || 0,
      totals: {
        totalFaturado: totals?.totalFaturado || 0,
        totalItens: totals?.totalItens || 0,
        mediaValorItem: totals?.mediaValorItem || 0,
        totalPedidosValue: totals?.totalPedidosValue || mergedDaily.reduce((acc: number, d: any) => acc + (Number(d.pedidoTotal) || 0), 0),
        totalPedidosQty: totals?.totalPedidosQty || mergedDaily.reduce((acc: number, d: any) => acc + (Number(d.pedidoCount) || 0), 0),
        totalPedidosCount: totals?.totalPedidosCount, // Added
        totalPotencialPerdido: totals?.totalPotencialPerdido || 0 // Added
      },

      costCenterStats: costCenters,
      representativeStats: processedRepresentatives,
      dataRangeInfo: {
        startDateRequested: format(startDate, 'yyyy-MM-dd'),
        endDateRequested: format(endDate, 'yyyy-MM-dd'),
        startDateActual: mergedDaily[0]?.date || null,
        endDateActual: mergedDaily[mergedDaily.length - 1]?.date || null,
        hasCompleteData: true
      }
    };
  } catch (error) {
    console.error('[SERVICE] Erro ao carregar estatísticas:', error);
    throw error;
  }
};

/**
 * Busca métricas de clientes exclusivas por representante (Ativos, Carteira, Novos)
 */
export const fetchRepresentativeClientMetrics = async (
  representativeId: number,
  startDate: Date,
  endDate: Date
) => {
  try {
    const start = format(startDate, 'yyyy-MM-dd 00:00:00');
    const end = format(endDate, 'yyyy-MM-dd 23:59:59');

    console.log(`[SERVICE] Fetching Client Metrics for Rep ${representativeId}: ${start} to ${end}`);

    const { data, error } = await supabase.rpc('get_representative_client_metrics', {
      p_rep_id: representativeId,
      p_start_date: start,
      p_end_date: end
    });

    if (error) {
      console.error('[SERVICE] Error calling get_representative_client_metrics:', error);
      // Fallback to zeros if RPC missing or error
      return { active_clients: 0, portfolio_clients: 0, new_clients: 0 };
    }

    return data as { active_clients: number; portfolio_clients: number; new_clients: number };

  } catch (error) {
    console.error('[SERVICE] Unexpected error in fetchRepresentativeClientMetrics:', error);
    return { active_clients: 0, portfolio_clients: 0, new_clients: 0 };
  }
};

/**
 * Busca lista de pedidos detalhada para o respresentante
 */
export const fetchRepresentativeOrdersList = async (
  representativeId: number,
  startDate: Date,
  endDate: Date
): Promise<import("./dashboardComercialTypes").RepresentativeOrder[]> => {
  try {
    const start = format(startDate, 'yyyy-MM-dd 00:00:00');
    const end = format(endDate, 'yyyy-MM-dd 23:59:59');

    console.log(`[SERVICE] Fetching Orders List for Rep ${representativeId}: ${start} to ${end}`);

    const { data, error } = await supabase.rpc('get_representative_orders_list', {
      p_rep_id: representativeId,
      p_start_date: start,
      p_end_date: end
    });

    if (error) {
      console.error('[SERVICE] Error calling get_representative_orders_list:', error);
      return [];
    }

    return data as import("./dashboardComercialTypes").RepresentativeOrder[];

  } catch (error) {
    console.error('[SERVICE] Unexpected error in fetchRepresentativeOrdersList:', error);
    return [];
  }
};

/**
 * Busca lista detalhada de faturamento para o modal
 */
export const fetchRepresentativeInvoices = async (
  representativeId: number,
  startDate: Date,
  endDate: Date
): Promise<any[]> => {
  const start = format(startDate, 'yyyy-MM-dd 00:00:00');
  const end = format(endDate, 'yyyy-MM-dd 23:59:59');

  // 1. Fetch from MV
  const { data: invoices, error } = await supabase
    .from('MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO')
    .select(`
            data_emissao,
            valor_nota,
            pes_codigo,
            nota,
            razao_social,
            apelido,
            centrocusto
        `)
    .eq('representante', representativeId)
    .gte('data_emissao', start)
    .lte('data_emissao', end)
    .neq('status_faturamento', '2') // Not Cancelled
    .order('data_emissao', { ascending: false });

  if (error) {
    console.error('[SERVICE] Error fetching invoices:', error);
    return [];
  }

  if (!invoices || invoices.length === 0) return [];

  // 2. Fetch Person Details (Grupo/Categoria, Apelido, Razao)
  const clientIds = [...new Set(invoices.map(i => i.pes_codigo).filter(id => id))];
  let clientMap = new Map<number, { apelido: string; razao: string; grupo: string }>();

  if (clientIds.length > 0) {
    const { data: clients } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO, APELIDO, RAZAOSOCIAL, NOME_CATEGORIA')
      .in('PES_CODIGO', clientIds);

    if (clients) {
      clients.forEach(c => {
        clientMap.set(c.PES_CODIGO, {
          apelido: c.APELIDO,
          razao: c.RAZAOSOCIAL,
          grupo: c.NOME_CATEGORIA
        });
      });
    }
  }

  // 3. Merge
  return invoices.map(i => {
    const client = clientMap.get(i.pes_codigo);
    return {
      ...i,
      razaosocial: client?.razao || i.razao_social, // Prefer Pessoa table
      apelido: client?.apelido || i.apelido,
      grupo_economico: client?.grupo || 'Não Definido', // New field
      centrocusto: i.centrocusto // Keep original just in case
    };
  });
};

/**
 * Busca detalhes dos itens de um pedido específico
 */
export const fetchRepresentativeOrderItems = async (
  matriz: number,
  filial: number,
  pedNumPedido: string,
  pedAnoBase: number
): Promise<import("./dashboardComercialTypes").RepresentativeOrderItem[]> => {
  try {
    // console.log(`[SERVICE] Fetching Items for Order: ${matriz}/${filial}/${pedNumPedido}/${pedAnoBase}`);

    // Fetch items directly from BLUEBAY_PEDIDO
    const { data: orderItems, error } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('*')
      .eq('MATRIZ', matriz)
      .eq('FILIAL', filial)
      .eq('PED_NUMPEDIDO', pedNumPedido)
      .eq('PED_ANOBASE', pedAnoBase)
      .order('ITEM_CODIGO');

    if (error) {
      console.error('[SERVICE] Error fetching order items:', error);
      return [];
    }

    if (!orderItems || orderItems.length === 0) {
      return [];
    }

    // console.log(`[SERVICE] Found ${orderItems.length} items for order ${pedNumPedido}. First item:`, orderItems[0]);

    // Fetch descriptions manually
    const itemCodigos = orderItems.map((d: any) => d.ITEM_CODIGO).filter((c: any) => c);
    let itemMap = new Map<string, string>();

    if (itemCodigos.length > 0) {
      const uniqueItemCodigos = [...new Set(itemCodigos)];
      const { data: itemsData } = await supabase
        .from('BLUEBAY_ITEM')
        .select('ITEM_CODIGO, DESCRICAO')
        .in('ITEM_CODIGO', uniqueItemCodigos);

      if (itemsData) {
        itemsData.forEach((i: any) => {
          if (i.ITEM_CODIGO) itemMap.set(String(i.ITEM_CODIGO), i.DESCRICAO);
        });
      }
    }

    return orderItems.map((item: any) => ({
      MATRIZ: item.MATRIZ,
      FILIAL: item.FILIAL,
      PED_NUMPEDIDO: String(item.PED_NUMPEDIDO),
      ITEM_CODIGO: String(item.ITEM_CODIGO || ''),
      DESCRICAO: itemMap.get(String(item.ITEM_CODIGO)) || 'Item sem descrição',
      QTDE_PEDIDA: item.QTDE_PEDIDA || 0,
      QTDE_ENTREGUE: item.QTDE_ENTREGUE || 0,
      QTDE_SALDO: item.QTDE_SALDO || 0,
      VALOR_UNITARIO: item.VALOR_UNITARIO || 0,
      VALOR_TOTAL: (item.QTDE_PEDIDA || 0) * (item.VALOR_UNITARIO || 0)
    }));

  } catch (error) {
    console.error('[SERVICE] Unexpected error in fetchRepresentativeOrderItems:', error);
    return [];
  }
};

/**
 * Busca análise de carteira de clientes por ano
 */
export const fetchRepresentativeClientPortfolio = async (
  representativeId: number,
  startYear: number,
  endYear: number
): Promise<{ CLIENTE_ID: number; APELIDO: string; RAZAOSOCIAL: string; ANO: number; TOTAL_VALOR: number }[]> => {
  try {
    const { data, error } = await supabase.rpc('get_representative_client_portfolio', {
      p_rep_id: representativeId,
      p_start_year: startYear,
      p_end_year: endYear
    });

    if (error) {
      console.error('[SERVICE] Error calling get_representative_client_portfolio:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[SERVICE] Unexpected error in fetchRepresentativeClientPortfolio:', error);
    return [];
  }
};


/**
 * Busca detalhes das transações para a tabela (Pode ser mais lento)
 */
export const fetchDashboardDetails = async (
  startDate: Date,
  endDate: Date,
  centroCusto: string | null = null,
  representative: string[] = [],
  cliente: string[] = [],
  produto: string[] = [],
  limit: number = 1000000,
  signal?: AbortSignal
): Promise<FaturamentoItem[]> => {
  try {
    const formattedStartDate = format(startDate, 'yyyy-MM-dd 00:00:00');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd 23:59:59');

    console.log(`[SERVICE] Buscando detalhes da tabela (MV) - Chunked: ${formattedStartDate} até ${formattedEndDate}`);

    let allItems: any[] = [];
    let hasMore = true;
    let page = 0;
    const pageSize = 10000; // Supabase often allows higher, but safer to chunk. Max rows usually 1000 unless changed.
    // If Supabase API max-rows is 1000, this pageSize will just return 1000.
    // We should probably rely on the returned data length.

    while (hasMore && allItems.length < limit) {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let detailQuery = supabase
        .from('MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO')
        .select('*')
        .gte('data_emissao', formattedStartDate)
        .lte('data_emissao', formattedEndDate)
        .neq('status_faturamento', '2')
        .order('data_emissao', { ascending: false })
        .range(from, to);

      if (signal) {
        detailQuery = detailQuery.abortSignal(signal);
      }

      if (centroCusto === "Não identificado") {
        detailQuery = detailQuery.is('centrocusto', null);
      } else if (centroCusto && centroCusto !== "none") {
        detailQuery = detailQuery.eq('centrocusto', centroCusto);
      }

      if (representative && representative.length > 0) {
        detailQuery = detailQuery.in('representante', representative);
      }

      if (cliente && cliente.length > 0) {
        detailQuery = detailQuery.in('pes_codigo', cliente);
      }

      if (produto && produto.length > 0) {
        detailQuery = detailQuery.in('item_codigo', produto);
      }

      const { data: detailItems, error: detailError } = await detailQuery;

      if (detailError) {
        console.error('[SERVICE] Erro ao buscar itens de faturamento (chunk):', detailError);
        throw detailError;
      }

      if (detailItems && detailItems.length > 0) {
        allItems = [...allItems, ...detailItems];
        if (detailItems.length < pageSize) {
          hasMore = false; // Less than requested means end of data
        }
        page++;
      } else {
        hasMore = false;
      }
    }

    // Map lowercase MV columns to Uppercase Interface expected by UI
    return (allItems || []).map((item: any) => ({
      // Basic Fields
      MATRIZ: item.matriz,
      FILIAL: item.filial,
      // ID often used as key
      ID_EF_DOCFISCAL: parseInt(item.id?.split('-')?.[0] || '0'),
      ID_EF_DOCFISCAL_ITEM: parseInt(item.id?.split('-')?.[1] || '0'),

      PED_NUMPEDIDO: item.ped_numpedido,
      PED_ANOBASE: item.ped_anobase,
      PES_CODIGO: typeof item.pes_codigo === 'string' ? parseInt(item.pes_codigo) : item.pes_codigo,

      NOTA: item.nota,
      TIPO: item.tipo,
      TRANSACAO: parseInt(item.transacao || '0'),
      STATUS: item.status_faturamento,

      DATA_EMISSAO: item.data_emissao,

      VALOR_NOTA: item.valor_nota,
      QUANTIDADE: item.quantidade,

      // Cost Center & Relations
      CENTROCUSTO: item.centrocusto,
      CENTRO_CUSTO: item.centrocusto,

      DATA_PEDIDO: item.data_pedido,
      REPRESENTANTE: item.representante ? parseInt(item.representante) : null,

      pedido: item.centrocusto || item.data_pedido ? {
        CENTROCUSTO: item.centrocusto,
        DATA_PEDIDO: item.data_pedido,
        REPRESENTANTE: item.representante,
        // Values not in MV, leave undefined or 0
        VALOR_UNITARIO: 0,
        QTDE_PEDIDA: 0,
        PED_NUMPEDIDO: item.ped_numpedido,
        // STATUS of pedido
        STATUS: item.status_pedido
      } : undefined
    }));
  } catch (error) {
    console.error('[SERVICE] Erro ao carregar detalhes:', error);
    throw error;
  }
};

/**
 * Busca detalhes dos pedidos para a lista (Pode ser mais lento)
 */
export const fetchDashboardOrders = async (
  startDate: Date,
  endDate: Date,
  centroCusto: string | null = null,
  representative: string[] = [],
  cliente: string[] = [],
  produto: string[] = [],
  limit: number = 1000000,
  signal?: AbortSignal
): Promise<import("./dashboardComercialTypes").PedidoItem[]> => {
  try {
    const formattedStartDate = format(startDate, 'yyyy-MM-dd 00:00:00');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd 23:59:59');

    console.log(`[SERVICE] Buscando Pedidos (Direct) - Chunked: ${formattedStartDate} até ${formattedEndDate}`);

    let allItems: any[] = [];
    let hasMore = true;
    let page = 0;
    const pageSize = 10000;

    while (hasMore && allItems.length < limit) {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('BLUEBAY_PEDIDO')
        .select('*')
        .gte('DATA_PEDIDO', formattedStartDate)
        .lte('DATA_PEDIDO', formattedEndDate)
        .neq('STATUS', '4') // Exclude cancelled
        .order('DATA_PEDIDO', { ascending: false })
        .range(from, to);

      if (signal) {
        query = query.abortSignal(signal);
      }

      if (centroCusto === "Não identificado") {
        query = query.is('CENTROCUSTO', null);
      } else if (centroCusto && centroCusto !== "none") {
        query = query.eq('CENTROCUSTO', centroCusto);
      }

      if (representative && representative.length > 0) {
        query = query.in('REPRESENTANTE', representative);
      }

      if (cliente && cliente.length > 0) {
        query = query.in('PES_CODIGO', cliente);
      }

      if (produto && produto.length > 0) {
        query = query.in('ITEM_CODIGO', produto);
      }

      const { data: orderItems, error } = await query;

      if (error) {
        console.error('[SERVICE] Erro ao buscar pedidos (chunk):', error);
        throw error;
      }

      if (orderItems && orderItems.length > 0) {
        allItems = [...allItems, ...orderItems];
        if (orderItems.length < pageSize) {
          hasMore = false;
        }
        page++;
      } else {
        hasMore = false;
      }
    }

    return (allItems || []).map((item: any) => ({
      MATRIZ: item.MATRIZ,
      FILIAL: item.FILIAL,
      PED_NUMPEDIDO: item.PED_NUMPEDIDO,
      PED_ANOBASE: item.PED_ANOBASE,
      MPED_NUMORDEM: item.MPED_NUMORDEM,
      ITEM_CODIGO: item.ITEM_CODIGO || '',
      PES_CODIGO: item.PES_CODIGO,
      QTDE_PEDIDA: item.QTDE_PEDIDA,
      QTDE_ENTREGUE: item.QTDE_ENTREGUE,
      QTDE_SALDO: item.QTDE_SALDO,
      STATUS: item.STATUS,
      DATA_PEDIDO: item.DATA_PEDIDO,
      VALOR_UNITARIO: item.VALOR_UNITARIO,
      CENTROCUSTO: item.CENTROCUSTO,
      CENTRO_CUSTO: item.CENTROCUSTO,
      REPRESENTANTE: item.REPRESENTANTE,
      VALOR_TOTAL: (item.QTDE_PEDIDA || 0) * (item.VALOR_UNITARIO || 0)
    }));
  } catch (error) {
    console.error('[SERVICE] Erro ao carregar pedidos:', error);
    throw error;
  }
};

/**
 * Legado: Mantido para compatibilidade se necessário, mas agora usa as funções acima
 */
export const fetchDashboardComercialData = async (
  startDate: Date,
  endDate: Date,
  centroCusto: string | null = null
): Promise<DashboardComercialData> => {
  const stats = await fetchDashboardStats(startDate, endDate, centroCusto);
  const details = await fetchDashboardDetails(startDate, endDate, centroCusto);

  return {
    ...stats,
    faturamentoItems: details,
    pedidoItems: [],
    dataRangeInfo: {
      ...stats.dataRangeInfo!,
      hasCompleteData: details.length < 1000
    }
  } as DashboardComercialData;
};
/**
 * Busca itens de Faturamento de um DIA específico
 */
export const fetchDailyDetails = async (
  date: Date,
  centroCusto: string | null = null,
  representative: string[] = [],
  cliente: string[] = [],
  produto: string[] = [],
  signal?: AbortSignal
): Promise<FaturamentoItem[]> => {
  try {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const start = `${formattedDate} 00:00:00`;
    const end = `${formattedDate} 23:59:59`;

    console.log(`[SERVICE] Buscando Faturamento Dia: ${formattedDate}`);

    let query = supabase
      .from('MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO')
      .select('*')
      .gte('data_emissao', start)
      .lte('data_emissao', end)
      .lte('data_emissao', end)
      .neq('status_faturamento', '2');

    // Fetch exclusion config
    const { data: configData } = await supabase
      .from('BLUEBAY_REPORT_TYPE_CONFIG')
      .select('transacao, tipo')
      .eq('report_dashboard_comercial', false);

    if (configData && configData.length > 0) {
      const excludedTransacoes = configData
        .map(c => c.transacao)
        .filter(t => t)
        .map(String);

      const excludedTipos = configData
        .map(c => c.tipo)
        .filter(t => t);

      if (excludedTransacoes.length > 0) {
        query = query.not('transacao', 'in', `(${excludedTransacoes.join(',')})`);
      }

      if (excludedTipos.length > 0) {
        // 'tipo' is a string column, need quotes potentially, but Supabase client handles array .in/.notIn better usually.
        // However, .not takes a filter string for 'in'.
        // Better: use .not('tipo', 'in', ...) which requires an array if using the filter builder correctly?
        // Actually, Supabase .not() syntax is: .not('column', 'operator', value)
        // So: .not('tipo', 'in', `(${excludedTipos.map(t => `"${t}"`).join(',')})`) might be complex with raw strings.
        // Let's use simple .filter() text search or multiple .neq if list is small? No.
        // Let's use the filter builder properly:
        // .filter('transacao', 'not.in', `(${excludedTransacoes.join(',')})`)

        // Simpler approach for Supabase JS V2:
        query = query.filter('transacao', 'not.in', `(${excludedTransacoes.join(',')})`);
        // For types (strings):
        query = query.filter('tipo', 'not.in', `(${excludedTipos.map(t => `"${t}"`).join(',')})`);
      }
    }

    query = query.order('nota', { ascending: true }); // Group by Note usually

    if (centroCusto === "Não identificado") {
      query = query.is('centrocusto', null);
    } else if (centroCusto && centroCusto !== "none") {
      query = query.eq('centrocusto', centroCusto);
    }

    if (representative && representative.length > 0) {
      query = query.in('representante', representative);
    }

    if (cliente && cliente.length > 0) {
      query = query.in('pes_codigo', cliente);
    }

    if (produto && produto.length > 0) {
      query = query.in('item_codigo', produto);
    }

    if (signal) {
      query = query.abortSignal(signal);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (data && data.length > 0) {
      console.log('[DEBUG_ITEM_KEYS]', Object.keys(data[0]), data[0]);
    }

    // Fetch Item Descriptions manually to be safe regarding FKs
    let itemMap = new Map<string, string>();
    const itemCodes = data?.map((d: any) => d.item_codigo).filter((c: any) => c) || [];

    if (itemCodes.length > 0) {
      const uniqueCodes = [...new Set(itemCodes)];
      // Chunk it if too large, though usually daily details aren't huge
      const { data: itemsData } = await supabase
        .from('BLUEBAY_ITEM')
        .select('ITEM_CODIGO, DESCRICAO')
        .in('ITEM_CODIGO', uniqueCodes);

      if (itemsData) {
        itemsData.forEach((i: any) => {
          if (i.ITEM_CODIGO) itemMap.set(i.ITEM_CODIGO, i.DESCRICAO);
        });
      }
    }

    // Fetch Representative Names
    let repMap = new Map<string, string>();
    const repIds = data?.map((d: any) => d.representante).filter((c: any) => c && String(c) !== '0') || [];

    if (repIds.length > 0) {
      const uniqueRepIds = [...new Set(repIds)];
      const { data: repData } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, APELIDO')
        .in('PES_CODIGO', uniqueRepIds);

      if (repData) {
        repData.forEach((r: any) => {
          if (r.PES_CODIGO) repMap.set(String(r.PES_CODIGO), r.APELIDO);
        });
      }
    }

    // Fetch Client Names (Fix for missing names in MV)
    let clientMap = new Map<string, string>();
    const clientIds = data?.map((d: any) => d.pes_codigo).filter((c: any) => c && String(c) !== '0') || [];

    if (clientIds.length > 0) {
      const uniqueClientIds = [...new Set(clientIds)];
      const { data: clientData } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, APELIDO, RAZAOSOCIAL')
        .in('PES_CODIGO', uniqueClientIds);

      if (clientData) {
        clientData.forEach((c: any) => {
          const name = c.APELIDO && c.APELIDO.trim() !== '' ? c.APELIDO : c.RAZAOSOCIAL;
          if (c.PES_CODIGO) clientMap.set(String(c.PES_CODIGO), name);
        });
      }
    }

    // Map to interface
    return (data || []).map((item: any) => ({
      MATRIZ: item.matriz,
      FILIAL: item.filial,
      ID_EF_DOCFISCAL: parseInt(item.id?.split('-')?.[0] || '0'),
      ID_EF_DOCFISCAL_ITEM: parseInt(item.id?.split('-')?.[1] || '0'),
      PED_NUMPEDIDO: item.ped_numpedido,
      ITEM_CODIGO: item.item_codigo || '', // Fixed mapping from lowercase
      NOTA: item.nota,
      TIPO: item.tipo,
      STATUS: item.status_faturamento,
      DATA_EMISSAO: item.data_emissao,
      VALOR_NOTA: item.valor_nota,
      QUANTIDADE: item.quantidade,
      CENTROCUSTO: item.centrocusto,
      VALOR_UNITARIO: item.valor_unitario,
      RAZAOSOCIAL: item.razao_social,
      APELIDO: clientMap.get(String(item.pes_codigo)) || item.apelido || item.razao_social || '',
      DESCRICAO: itemMap.get(item.item_codigo) || '',
      REPRESENTANTE: item.representante ? parseInt(item.representante) : null,
      REPRESENTANTE_NOME: repMap.get(String(item.representante)) || ''
    }));
  } catch (error) {
    console.error(`[SERVICE] Erro ao buscar dia ${date}:`, error);
    return [];
  }
};

/**
 * Busca Pedidos de um DIA específico
 */
export const fetchDailyOrders = async (
  date: Date,
  centroCusto: string | null = null,
  representative: string[] = [],
  cliente: string[] = [],
  produto: string[] = [],
  signal?: AbortSignal
): Promise<import("./dashboardComercialTypes").PedidoItem[]> => {
  try {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const start = `${formattedDate} 00:00:00`;
    const end = `${formattedDate} 23:59:59`;

    console.log(`[SERVICE] Buscando Pedidos Dia: ${formattedDate}`);

    let query = supabase
      .from('BLUEBAY_PEDIDO')
      .select('*')
      .gte('DATA_PEDIDO', start)
      .lte('DATA_PEDIDO', end)
      .neq('STATUS', '4')
      .order('PED_NUMPEDIDO', { ascending: false });

    if (centroCusto === "Não identificado") {
      query = query.is('CENTROCUSTO', null);
    } else if (centroCusto && centroCusto !== "none") {
      query = query.eq('CENTROCUSTO', centroCusto);
    }

    if (representative && representative.length > 0) {
      query = query.in('REPRESENTANTE', representative);
    }

    if (cliente && cliente.length > 0) {
      query = query.in('PES_CODIGO', cliente);
    }

    if (produto && produto.length > 0) {
      query = query.in('ITEM_CODIGO', produto);
    }

    if (signal) {
      query = query.abortSignal(signal);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Fetch nicknames (APELIDO) from BLUEBAY_PESSOA
    let pessoaMap = new Map<string, string>();
    const clientCodigos = (data || []).map((d: any) => d.PES_CODIGO).filter((c: any) => c);
    const repCodigos = (data || []).map((d: any) => d.REPRESENTANTE).filter((c: any) => c);
    const allPesCodigos = [...new Set([...clientCodigos, ...repCodigos])];

    if (allPesCodigos.length > 0) {
      const { data: pessoasData, error: pessoasError } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, APELIDO, RAZAOSOCIAL')
        .in('PES_CODIGO', allPesCodigos);

      if (pessoasData) {
        pessoasData.forEach((p: any) => {
          if (p.PES_CODIGO) {
            const name = p.APELIDO && p.APELIDO.trim() !== '' ? p.APELIDO : p.RAZAOSOCIAL;
            pessoaMap.set(String(p.PES_CODIGO), name);
          }
        });
      }
    }

    // Fetch descriptions (DESCRICAO) from BLUEBAY_ITEM
    let itemMap = new Map<string, string>();
    const itemCodigos = (data || []).map((d: any) => d.ITEM_CODIGO || d.item_codigo).filter((c: any) => c);

    if (itemCodigos.length > 0) {
      const uniqueItemCodigos = [...new Set(itemCodigos)];

      const { data: itemsData } = await supabase
        .from('BLUEBAY_ITEM')
        .select('ITEM_CODIGO, DESCRICAO')
        .in('ITEM_CODIGO', uniqueItemCodigos);

      if (itemsData) {
        itemsData.forEach((i: any) => {
          if (i.ITEM_CODIGO) itemMap.set(String(i.ITEM_CODIGO), i.DESCRICAO);
        });
      }
    }

    return (data || []).map((item: any) => {
      const mappedApelido = pessoaMap.get(String(item.PES_CODIGO)) || '';
      if (mappedApelido === '') {
        // Log misses to see why
        // console.log('[DEBUG_SERVICE] Missing Apelido for PES_CODIGO:', item.PES_CODIGO); 
      }
      const itemCodigo = item.ITEM_CODIGO || item.item_codigo || '';
      return {
        MATRIZ: item.MATRIZ,
        FILIAL: item.FILIAL,
        PED_NUMPEDIDO: item.PED_NUMPEDIDO,
        PED_ANOBASE: item.PED_ANOBASE,
        MPED_NUMORDEM: item.MPED_NUMORDEM,
        ITEM_CODIGO: itemCodigo,
        PES_CODIGO: item.PES_CODIGO,
        QTDE_PEDIDA: item.QTDE_PEDIDA,
        QTDE_ENTREGUE: item.QTDE_ENTREGUE,
        QTDE_SALDO: item.QTDE_SALDO,
        STATUS: item.STATUS,
        DATA_PEDIDO: item.DATA_PEDIDO,
        VALOR_UNITARIO: item.VALOR_UNITARIO,
        CENTROCUSTO: item.CENTROCUSTO,
        REPRESENTANTE: item.REPRESENTANTE,

        APELIDO: mappedApelido,
        REPRESENTANTE_NOME: pessoaMap.get(String(item.REPRESENTANTE)) || `Rep ${item.REPRESENTANTE || ''}`,
        DESCRICAO: itemMap.get(String(itemCodigo)) || '',
        VALOR_TOTAL: (item.QTDE_PEDIDA || 0) * (item.VALOR_UNITARIO || 0)
      };
    });
  } catch (error) {
    console.error(`[SERVICE] Erro ao buscar pedidos dia ${date}:`, error);
    return [];
  }
};

/**
 * Fetch Product Hierarchy Stats (Categories -> Items -> Orders)
 */
export const fetchProductStats = async (
  startDate: Date,
  endDate: Date,
  centroCusto: string | null,
  representative: string[] = [],
  cliente: string[] = [],
  produto: string[] = []
): Promise<import("./dashboardComercialTypes").ProductCategoryStat[]> => {
  try {
    const start = format(startDate, 'yyyy-MM-dd 00:00:00');
    const end = format(endDate, 'yyyy-MM-dd 23:59:59');

    console.log(`[SERVICE] Fetching Product Stats: ${start} to ${end}`);
    console.log(`[SERVICE] Product Stats Params -> CostCenter: ${centroCusto}, Rep: ${representative}`);

    // 1. Fetch Orders with Chunking (to bypass 1000 row limit)
    let allOrders: any[] = [];
    let hasMore = true;
    let page = 0;
    const pageSize = 1000; // Supabase hard limit often 1000
    const maxRows = 300000; // Safety limit increased for 2 years range

    console.log(`[SERVICE] Fetching Product Stats with Chunking...`);

    while (hasMore && allOrders.length < maxRows) {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('BLUEBAY_PEDIDO')
        .select('PED_NUMPEDIDO, DATA_PEDIDO, ITEM_CODIGO, QTDE_PEDIDA, VALOR_UNITARIO, QTDE_ENTREGUE, PES_CODIGO, CENTROCUSTO, REPRESENTANTE, STATUS')
        .gte('DATA_PEDIDO', start)
        .lte('DATA_PEDIDO', end)
        .neq('STATUS', '4')
        .order('DATA_PEDIDO', { ascending: false })
        .range(from, to);

      if (centroCusto && centroCusto !== "Não identificado" && centroCusto !== "none") {
        query = query.eq('CENTROCUSTO', centroCusto);
      } else if (centroCusto === "Não identificado") {
        query = query.is('CENTROCUSTO', null);
      }

      if (representative && representative.length > 0) {
        query = query.in('REPRESENTANTE', representative);
      }

      if (cliente && cliente.length > 0) {
        query = query.in('PES_CODIGO', cliente);
      }

      if (produto && produto.length > 0) {
        query = query.in('ITEM_CODIGO', produto);
      }

      const { data: chunk, error } = await query;
      if (error) {
        console.error('[SERVICE] Error fetching product stats chunk:', error);
        throw error;
      }

      if (chunk && chunk.length > 0) {
        allOrders = [...allOrders, ...chunk];
        if (chunk.length < pageSize) {
          hasMore = false;
        }
        page++;
      } else {
        hasMore = false;
      }
    }

    const orders = allOrders;
    console.log(`[SERVICE] Fetch Product Stats: Retrieved Total ${orders.length} rows.`);

    if (orders.length > 0) {
      console.log('[SERVICE] DEBUG First Item:', {
        DATA_PEDIDO: orders[0].DATA_PEDIDO,
        REPRESENTANTE: orders[0].REPRESENTANTE,
        TYPE_DATA: typeof orders[0].DATA_PEDIDO
      });
    }

    if (orders.length === 0) return [];

    // 2. Extract Unique Codes
    const uniqueItemCodes = [...new Set(orders.map((o: any) => o.ITEM_CODIGO).filter(Boolean))];
    const uniquePesCodigos = [...new Set(orders.map((o: any) => o.PES_CODIGO).filter(Boolean))];

    // 3. Fetch Items Details
    const itemMap = new Map<string, { desc: string, group: string }>();
    if (uniqueItemCodes.length > 0) {
      console.log(`[SERVICE] Fetching details for ${uniqueItemCodes.length} items in batches of 50...`);
      const batchSize = 50;
      for (let i = 0; i < uniqueItemCodes.length; i += batchSize) {
        const batchCodes = uniqueItemCodes.slice(i, i + batchSize);
        const { data: itemsChunk, error: itemsError } = await supabase
          .from('BLUEBAY_ITEM')
          .select('ITEM_CODIGO, DESCRICAO, GRU_DESCRICAO')
          .in('ITEM_CODIGO', batchCodes);

        if (itemsError) {
          console.error('[SERVICE] Error fetching item batch:', itemsError);
        }

        if (itemsChunk) {
          itemsChunk.forEach((i: any) => {
            itemMap.set(String(i.ITEM_CODIGO), { desc: i.DESCRICAO, group: i.GRU_DESCRICAO });
          });
        }
      }
    }

    // 4. Fetch Pessoas Details (for APELIDO)
    const pessoaMap = new Map<string, string>();
    if (uniquePesCodigos.length > 0) {
      const { data: pessoas } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, APELIDO, RAZAOSOCIAL')
        .in('PES_CODIGO', uniquePesCodigos);

      pessoas?.forEach((p: any) => {
        const name = p.APELIDO && p.APELIDO.trim() !== '' ? p.APELIDO : p.RAZAOSOCIAL;
        pessoaMap.set(String(p.PES_CODIGO), name);
      });
    }

    // 5. Aggregate Data
    const categoryMap = new Map<string, import("./dashboardComercialTypes").ProductCategoryStat>();

    orders.forEach((order: any) => {
      const itemCode = order.ITEM_CODIGO;
      if (!itemCode) return;

      const info = itemMap.get(String(itemCode)) || { desc: 'SEM CADASTRO', group: 'OUTROS' };
      const groupKey = info.group || 'OUTROS';
      const itemKey = String(itemCode);

      // Init Category
      if (!categoryMap.has(groupKey)) {
        categoryMap.set(groupKey, {
          GRU_DESCRICAO: groupKey,
          VALOR_PEDIDO: 0,
          QTDE_ITENS: 0,
          VALOR_FATURADO: 0,
          QTDE_FATURADA: 0,
          TM: 0,
          items: []
        });
      }
      const cat = categoryMap.get(groupKey)!;

      // Init/Find Item in Category
      let itemStat = cat.items.find(i => i.ITEM_CODIGO === itemKey);
      if (!itemStat) {
        itemStat = {
          ITEM_CODIGO: itemKey,
          DESCRICAO: info.desc,
          VALOR_PEDIDO: 0,
          QTDE_ITENS: 0,
          VALOR_FATURADO: 0,
          QTDE_FATURADA: 0,
          TM: 0,
          orders: []
        };
        cat.items.push(itemStat);
      }

      // Calcs
      const qtdePedida = order.QTDE_PEDIDA || 0;
      const valorUnitario = order.VALOR_UNITARIO || 0;
      const valorTotal = qtdePedida * valorUnitario;
      const qtdeEntregue = order.QTDE_ENTREGUE || 0;
      const valorFaturado = qtdeEntregue * valorUnitario;

      // Add to Item
      itemStat.VALOR_PEDIDO += valorTotal;
      itemStat.QTDE_ITENS += qtdePedida;
      itemStat.VALOR_FATURADO += valorFaturado;
      itemStat.QTDE_FATURADA += qtdeEntregue;

      // Add to Category
      cat.VALOR_PEDIDO += valorTotal;
      cat.QTDE_ITENS += qtdePedida;
      cat.VALOR_FATURADO += valorFaturado;
      cat.QTDE_FATURADA += qtdeEntregue;

      // Add Order Detail
      itemStat.orders.push({
        PED_NUMPEDIDO: order.PED_NUMPEDIDO,
        APELIDO: pessoaMap.get(String(order.PES_CODIGO)) || '',
        DATA_PEDIDO: order.DATA_PEDIDO,
        QTDE_PEDIDA: qtdePedida,
        VALOR_UNITARIO: valorUnitario,
        VALOR_TOTAL: valorTotal,
        QTDE_ENTREGUE: qtdeEntregue,
        VALOR_FATURADO: valorFaturado
      });
    });

    // 6. Finalize (Calculate TM and Sort)
    const result = Array.from(categoryMap.values()).map(cat => {
      cat.TM = cat.QTDE_ITENS > 0 ? cat.VALOR_PEDIDO / cat.QTDE_ITENS : 0;

      cat.items = cat.items.map(item => {
        item.TM = item.QTDE_ITENS > 0 ? item.VALOR_PEDIDO / item.QTDE_ITENS : 0;
        // Sort Level 3 (Orders) by Value Desc
        item.orders.sort((a, b) => b.VALOR_TOTAL - a.VALOR_TOTAL);
        return item;
      });

      // Sort Level 2 (Items) by Value Desc
      cat.items.sort((a, b) => b.VALOR_PEDIDO - a.VALOR_PEDIDO);

      return cat;
    });

    // Sort Level 1 (Categories) by Value Desc
    return result.sort((a, b) => b.VALOR_PEDIDO - a.VALOR_PEDIDO);

  } catch (error) {
    console.error("[SERVICE] Error fetching Product Stats:", error);
    return [];
  }
};

/**
 * Busca estatísticas do dashboard filtradas por CIDADE (Agregação Manual)
 */
export const fetchDashboardStatsByCity = async (
  startDate: Date,
  endDate: Date,
  city: string,
  uf: string,
  centroCusto: string | null = null,
  representative: string[] = [],
  cliente: string[] = [],
  produto: string[] = []
): Promise<Partial<DashboardComercialData>> => {
  try {
    const formattedStartDate = format(startDate, 'yyyy-MM-dd 00:00:00');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd 23:59:59');

    console.log(`[SERVICE] Buscando Stats por Cidade: ${city}/${uf} de ${formattedStartDate} até ${formattedEndDate}`);

    // 1. Buscar PES_CODIGOs da cidade
    // Trying to match regardless of accents if possible, but for now simple ILIKE.
    // NOTE: The Map component passes normalized (unaccented) names usually if it comes from the static list keys,
    // BUT check SalesHeatmap: it passes { city: city.city, uf: city.uf } from the DATA, 
    // and the DATA comes from `fetchCityStatsV2` which gets it from `BLUEBAY_PESSOA`!
    // So the name passed BACK to this function should be EXACTLY what is in the DB.
    // So `ilike` should work fine unless encoding issues.

    console.log(`[SERVICE_DEBUG] Querying People for City: "${city}" and UF: "${uf}"`);

    const { data: people, error: peopleError } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO')
      .ilike('CIDADE', city) // Use exact match or ILIKE? ILIKE is safer for casing.
      .ilike('UF', uf);

    if (peopleError) throw peopleError;

    const pesCodigos = people?.map((p: any) => p.PES_CODIGO) || [];
    console.log(`[SERVICE_DEBUG] Found ${pesCodigos.length} people in ${city}/${uf}`);

    if (pesCodigos.length === 0) {
      return {
        dailyFaturamento: [],
        monthlyFaturamento: [],
        totalFaturado: 0,
        totalItens: 0,
        mediaValorItem: 0,
        totals: {
          totalFaturado: 0,
          totalItens: 0,
          mediaValorItem: 0,
          totalPedidosValue: 0,
          totalPedidosQty: 0
        },
        costCenterStats: [],
        representativeStats: [],
        dataRangeInfo: {
          startDateRequested: format(startDate, 'yyyy-MM-dd'),
          endDateRequested: format(endDate, 'yyyy-MM-dd'),
          startDateActual: null,
          endDateActual: null,
          hasCompleteData: true
        }
      };
    }

    // 2. Parallel Fetch: Invoices (Revenue) AND Orders (Demand)
    // Warning: .in() limit. If pesCodigos > 1000, consider chunking. For now, max 2000 warning exists.

    // A. Fetch Invoices (Faturamento)
    let invoiceQuery = supabase
      .from('MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO')
      .select('valor_nota, data_emissao, centrocusto, representante, quantidade, nota, pes_codigo')
      .gte('data_emissao', formattedStartDate)
      .lte('data_emissao', formattedEndDate)
      .neq('status_faturamento', '2') // Not Cancelled
      .in('pes_codigo', pesCodigos);

    if (centroCusto && centroCusto !== "none") {
      invoiceQuery = invoiceQuery.eq('centrocusto', centroCusto);
    }
    if (representative && representative.length > 0) {
      invoiceQuery = invoiceQuery.in('representante', representative);
    }

    // B. Fetch Orders (Pedidos)
    let orderQuery = supabase
      .from('BLUEBAY_PEDIDO')
      .select('TOTAL_PRODUTO, DATA_PEDIDO, CENTROCUSTO, REPRESENTANTE, QTDE_PEDIDA, VALOR_UNITARIO, QTDE_ENTREGUE, STATUS, PES_CODIGO, ITEM_CODIGO')
      .gte('DATA_PEDIDO', formattedStartDate)
      .lte('DATA_PEDIDO', formattedEndDate)
      .neq('STATUS', '4') // Not Cancelled
      .in('PES_CODIGO', pesCodigos);

    if (centroCusto && centroCusto !== "none") {
      orderQuery = orderQuery.eq('CENTROCUSTO', centroCusto);
    }
    if (representative && representative.length > 0) {
      orderQuery = orderQuery.in('REPRESENTANTE', representative);
    }
    if (cliente && cliente.length > 0) {
      invoiceQuery = invoiceQuery.in('pes_codigo', cliente);
      orderQuery = orderQuery.in('PES_CODIGO', cliente);
    }
    if (produto && produto.length > 0) {
      // invoiceQuery = invoiceQuery.eq('item_codigo', produto); // View may not support item_codigo
      orderQuery = orderQuery.in('ITEM_CODIGO', produto);
    }

    const [invoiceRes, orderRes] = await Promise.all([invoiceQuery, orderQuery]);

    if (invoiceRes.error) throw invoiceRes.error;
    if (orderRes.error) throw orderRes.error;

    const invoices = invoiceRes.data || [];
    const orders = orderRes.data || [];

    console.log(`[SERVICE] Stats for ${city}/${uf}: ${invoices.length} Invoices, ${orders.length} Orders`);

    // 3. Aggregate Data

    // Totals
    let totalFaturado = 0;
    let totalItens = 0; // Itens Faturados
    let totalPedidosValue = 0;
    let totalPedidosQty = orders.length;
    let totalItensPedidos = 0;

    // Maps
    const dailyMap = new Map<string, { total: number, faturamentoCount: number, pedidoTotal: number, pedidoCount: number }>();
    const ccMap = new Map<string, any>();
    const repMap = new Map<string, any>();
    const repIds = new Set<string>();

    // --- Process Invoices ---
    invoices.forEach((inv: any) => {
      const valor = Number(inv.valor_nota) || 0;
      const qtde = Number(inv.quantidade) || 0;

      totalFaturado += valor;
      totalItens += qtde;

      // Daily
      const dateKey = inv.data_emissao ? inv.data_emissao.split('T')[0] : 'Unknown';
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { total: 0, faturamentoCount: 0, pedidoTotal: 0, pedidoCount: 0 });
      }
      const day = dailyMap.get(dateKey)!;
      day.total += valor;
      day.faturamentoCount += 1;

      // Cost Center
      const ccKey = inv.centrocusto || 'Não identificado';
      if (!ccMap.has(ccKey)) {
        ccMap.set(ccKey, {
          nome: ccKey,
          totalFaturado: 0, totalItensFaturados: 0, totalPedidos: 0, totalItensPedidos: 0
        });
      }
      const cc = ccMap.get(ccKey);
      cc.totalFaturado += valor;
      cc.totalItensFaturados += qtde;

      // Representative
      const repKey = inv.representante ? String(inv.representante) : '0';
      repIds.add(repKey);
      if (!repMap.has(repKey)) {
        repMap.set(repKey, {
          id: repKey, nome: 'Loading...',
          totalFaturado: 0, totalItensFaturados: 0, totalPedidos: 0, totalItensPedidos: 0
        });
      }
      const rep = repMap.get(repKey);
      rep.totalFaturado += valor;
      rep.totalItensFaturados += qtde;
    });

    // --- Process Orders ---
    orders.forEach((order: any) => {
      const qtdePedida = Number(order.QTDE_PEDIDA) || 0;
      const valorUnit = Number(order.VALOR_UNITARIO) || 0;
      const valorPedido = qtdePedida * valorUnit; // Calculate total as pure demand
      // Or use TOTAL_PRODUTO if it better reflects the order value stored
      const totalProd = Number(order.TOTAL_PRODUTO) || 0;

      const finalOrderValue = totalProd > 0 ? totalProd : valorPedido;

      totalPedidosValue += finalOrderValue;
      totalItensPedidos += qtdePedida;

      // Daily
      const dateKey = order.DATA_PEDIDO ? order.DATA_PEDIDO.split('T')[0] : 'Unknown';
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { total: 0, faturamentoCount: 0, pedidoTotal: 0, pedidoCount: 0 });
      }
      const day = dailyMap.get(dateKey)!;
      day.pedidoTotal += finalOrderValue;
      day.pedidoCount += 1;

      // Cost Center
      const ccKey = order.CENTROCUSTO || 'Não identificado';
      if (!ccMap.has(ccKey)) {
        ccMap.set(ccKey, {
          nome: ccKey,
          totalFaturado: 0, totalItensFaturados: 0, totalPedidos: 0, totalItensPedidos: 0
        });
      }
      const cc = ccMap.get(ccKey);
      cc.totalPedidos += 1;
      cc.totalItensPedidos += qtdePedida;

      // Representative
      const repKey = order.REPRESENTANTE ? String(order.REPRESENTANTE) : '0';
      repIds.add(repKey);
      if (!repMap.has(repKey)) {
        repMap.set(repKey, {
          id: repKey, nome: 'Loading...',
          totalFaturado: 0, totalItensFaturados: 0, totalPedidos: 0, totalItensPedidos: 0
        });
      }
      const rep = repMap.get(repKey);
      rep.totalPedidos += 1;
      rep.totalItensPedidos += qtdePedida;
    });

    // Formatting Daily
    const dailyFaturamento = Array.from(dailyMap.entries()).map(([date, stats]) => ({
      date: date,
      formattedDate: format(parseISO(date), 'dd/MM/yyyy'),
      ...stats
    })).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    // Formatting Cost Centers
    const costCenterStats = Array.from(ccMap.values()).map(cc => ({
      ...cc,
      ticketMedioFaturado: cc.totalPedidos > 0 ? cc.totalFaturado / cc.totalPedidos : 0 // Ticket medio usually Faturado / Pedidos or Faturado / QtdeNotas? 
      // Main dashboard uses: totalFaturado / totalPedidos (if using orders base) or totalFaturado / faturamentoCount?
      // "Ticket Médio" usually refers to Sales Value / Number of Sales (Invoices). 
      // But if we want Ticket Médio de PEDIDOS, it is Value / Pedidos. 
      // Let's stick to simple division by totalPedidos for consistency with previous map logic, or use invoices count if available.
      // Ideally Ticket Medio = Receita / Vendas. Vendas = Notes.
    })).sort((a, b) => b.totalFaturado - a.totalFaturado);

    // Fetch Rep Names
    if (repIds.size > 0) {
      const { data: reps } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, APELIDO')
        .in('PES_CODIGO', Array.from(repIds));

      if (reps) {
        reps.forEach((r: any) => {
          const k = String(r.PES_CODIGO);
          if (repMap.has(k)) {
            repMap.get(k).nome = r.APELIDO;
          }
        });
      }
    }

    const representativeStats = Array.from(repMap.values()).map(r => ({
      ...r,
      ticketMedioFaturado: r.totalPedidos > 0 ? r.totalFaturado / r.totalPedidos : 0,
      nome: r.id === '0' ? 'Não identificado' : (r.nome === 'Loading...' ? `Rep ${r.id}` : r.nome)
    })).sort((a, b) => b.totalFaturado - a.totalFaturado);


    return {
      dailyFaturamento,
      monthlyFaturamento: [],
      totalFaturado,
      totalItens,
      mediaValorItem: totalPedidosQty > 0 ? totalFaturado / totalPedidosQty : 0,
      totals: {
        totalFaturado,
        totalItens,
        mediaValorItem: totalPedidosQty > 0 ? totalFaturado / totalPedidosQty : 0,
        totalPedidosValue,
        totalPedidosQty
      },
      costCenterStats,
      representativeStats,
      dataRangeInfo: {
        startDateRequested: format(startDate, 'yyyy-MM-dd'),
        endDateRequested: format(endDate, 'yyyy-MM-dd'),
        startDateActual: dailyFaturamento[0]?.date || null,
        endDateActual: dailyFaturamento[dailyFaturamento.length - 1]?.date || null,
        hasCompleteData: true
      }
    };

  } catch (error) {
    console.error('[SERVICE] Erro ao buscar stats por cidade:', error);
    throw error;
  }
};

/**
 * Busca estatísticas agregadas por CLIENTE (Apelido)
 * Colunas: Nome_Categoria (Rep?), Apelido, Total Faturado, Itens Fat, TM Item Fat, Total Pedido, Itens Ped
 */
export const fetchClientStats = async (
  startDate: Date,
  endDate: Date,
  centroCusto: string | null = null,
  representative: string[] = [],
  cliente: string[] = [],
  produto: string[] = []
): Promise<import("./dashboardComercialTypes").ClientStat[]> => {
  try {
    const formattedStartDate = format(startDate, 'yyyy-MM-dd 00:00:00');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd 23:59:59');

    console.log(`[SERVICE] Buscando Stats de Clientes: ${formattedStartDate} até ${formattedEndDate}`);

    const pageSize = 1000;
    const maxRows = 300000;

    // 1. Fetch Invoices with Chunking
    let allInvoices: any[] = [];
    let hasMoreInvoices = true;
    let invPage = 0;

    while (hasMoreInvoices && allInvoices.length < maxRows) {
      const from = invPage * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO')
        .select('valor_nota, quantidade, pes_codigo, centrocusto, representante')
        .gte('data_emissao', formattedStartDate)
        .lte('data_emissao', formattedEndDate)
        .neq('status_faturamento', '2') // Not Cancelled
        .range(from, to);

      if (centroCusto && centroCusto !== "none" && centroCusto !== "Não identificado") {
        query = query.eq('centrocusto', centroCusto);
      } else if (centroCusto === "Não identificado") {
        query = query.is('centrocusto', null);
      }

      // Filter empty strings to avoid integer syntax errors
      const validReps = representative ? representative.filter(r => r && r.trim() !== "") : [];
      if (validReps.length > 0) {
        query = query.in('representante', validReps);
      }

      const validClients = cliente ? cliente.filter(c => c && c.trim() !== "") : [];
      if (validClients.length > 0) {
        query = query.in('pes_codigo', validClients);
      }


      // Invoice view usually doesn't have item_codigo?
      // Step 268 lines 1729 showed logic for Manual Calc.
      // If invoice doesn't have item_codigo, we can't filter invoice by product.
      // So ignore product for invoices, or use a better view.
      // We will ignore for now as per `calcDashboardStats` logic?
      // Actually `calcDashboardStats` (Step 271) REMOVED product filter from Invoice Query.
      // So here too.

      const { data: chunk, error } = await query;
      if (error) throw error;
      if (chunk && chunk.length > 0) {
        allInvoices = [...allInvoices, ...chunk];
        hasMoreInvoices = chunk.length === pageSize;
        invPage++;
      } else {
        hasMoreInvoices = false;
      }
    }

    // 2. Fetch Orders with Chunking
    let allOrders: any[] = [];
    let hasMoreOrders = true;
    let ordPage = 0;

    while (hasMoreOrders && allOrders.length < maxRows) {
      const from = ordPage * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('BLUEBAY_PEDIDO')
        .select('TOTAL_PRODUTO, QTDE_PEDIDA, VALOR_UNITARIO, PES_CODIGO, CENTROCUSTO, REPRESENTANTE, STATUS')
        .gte('DATA_PEDIDO', formattedStartDate)
        .lte('DATA_PEDIDO', formattedEndDate)
        .neq('STATUS', '4') // Not Cancelled
        .range(from, to);

      if (centroCusto && centroCusto !== "none" && centroCusto !== "Não identificado") {
        query = query.eq('CENTROCUSTO', centroCusto);
      } else if (centroCusto === "Não identificado") {
        query = query.is('CENTROCUSTO', null);
      }

      const validReps = representative ? representative.filter(r => r && r.trim() !== "") : [];
      if (validReps.length > 0) {
        query = query.in('REPRESENTANTE', validReps);
      }

      const validClients = cliente ? cliente.filter(c => c && c.trim() !== "") : [];
      if (validClients.length > 0) {
        query = query.in('PES_CODIGO', validClients);
      }

      const validProducts = produto ? produto.filter(p => p && p.trim() !== "") : [];
      if (validProducts.length > 0) {
        query = query.in('ITEM_CODIGO', validProducts);
      }

      const { data: chunk, error } = await query;
      if (error) throw error;
      if (chunk && chunk.length > 0) {
        allOrders = [...allOrders, ...chunk];
        hasMoreOrders = chunk.length === pageSize;
        ordPage++;
      } else {
        hasMoreOrders = false;
      }
    }

    const invoices = allInvoices;
    const orders = allOrders;

    console.log(`[SERVICE] ClientStats -> Query Results: Invoices=${invoices.length}, Orders=${orders.length}`);

    // 3. Aggregate
    const clientMap = new Map<number, import("./dashboardComercialTypes").ClientStat>();
    const clientIds = new Set<number>();

    const getClient = (id: number) => {
      if (!clientMap.has(id)) {
        clientMap.set(id, {
          PES_CODIGO: String(id),
          APELIDO: `Cliente ${id}`,
          NOME_CATEGORIA: '-',
          TOTAL_FATURADO: 0,
          ITENS_FATURADOS: 0,
          TM_ITEM_FATURADO: 0,
          TOTAL_PEDIDO: 0,
          ITENS_PEDIDOS: 0
        });
        clientIds.add(id);
      }
      return clientMap.get(id)!;
    };

    // Process Invoices
    invoices.forEach((inv: any) => {
      const id = Number(inv.pes_codigo);
      if (!id || id === 0) return;

      const client = getClient(id);
      client.TOTAL_FATURADO += (Number(inv.valor_nota) || 0);
      client.ITENS_FATURADOS += (Number(inv.quantidade) || 0);
    });

    // Process Orders
    orders.forEach((ord: any) => {
      const id = Number(ord.PES_CODIGO);
      if (!id || id === 0) return;

      const client = getClient(id);
      const qtde = Number(ord.QTDE_PEDIDA) || 0;
      const valorUnit = Number(ord.VALOR_UNITARIO) || 0;
      const totalProd = Number(ord.TOTAL_PRODUTO) || 0;
      const val = totalProd > 0 ? totalProd : (qtde * valorUnit);

      client.TOTAL_PEDIDO += val;
      client.ITENS_PEDIDOS += qtde;
    });

    console.log(`[SERVICE] ClientStats -> Aggregated ${clientMap.size} unique clients.`);

    // 4. Fetch Descriptions (Apelido)
    if (clientIds.size > 0) {
      const ids = Array.from(clientIds);
      const batchSize = 100; // Smaller batches for safety

      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        console.log(`[SERVICE] ClientStats -> Fetching batch ${i / batchSize + 1} for ${batch.length} people...`);

        const { data: people, error: peopleError } = await supabase
          .from('BLUEBAY_PESSOA')
          .select('PES_CODIGO, APELIDO, NOME_CATEGORIA')
          .in('PES_CODIGO', batch);

        if (peopleError) {
          console.error('[SERVICE] ClientStats -> People Batch Error:', peopleError);
        }

        console.log(`[SERVICE] ClientStats -> Found ${people?.length || 0} names in batch.`);

        people?.forEach((p: any) => {
          const c = clientMap.get(Number(p.PES_CODIGO));
          if (c) {
            c.APELIDO = p.APELIDO || c.APELIDO;
            c.NOME_CATEGORIA = p.NOME_CATEGORIA || '-';
          }
        });
      }
    }

    // 5. Finalize Calcs and Sort
    const result = Array.from(clientMap.values()).map(c => {
      c.TM_ITEM_FATURADO = c.ITENS_FATURADOS > 0 ? c.TOTAL_FATURADO / c.ITENS_FATURADOS : 0;
      return c;
    });

    console.log(`[SERVICE] ClientStats -> Returning ${result.length} clients to UI.`);

    // Sort by Total Pedido Desc
    return result.sort((a, b) => b.TOTAL_PEDIDO - a.TOTAL_PEDIDO);

  } catch (error) {
    console.error('[SERVICE] Error fetching client stats:', error);
    return [];
  }
};

/**
 * Funções auxiliares para os filtros
 */
// Helper to get active Pessoas IDs in range
export const getActivePessoaIds = async (startDate: Date, endDate: Date, isRep: boolean): Promise<Set<string>> => {
  const formattedStart = format(startDate, 'yyyy-MM-dd 00:00:00');
  const formattedEnd = format(endDate, 'yyyy-MM-dd 23:59:59');

  const ids = new Set<string>();
  const PAGE_SIZE = 1000;

  // 1. Invoices Loop
  let invHasMore = true;
  let invPage = 0;
  while (invHasMore) {
    const { data: invData, error } = await supabase
      .from('MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO')
      .select(isRep ? 'representante' : 'pes_codigo')
      .gte('data_emissao', formattedStart)
      .lte('data_emissao', formattedEnd)
      .neq('status_faturamento', '2')
      .range(invPage * PAGE_SIZE, (invPage + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error('[SERVICE] Error fetching active ids (invoice):', error);
      break;
    }

    if (invData && invData.length > 0) {
      invData.forEach((r: any) => {
        const val = isRep ? r.representante : r.pes_codigo;
        if (val && String(val) !== '0') ids.add(String(val));
      });
      invHasMore = invData.length === PAGE_SIZE;
      invPage++;
    } else {
      invHasMore = false;
    }
  }

  // 2. Orders Loop
  let ordHasMore = true;
  let ordPage = 0;
  while (ordHasMore) {
    const { data: ordData, error } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select(isRep ? 'REPRESENTANTE' : 'PES_CODIGO')
      .gte('DATA_PEDIDO', formattedStart)
      .lte('DATA_PEDIDO', formattedEnd)
      .neq('STATUS', '4')
      .range(ordPage * PAGE_SIZE, (ordPage + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error('[SERVICE] Error fetching active ids (order):', error);
      break;
    }

    if (ordData && ordData.length > 0) {
      ordData.forEach((r: any) => {
        const val = isRep ? r.REPRESENTANTE : r.PES_CODIGO;
        if (val && String(val) !== '0') ids.add(String(val));
      });
      ordHasMore = ordData.length === PAGE_SIZE;
      ordPage++;
    } else {
      ordHasMore = false;
    }
  }

  console.log(`[SERVICE] getActivePessoaIds (${isRep ? 'REPS' : 'CLIENTS'}): Found ${ids.size} unique IDs.`);
  return ids;
};

/**
 * Fetch active representatives using dedicated RPC for performance
 */
export const fetchActiveRepresentativesRPC = async (lookbackMonths: number = 24) => {
  console.log(`[SERVICE] Fetching active representatives from MV_REPRESENTANTES_DASHBOARD...`);

  // Query the Materialized View directly for better performance
  // The view is refreshed weekly (or manually) as per user request
  const { data, error } = await supabase
    .from('MV_REPRESENTANTES_DASHBOARD')
    .select('codigo_representante, nome_representante')
    .order('nome_representante');

  if (error) {
    console.error('[SERVICE] Error fetching from MV_REPRESENTANTES_DASHBOARD:', error);
    // Fallback: Return empty or try RPC? 
    // Given the request for performance, let's assume MV exists. If not, error logs will show.
    // If the table doesn't exist, this will fail.
    // We could fallback to the old RPC if we wanted, but let's stick to the new path.
    return [];
  }

  console.log(`[SERVICE] MV returned ${data?.length} representatives.`);

  return (data || []).map((r: any) => ({
    value: String(r.codigo_representante),
    label: r.nome_representante
  }));
};

export const fetchRepresentativesOptions = async (allowedIds?: string[]) => {
  console.log(`[SERVICE] fetchRepresentativesOptions called with allowedIds length: ${allowedIds?.length}`);
  let query = supabase
    .from('BLUEBAY_PESSOA')
    .select('PES_CODIGO, APELIDO')
    .not('APELIDO', 'is', null)
    .neq('APELIDO', '')
    .order('APELIDO');

  if (allowedIds && allowedIds.length > 0) {
    // Optimization: Directly filter by IDs in the query
    query = query.in('PES_CODIGO', allowedIds);
  } else if (allowedIds && allowedIds.length === 0) {
    // If an empty allow-list is provided, return nothing (strict filtering)
    console.log('[SERVICE] fetchRepresentativesOptions: Empty allowedIds provided, returning empty list.');
    return [];
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar representantes:', error);
    return [];
  }

  console.log(`[SERVICE] fetchRepresentativesOptions: Returning ${data?.length} options.`);
  return (data || []).map(r => ({
    value: String(r.PES_CODIGO),
    label: r.APELIDO ? r.APELIDO.trim() : `Rep ${r.PES_CODIGO}`
  }));
};

export const searchClients = async (query: string, allowedIds?: string[]) => {
  if (!query || query.length < 2) return [];

  // First find matching people by name
  let nameQuery = supabase
    .from('BLUEBAY_PESSOA')
    .select('PES_CODIGO, APELIDO, RAZAOSOCIAL')
    .or(`APELIDO.ilike.%${query}%,RAZAOSOCIAL.ilike.%${query}%`);
  // .limit(50); // REMOVE LIMIT if filtering by ID to ensure we find the match!
  // Or keep limit but apply ID filter IN THE QUERY.

  if (allowedIds && allowedIds.length > 0) {
    nameQuery = nameQuery.in('PES_CODIGO', allowedIds);
  } else if (allowedIds && allowedIds.length === 0) {
    // Strict filtering and no allowed IDs -> no results
    return [];
  }

  // Apply limit after filter to keep it safe (though Supabase might require limit)
  nameQuery = nameQuery.limit(50);

  const { data: people, error } = await nameQuery;

  if (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }

  if (!people || people.length === 0) return [];

  return (people || []).map(d => {
    const apelido = d.APELIDO ? d.APELIDO.trim() : '';
    const razao = d.RAZAOSOCIAL ? d.RAZAOSOCIAL.trim() : '';
    return {
      value: String(d.PES_CODIGO),
      label: apelido !== '' ? apelido : (razao !== '' ? razao : `Cliente ${d.PES_CODIGO}`)
    };
  });
};

export const searchProducts = async (query: string) => {
  if (!query || query.length < 2) return [];

  const { data, error } = await supabase
    .from('BLUEBAY_ITEM')
    .select('ITEM_CODIGO, DESCRICAO')
    .or(`ITEM_CODIGO.ilike.%${query}%,DESCRICAO.ilike.%${query}%`)
    .limit(50);

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }

  return (data || []).map(p => ({
    value: String(p.ITEM_CODIGO),
    label: `${p.ITEM_CODIGO} - ${p.DESCRICAO}`
  }));
};

// Calculates Dashboard Stats manually (Client-side aggregation)
export const calcDashboardStatsManual = async (
  startDate: Date,
  endDate: Date,
  centroCusto: string | null = null,
  representative: string[] = [],
  cliente: string[] = [],
  produto: string[] = []
): Promise<Partial<DashboardComercialData>> => {
  try {
    const formattedStartDate = format(startDate, 'yyyy-MM-dd 00:00:00');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd 23:59:59');

    console.log(`[SERVICE] Calc Manual Stats: ${formattedStartDate} to ${formattedEndDate}`);

    // Fetch RAW Data (Invoices & Orders)
    let invoiceQuery = supabase
      .from('MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO')
      .select('data_emissao, valor_nota, quantidade, centrocusto, representante, pes_codigo, nota, item_codigo')
      .gte('data_emissao', formattedStartDate)
      .lte('data_emissao', formattedEndDate)
      .neq('status_faturamento', '2'); // Not Cancelled

    let orderQuery = supabase
      .from('BLUEBAY_PEDIDO')
      .select('DATA_PEDIDO, TOTAL_PRODUTO, QTDE_PEDIDA, VALOR_UNITARIO, CENTROCUSTO, REPRESENTANTE, STATUS, PES_CODIGO, ITEM_CODIGO, PED_NUMPEDIDO')
      .gte('DATA_PEDIDO', formattedStartDate)
      .lte('DATA_PEDIDO', formattedEndDate)
      .neq('STATUS', '4'); // Not Cancelled

    // Apply Filters
    if (centroCusto && centroCusto !== "none" && centroCusto !== "Não identificado") {
      invoiceQuery = invoiceQuery.eq('centrocusto', centroCusto);
      orderQuery = orderQuery.eq('CENTROCUSTO', centroCusto);
    }

    if (representative && representative.length > 0) {
      invoiceQuery = invoiceQuery.in('representante', representative);
      orderQuery = orderQuery.in('REPRESENTANTE', representative);
    }

    if (cliente && cliente.length > 0) {
      invoiceQuery = invoiceQuery.in('pes_codigo', cliente);
      orderQuery = orderQuery.in('PES_CODIGO', cliente);
    }

    if (produto && produto.length > 0) {
      invoiceQuery = invoiceQuery.in('item_codigo', produto);
      orderQuery = orderQuery.in('ITEM_CODIGO', produto);
    }

    const [invoiceRes, orderRes] = await Promise.all([invoiceQuery, orderQuery]);

    if (invoiceRes.error) throw invoiceRes.error;
    if (orderRes.error) throw orderRes.error;

    const invoices = invoiceRes.data || [];
    const orders = orderRes.data || [];

    // 2. Aggregate Data

    // Totals
    let totalFaturado = 0;
    let totalItens = 0;
    let totalPedidosValue = 0;
    const globalOrderIds = new Set<string>();
    orders.forEach((o: any) => { if (o.PED_NUMPEDIDO) globalOrderIds.add(o.PED_NUMPEDIDO); });
    let totalPedidosQty = globalOrderIds.size;

    // Maps
    const dailyMap = new Map<string, { total: number, faturamentoCount: number, pedidoTotal: number, pedidoCount: number }>();
    const dailyOrderIds = new Map<string, Set<string>>(); // Track unique order IDs per day
    const dailyInvoiceIds = new Map<string, Set<string>>(); // Track unique invoice IDs per day
    const ccMap = new Map<string, any>();
    const ccOrderIds = new Map<string, Set<string>>(); // Track unique order IDs per cost center
    const ccInvoiceIds = new Map<string, Set<string>>(); // Track unique invoice IDs per cost center
    const repMap = new Map<string, any>();
    const repOrderIds = new Map<string, Set<string>>(); // Track unique order IDs per representative
    const repInvoiceIds = new Map<string, Set<string>>(); // Track unique invoice IDs per representative
    const repIds = new Set<string>();

    // --- Process Invoices ---
    // --- Process Invoices ---
    invoices.forEach((inv: any) => {
      const valor = Number(inv.valor_nota) || 0;
      const qtde = Number(inv.quantidade) || 0;

      // Fix: Use Calculated Total (Qty * Unit) if available, or fallback to valor_nota
      const valorUnit = Number(inv.valor_unitario) || 0;
      const valorCalc = valorUnit > 0 ? (qtde * valorUnit) : valor;

      const valorFinal = valorCalc;

      totalFaturado += valorFinal;
      totalItens += qtde;

      // Daily
      const dateKey = inv.data_emissao ? inv.data_emissao.split('T')[0] : 'Unknown';
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { total: 0, faturamentoCount: 0, pedidoTotal: 0, pedidoCount: 0 });
      }
      const day = dailyMap.get(dateKey)!;
      day.total += valorFinal;
      day.faturamentoCount += 1;

      // Cost Center
      const ccKey = inv.centrocusto || 'Não identificado';
      if (!ccMap.has(ccKey)) {
        ccMap.set(ccKey, {
          nome: ccKey,
          totalFaturado: 0, totalItensFaturados: 0, totalPedidos: 0, totalItensPedidos: 0
        });
      }
      const cc = ccMap.get(ccKey);
      cc.totalFaturado += valor;
      cc.totalItensFaturados += qtde;

      // Representative
      const repKey = inv.representante ? String(inv.representante) : '0';
      repIds.add(repKey);
      if (!repMap.has(repKey)) {
        repMap.set(repKey, {
          id: repKey, nome: 'Loading...',
          totalFaturado: 0, totalItensFaturados: 0, totalPedidos: 0, totalItensPedidos: 0
        });
      }
      const rep = repMap.get(repKey);
      rep.totalFaturado += valor;
      rep.totalItensFaturados += qtde;
    });

    // --- Process Orders ---
    orders.forEach((order: any) => {
      const qtdePedida = Number(order.QTDE_PEDIDA) || 0;
      const valorUnit = Number(order.VALOR_UNITARIO) || 0;
      const valorPedido = qtdePedida * valorUnit;
      const totalProd = Number(order.TOTAL_PRODUTO) || 0;

      // Fix: If filtering by product, force calculation Qty * Unit as requested
      // Otherwise prefer totalProd if available
      const finalOrderValue = (produto && produto !== "none")
        ? valorPedido
        : (totalProd > 0 ? totalProd : valorPedido);

      totalPedidosValue += finalOrderValue;

      // Daily
      const dateKey = order.DATA_PEDIDO ? order.DATA_PEDIDO.split('T')[0] : 'Unknown';
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { total: 0, faturamentoCount: 0, pedidoTotal: 0, pedidoCount: 0 });
      }
      const day = dailyMap.get(dateKey)!;
      day.pedidoTotal += finalOrderValue;

      // Unique Order Count for Daily
      if (!dailyOrderIds.has(dateKey)) dailyOrderIds.set(dateKey, new Set());
      const dayOrders = dailyOrderIds.get(dateKey)!;
      if (order.PED_NUMPEDIDO && !dayOrders.has(order.PED_NUMPEDIDO)) {
        dayOrders.add(order.PED_NUMPEDIDO);
        day.pedidoCount += 1;
      }

      // Cost Center
      const ccKey = order.CENTROCUSTO || 'Não identificado';
      if (!ccMap.has(ccKey)) {
        ccMap.set(ccKey, {
          nome: ccKey,
          totalFaturado: 0, totalItensFaturados: 0, totalPedidos: 0, totalItensPedidos: 0
        });
      }
      const cc = ccMap.get(ccKey);
      cc.totalPedidos += finalOrderValue; // Store VALUE, not count
      cc.totalItensPedidos += qtdePedida;

      // Unique Order Count for Cost Center
      if (!ccOrderIds.has(ccKey)) ccOrderIds.set(ccKey, new Set());
      const ccOrders = ccOrderIds.get(ccKey)!;
      if (order.PED_NUMPEDIDO && !ccOrders.has(order.PED_NUMPEDIDO)) {
        ccOrders.add(order.PED_NUMPEDIDO);
        cc.totalPedidosCount = (cc.totalPedidosCount || 0) + 1;
      }

      // Representative
      const repKey = order.REPRESENTANTE ? String(order.REPRESENTANTE) : '0';
      repIds.add(repKey);
      if (!repMap.has(repKey)) {
        repMap.set(repKey, {
          id: repKey, nome: 'Loading...',
          totalFaturado: 0, totalItensFaturados: 0, totalPedidos: 0, totalItensPedidos: 0
        });
      }
      const rep = repMap.get(repKey);
      rep.totalPedidos += finalOrderValue; // Store VALUE, not count
      rep.totalItensPedidos += qtdePedida;

      // Unique Order Count for Representative
      if (!repOrderIds.has(repKey)) repOrderIds.set(repKey, new Set());
      const repOrders = repOrderIds.get(repKey)!;
      if (order.PED_NUMPEDIDO && !repOrders.has(order.PED_NUMPEDIDO)) {
        repOrders.add(order.PED_NUMPEDIDO);
        rep.totalPedidosCount = (rep.totalPedidosCount || 0) + 1;
      }
    });

    // Formatting Daily
    const dailyFaturamento = Array.from(dailyMap.entries()).map(([date, stats]) => ({
      date: date,
      formattedDate: format(parseISO(date), 'dd/MM/yyyy'),
      ...stats
    })).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    // Formatting Cost Centers
    const costCenterStats = Array.from(ccMap.values()).map(cc => ({
      ...cc,
      totalPedidos: cc.totalPedidos, // Now shows VALUE as requested
      valorPedidos: cc.totalPedidos,
      // Actually dashboard uses totalPedidos as count in table headers
      ticketMedioFaturado: cc.totalItensFaturados > 0 ? cc.totalFaturado / cc.totalItensFaturados : 0
    })).sort((a, b) => b.totalFaturado - a.totalFaturado);

    // Fetch Rep Names
    if (repIds.size > 0) {
      const { data: reps } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, APELIDO')
        .in('PES_CODIGO', Array.from(repIds));

      if (reps) {
        reps.forEach((r: any) => {
          const k = String(r.PES_CODIGO);
          if (repMap.has(k)) {
            repMap.get(k).nome = r.APELIDO;
          }
        });
      }
    }

    const representativeStats = Array.from(repMap.values()).map(r => ({
      ...r,
      totalPedidos: r.totalPedidos, // Now shows VALUE as requested
      valorPedidos: r.totalPedidos,
      ticketMedioFaturado: r.totalItensFaturados > 0 ? r.totalFaturado / r.totalItensFaturados : 0,
      nome: r.id === '0' ? 'Não identificado' : (r.nome === 'Loading...' ? `Rep ${r.id}` : r.nome)
    })).sort((a, b) => b.totalFaturado - a.totalFaturado); // Sort by Value

    return {
      dailyFaturamento,
      monthlyFaturamento: [],
      totalFaturado,
      totalItens,
      mediaValorItem: totalPedidosQty > 0 ? totalFaturado / totalPedidosQty : 0,
      totals: {
        totalFaturado,
        totalItens,
        mediaValorItem: totalPedidosQty > 0 ? totalFaturado / totalPedidosQty : 0,
        totalPedidosValue,
        totalPedidosQty
      },
      costCenterStats,
      representativeStats,
      dataRangeInfo: {
        startDateRequested: format(startDate, 'yyyy-MM-dd'),
        endDateRequested: format(endDate, 'yyyy-MM-dd'),
        startDateActual: dailyFaturamento[0]?.date || null,
        endDateActual: dailyFaturamento[dailyFaturamento.length - 1]?.date || null,
        hasCompleteData: true
      }
    };

  } catch (error) {
    console.error('[SERVICE] Error calculating manual stats:', error);
    throw error;
  }
}

// Added fetchCityStatsV2 to support MultiSelect filters and Order Values
export const fetchCityStatsV2 = async (
  startDate: string,
  endDate: string,
  filters: {
    centroCusto: string | null;
    representative: string[];
    cliente: string[];
    produto: string[];
  }
): Promise<import("./dashboardComercialTypes").CitySalesStat[]> => {
  const { centroCusto, representative, cliente, produto } = filters;
  const start = `${startDate} 00:00:00`;
  const end = `${endDate} 23:59:59`;
  const PAGE_SIZE = 1000;
  const maxRows = 300000; // Safety limit increased

  console.log(`[CITY_STATS] Fetching data with pagination (Max ${maxRows} rows)...`);

  // 1. Fetch Invoices (Faturamento) with Pagination
  let allInvoices: any[] = [];
  let hasMoreInvoices = true;
  let invPage = 0;

  while (hasMoreInvoices && allInvoices.length < maxRows) {
    let invoiceQuery = supabase
      .from('MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO')
      .select('pes_codigo, valor_nota')
      .gte('data_emissao', start)
      .lte('data_emissao', end)
      .neq('status_faturamento', '2')
      .range(invPage * PAGE_SIZE, (invPage + 1) * PAGE_SIZE - 1);

    // Apply Filters to Invoice Query
    if (centroCusto && centroCusto !== "none") {
      if (centroCusto === "Não identificado") {
        invoiceQuery = invoiceQuery.is('centrocusto', null);
      } else {
        invoiceQuery = invoiceQuery.eq('centrocusto', centroCusto);
      }
    }
    if (representative && representative.length > 0) invoiceQuery = invoiceQuery.in('representante', representative);
    if (cliente && cliente.length > 0) invoiceQuery = invoiceQuery.in('pes_codigo', cliente);
    // Note: invoice view might not have item_codigo support, usually ignored or needs check. 
    if (produto && produto.length > 0) invoiceQuery = invoiceQuery.in('item_codigo', produto);

    const { data: chunk, error } = await invoiceQuery;
    if (error) {
      console.error('[CITY_STATS] Error fetching invoices page ' + invPage, error);
      break;
    }

    if (chunk && chunk.length > 0) {
      allInvoices = [...allInvoices, ...chunk];
      hasMoreInvoices = chunk.length === PAGE_SIZE;
      invPage++;
    } else {
      hasMoreInvoices = false;
    }
  }

  // 1b. Fetch Orders (Pedidos) with Pagination
  let allOrders: any[] = [];
  let hasMoreOrders = true;
  let ordPage = 0;

  while (hasMoreOrders && allOrders.length < maxRows) {
    let orderQuery = supabase
      .from('BLUEBAY_PEDIDO')
      .select('PES_CODIGO, TOTAL_PRODUTO, QTDE_PEDIDA, VALOR_UNITARIO, PED_NUMPEDIDO, DATA_PEDIDO')
      .gte('DATA_PEDIDO', start)
      .lte('DATA_PEDIDO', end)
      .neq('STATUS', '4')
      .range(ordPage * PAGE_SIZE, (ordPage + 1) * PAGE_SIZE - 1);

    // Apply Filters to Order Query
    if (centroCusto && centroCusto !== "none") {
      if (centroCusto === "Não identificado") {
        orderQuery = orderQuery.is('CENTROCUSTO', null);
      } else {
        orderQuery = orderQuery.eq('CENTROCUSTO', centroCusto);
      }
    }
    if (representative && representative.length > 0) orderQuery = orderQuery.in('REPRESENTANTE', representative);
    if (cliente && cliente.length > 0) orderQuery = orderQuery.in('PES_CODIGO', cliente);
    if (produto && produto.length > 0) orderQuery = orderQuery.in('ITEM_CODIGO', produto);

    const { data: chunk, error } = await orderQuery;
    if (error) {
      console.error('[CITY_STATS] Error fetching orders page ' + ordPage, error);
      break;
    }

    if (chunk && chunk.length > 0) {
      allOrders = [...allOrders, ...chunk];
      hasMoreOrders = chunk.length === PAGE_SIZE;
      ordPage++;
    } else {
      hasMoreOrders = false;
    }
  }

  const invoices = allInvoices;
  const orders = allOrders;

  if (invoices.length === 0 && orders.length === 0) return [];

  // 2. Aggregate per Person
  const personMap = new Map<number, { fatTotal: number, fatCount: number, pedTotal: number, pedCount: number, orderIds: Set<string> }>();

  invoices.forEach((inv: any) => {
    const pid = Number(inv.pes_codigo);
    if (!pid) return;
    const val = Number(inv.valor_nota || 0);
    const curr = personMap.get(pid) || { fatTotal: 0, fatCount: 0, pedTotal: 0, pedCount: 0, orderIds: new Set() };
    curr.fatTotal += val;
    curr.fatCount += 1;
    personMap.set(pid, curr);
  });

  orders.forEach((ord: any) => {
    const pid = Number(ord.PES_CODIGO);
    if (!pid) return;
    const totalProd = Number(ord.TOTAL_PRODUTO) || 0;
    const calcVal = (Number(ord.QTDE_PEDIDA) || 0) * (Number(ord.VALOR_UNITARIO) || 0);
    const finalVal = totalProd > 0 ? totalProd : calcVal;

    const curr = personMap.get(pid) || { fatTotal: 0, fatCount: 0, pedTotal: 0, pedCount: 0, orderIds: new Set() };
    curr.pedTotal += finalVal;

    const orderId = ord.PED_NUMPEDIDO ? String(ord.PED_NUMPEDIDO) : null;
    if (orderId && !curr.orderIds.has(orderId)) {
      curr.orderIds.add(orderId);
      curr.pedCount += 1;
    } else if (!orderId) {
      curr.pedCount += 1;
    }

    personMap.set(pid, curr);
  });

  const uniquePersonIds = Array.from(personMap.keys());

  // 3. Fetch City/UF from BLUEBAY_PESSOA
  const citiesMap = new Map<number, { city: string, uf: string }>();
  if (uniquePersonIds.length > 0) {
    const chunkSize = 1000;
    for (let i = 0; i < uniquePersonIds.length; i += chunkSize) {
      const chunk = uniquePersonIds.slice(i, i + chunkSize);
      const { data: people } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, CIDADE, UF')
        .in('PES_CODIGO', chunk);

      if (people) {
        people.forEach((p: any) => {
          if (p.CIDADE) {
            citiesMap.set(Number(p.PES_CODIGO), { city: p.CIDADE, uf: p.UF || '' });
          }
        });
      }
    }
  }

  // 4. Aggregate by City
  const cityAggMap = new Map<string, any>();

  personMap.forEach((stats, pid) => {
    const cityInfo = citiesMap.get(pid);
    const cityKey = cityInfo ? `${cityInfo.city}-${cityInfo.uf}` : 'Indefinido-';
    const cityName = cityInfo ? cityInfo.city : 'Indefinido';
    const cityUf = cityInfo ? cityInfo.uf : '';

    if (!cityAggMap.has(cityKey)) {
      cityAggMap.set(cityKey, {
        city: cityName, uf: cityUf,
        totalFaturado: 0, totalFaturadoCount: 0,
        totalPedidosValue: 0, totalPedidosCount: 0
      });
    }
    const c = cityAggMap.get(cityKey);
    c.totalFaturado += stats.fatTotal;
    c.totalFaturadoCount += stats.fatCount;
    c.totalPedidosValue += stats.pedTotal;
    c.totalPedidosCount += stats.pedCount;
  });

  return Array.from(cityAggMap.values()).map(c => ({
    city: c.city,
    uf: c.uf,
    totalFaturado: c.totalFaturado,
    totalFaturadoCount: c.totalFaturadoCount,
    totalPedidosValue: c.totalPedidosValue,
    totalPedidosCount: c.totalPedidosCount
  })).sort((a, b) => b.totalFaturado - a.totalFaturado);
};
