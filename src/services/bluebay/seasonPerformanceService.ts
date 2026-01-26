
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

export interface SeasonPerformanceStat {
    grupo: string;
    estacao: string;
    totalFaturado: number;
    itensFaturados: number;
    tmFaturado: number; // Ticket Médio por Item (Preço Médio)
    totalPedido: number;
    itensPedidos: number;
    items: SeasonItemStat[];
}

export interface SeasonItemStat {
    itemCodigo: string;
    descricao: string;
    totalFaturado: number;
    itensFaturados: number;
    tmFaturado: number;
    totalPedido: number;
    itensPedidos: number;
}

export const fetchSeasonPerformance = async (
    startDate: Date,
    endDate: Date,
    selectedSeasons: string[] = []
): Promise<SeasonPerformanceStat[]> => {
    try {
        const formattedStartDate = format(startDate, 'yyyy-MM-dd 00:00:00');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd 23:59:59');

        console.log(`[SEASON_SERVICE] Fetching stats: ${formattedStartDate} to ${formattedEndDate}`);


        // 1. Fetch Invoices (Faturamento) with Chunking
        let invoices: any[] = [];
        {
            let hasMore = true;
            let page = 0;
            const pageSize = 5000;

            while (hasMore) {
                const { data: chunk, error } = await supabase
                    .from('MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO')
                    .select('item_codigo, valor_nota, quantidade, status_faturamento')
                    .gte('data_emissao', formattedStartDate)
                    .lte('data_emissao', formattedEndDate)
                    .neq('status_faturamento', '2') // Exclude cancelled
                    .range(page * pageSize, (page + 1) * pageSize - 1);

                if (error) throw error;

                if (chunk && chunk.length > 0) {
                    invoices = [...invoices, ...chunk];
                    if (chunk.length < pageSize) hasMore = false;
                    page++;
                } else {
                    hasMore = false;
                }

                // Safety break for very large datasets to prevent browser crash
                if (invoices.length > 100000) {
                    console.warn("Limit of 100k invoices reached, stopping fetch.");
                    break;
                }
            }
        }

        // 2. Fetch Orders (Pedidos) with Chunking
        let orders: any[] = [];
        {
            let hasMore = true;
            let page = 0;
            const pageSize = 5000;

            while (hasMore) {
                const { data: chunk, error } = await supabase
                    .from('BLUEBAY_PEDIDO')
                    .select('ITEM_CODIGO, VALOR_UNITARIO, QTDE_PEDIDA, STATUS')
                    .gte('DATA_PEDIDO', formattedStartDate)
                    .lte('DATA_PEDIDO', formattedEndDate)
                    .neq('STATUS', '4') // Exclude cancelled
                    .range(page * pageSize, (page + 1) * pageSize - 1);

                if (error) throw error;

                if (chunk && chunk.length > 0) {
                    orders = [...orders, ...chunk];
                    if (chunk.length < pageSize) hasMore = false;
                    page++;
                } else {
                    hasMore = false;
                }

                if (orders.length > 100000) {
                    console.warn("Limit of 100k orders reached, stopping fetch.");
                    break;
                }
            }
        }

        // 3. Extract Unique Item Codes
        const itemCodes = new Set<string>();
        invoices?.forEach(i => i.item_codigo && itemCodes.add(i.item_codigo));
        orders?.forEach(o => o.ITEM_CODIGO && itemCodes.add(o.ITEM_CODIGO));

        if (itemCodes.size === 0) return [];

        // 4. Fetch Item Details (Group, Description) & Group Details (Season)
        // We need to join Item -> Group to get Season and Description
        // Fetch Items first
        const { data: itemsData, error: itemError } = await supabase
            .from('BLUEBAY_ITEM')
            .select('ITEM_CODIGO, DESCRICAO, GRU_CODIGO, GRU_DESCRICAO')
            .in('ITEM_CODIGO', Array.from(itemCodes));

        if (itemError) throw itemError;

        // Get unique group codes to fetch season
        const groupCodes = new Set<string>();
        itemsData?.forEach(i => i.GRU_CODIGO && groupCodes.add(i.GRU_CODIGO));

        // Fetch Groups to get Season
        let groupMap = new Map<string, { estacao: string, descricao: string }>();
        if (groupCodes.size > 0) {
            const { data: groupsData, error: grpError } = await supabase
                .from('bluebay_grupo_item')
                .select('gru_codigo, estacao_ano, gru_descricao') // Assuming gru_ codigo is text in DB based on previous interactions, but let's handle loose typing
                .in('gru_codigo', Array.from(groupCodes));

            if (grpError) console.warn("Error fetching groups:", grpError);

            groupsData?.forEach(g => {
                groupMap.set(String(g.gru_codigo), {
                    estacao: g.estacao_ano || 'Não Definida',
                    descricao: g.gru_descricao
                });
            });
        }

        // Map Item -> Group Info
        // Key: ItemCode, Value: { desc, groupDesc, season }
        const itemInfoMap = new Map<string, { desc: string, groupDesc: string, season: string }>();

        itemsData?.forEach(i => {
            const grp = groupMap.get(String(i.GRU_CODIGO));
            itemInfoMap.set(String(i.ITEM_CODIGO), {
                desc: i.DESCRICAO || 'Sem Descrição',
                groupDesc: i.GRU_DESCRICAO || grp?.descricao || 'Sem Grupo',
                season: grp?.estacao || 'Não Definida'
            });
        });

        // 5. Aggregate Data
        // Key: GroupDesc, Value: StatObject
        const aggregations = new Map<string, SeasonPerformanceStat>();

        // Helper to get or create group stat
        const getGroupStat = (groupName: string, season: string) => {
            if (!aggregations.has(groupName)) {
                aggregations.set(groupName, {
                    grupo: groupName,
                    estacao: season,
                    totalFaturado: 0,
                    itensFaturados: 0,
                    tmFaturado: 0,
                    totalPedido: 0,
                    itensPedidos: 0,
                    items: []
                });
            }
            return aggregations.get(groupName)!;
        };

        // Helper to find item in group
        const getItemStat = (groupStat: SeasonPerformanceStat, itemCode: string, itemDesc: string) => {
            let item = groupStat.items.find(i => i.itemCodigo === itemCode);
            if (!item) {
                item = {
                    itemCodigo: itemCode,
                    descricao: itemDesc,
                    totalFaturado: 0,
                    itensFaturados: 0,
                    tmFaturado: 0,
                    totalPedido: 0,
                    itensPedidos: 0
                };
                groupStat.items.push(item);
            }
            return item;
        };

        // Process Invoices
        invoices?.forEach(inv => {
            const itemCode = String(inv.item_codigo);
            const info = itemInfoMap.get(itemCode) || { desc: 'Desconhecido', groupDesc: 'Outros', season: '-' };

            const groupStat = getGroupStat(info.groupDesc, info.season);
            const itemStat = getItemStat(groupStat, itemCode, info.desc);

            const val = Number(inv.valor_nota) || 0;
            const qtd = Number(inv.quantidade) || 0;

            groupStat.totalFaturado += val;
            groupStat.itensFaturados += qtd;
            itemStat.totalFaturado += val;
            itemStat.itensFaturados += qtd;
        });

        // Process Orders
        orders?.forEach(ord => {
            const itemCode = String(ord.ITEM_CODIGO);
            const info = itemInfoMap.get(itemCode) || { desc: 'Desconhecido', groupDesc: 'Outros', season: '-' };

            const groupStat = getGroupStat(info.groupDesc, info.season);
            const itemStat = getItemStat(groupStat, itemCode, info.desc);

            const qtd = Number(ord.QTDE_PEDIDA) || 0;
            const valUnit = Number(ord.VALOR_UNITARIO) || 0;
            const valTotal = qtd * valUnit;

            groupStat.totalPedido += valTotal;
            groupStat.itensPedidos += qtd;
            itemStat.totalPedido += valTotal;
            itemStat.itensPedidos += qtd;
        });

        // Calculate TMs and Finalize
        const results = Array.from(aggregations.values())
            .filter(grp => {
                // Filter by season if provided
                if (selectedSeasons.length > 0) {
                    return selectedSeasons.includes(grp.estacao);
                }
                return true;
            })
            .map(grp => {
                // Calc Group TM
                grp.tmFaturado = grp.itensFaturados > 0 ? grp.totalFaturado / grp.itensFaturados : 0;

                // Calc Items TM
                grp.items = grp.items.map(i => {
                    i.tmFaturado = i.itensFaturados > 0 ? i.totalFaturado / i.itensFaturados : 0;
                    return i;
                });

                // Sort items by Total Faturado Desc
                grp.items.sort((a, b) => b.totalFaturado - a.totalFaturado);

                return grp;
            });

        // Sort groups by Total Faturado Desc
        return results.sort((a, b) => b.totalFaturado - a.totalFaturado);

    } catch (error) {
        console.error('[SEASON_SERVICE] Error:', error);
        return [];
    }
};
