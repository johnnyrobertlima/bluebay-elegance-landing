
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

export interface WalletOrder {
    pedNumPedido: string;
    dataPedido: string;
    pesCodigo: number;
    clienteNome: string;
    qtdePedida: number;
    qtdeEntregue: number;
    qtdeSaldo: number;
    valorUnitario: number;
    valorTotalPedido: number;
    valorTotalEntregue: number;
    valorTotalSaldo: number;
    status: string;
    categoria: string;
    orders?: any[];
}

export const fetchWalletOrders = async (
    startDate: Date,
    endDate: Date,
    representativeIds?: string[], // Optional filter (array)
    onlyPending: boolean = true // Default to true (Show only Open/Partial)
): Promise<WalletOrder[]> => {
    try {
        const formattedStartDate = format(startDate, 'yyyy-MM-dd 00:00:00');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd 23:59:59');

        console.log(`[WALLET_SERVICE] Fetching orders: ${formattedStartDate} to ${formattedEndDate} (Reps: ${representativeIds?.join(',')}) - Pending Only: ${onlyPending}`);

        // 1. Fetch Orders directly from BLUEBAY_PEDIDO
        let allOrders: any[] = [];
        {
            let hasMore = true;
            let page = 0;
            const pageSize = 5000;

            while (hasMore) {
                let query = supabase
                    .from('BLUEBAY_PEDIDO')
                    .select('PED_NUMPEDIDO, DATA_PEDIDO, PES_CODIGO, QTDE_PEDIDA, QTDE_ENTREGUE, QTDE_SALDO, VALOR_UNITARIO, STATUS, ITEM_CODIGO')
                    .gte('DATA_PEDIDO', formattedStartDate)
                    .lte('DATA_PEDIDO', formattedEndDate);

                if (onlyPending) {
                    query = query.in('STATUS', ['1', '2']);
                }

                if (representativeIds && representativeIds.length > 0) {
                    query = query.in('REPRESENTANTE', representativeIds.map(Number));
                }

                const { data: chunk, error } = await query.range(page * pageSize, (page + 1) * pageSize - 1);

                if (error) throw error;

                if (chunk && chunk.length > 0) {
                    allOrders = [...allOrders, ...chunk];
                    if (chunk.length < pageSize) hasMore = false;
                    page++;
                } else {
                    hasMore = false;
                }

                // Increased safety limit to 100k
                if (allOrders.length > 100000) {
                    console.warn('[WALLET_SERVICE] Hit 100k safety limit, some data might be truncated');
                    break;
                }
            }
        }

        if (allOrders.length === 0) return [];

        // 2. Parallel Fetch Metadata (Clients and Items) for performance
        const uniquePesCodigos = [...new Set(allOrders.map((o: any) => o.PES_CODIGO).filter(Boolean))];
        const uniqueItemCodigos = [...new Set(allOrders.map((o: any) => o.ITEM_CODIGO).filter(Boolean))];

        const clientMap = new Map<string, { name: string, categoria: string }>();
        const itemMap = new Map<string, string>();

        await Promise.all([
            // Batch fetch clients
            (async () => {
                const batchSize = 1000;
                for (let i = 0; i < uniquePesCodigos.length; i += batchSize) {
                    const batch = uniquePesCodigos.slice(i, i + batchSize);
                    const { data: clients, error: clientError } = await supabase
                        .from('BLUEBAY_PESSOA')
                        .select('PES_CODIGO, RAZAOSOCIAL, APELIDO, NOME_CATEGORIA')
                        .in('PES_CODIGO', batch);

                    if (clientError) console.error("Error fetching clients:", clientError);

                    clients?.forEach((c: any) => {
                        const name = c.APELIDO && c.APELIDO.trim() !== '' ? c.APELIDO : c.RAZAOSOCIAL;
                        clientMap.set(String(c.PES_CODIGO), {
                            name: name || `Cliente ${c.PES_CODIGO}`,
                            categoria: c.NOME_CATEGORIA || 'Sem Categoria'
                        });
                    });
                }
            })(),
            // Batch fetch items
            (async () => {
                const batchSize = 1000;
                for (let i = 0; i < uniqueItemCodigos.length; i += batchSize) {
                    const batch = uniqueItemCodigos.slice(i, i + batchSize);
                    const { data: items, error: itemError } = await supabase
                        .from('BLUEBAY_ITEM')
                        .select('ITEM_CODIGO, DESCRICAO')
                        .in('ITEM_CODIGO', batch);

                    if (itemError) console.error("Error fetching items:", itemError);

                    items?.forEach((item: any) => {
                        itemMap.set(item.ITEM_CODIGO, item.DESCRICAO || '');
                    });
                }
            })()
        ]);

        // 3. Aggregate by Client -> Order -> Items
        const clientMapAgg = new Map<string, WalletOrder>();
        const clientOrdersMap = new Map<string, Map<string, any>>(); // ClientId -> Map<OrderNum, OrderDetails>

        allOrders.forEach((order: any) => {
            const pesCodigo = order.PES_CODIGO;
            const key = String(pesCodigo);
            const pedNum = order.PED_NUMPEDIDO;

            // Initialize Client Aggregation
            if (!clientMapAgg.has(key)) {
                const clientInfo = clientMap.get(key) || { name: `Cliente ${pesCodigo}`, categoria: 'Sem Categoria' };

                clientMapAgg.set(key, {
                    pedNumPedido: 'Vários',
                    dataPedido: order.DATA_PEDIDO,
                    pesCodigo: pesCodigo,
                    clienteNome: clientInfo.name,
                    categoria: clientInfo.categoria,
                    qtdePedida: 0,
                    qtdeEntregue: 0,
                    qtdeSaldo: 0,
                    valorUnitario: 0,
                    valorTotalPedido: 0,
                    valorTotalEntregue: 0,
                    valorTotalSaldo: 0,
                    status: 'Variado',
                    orders: []
                });

                clientOrdersMap.set(key, new Map());
            }

            // Aggregate Client Totals
            const clientStats = clientMapAgg.get(key)!;
            const qPedida = order.QTDE_PEDIDA || 0;
            const qEntregue = order.QTDE_ENTREGUE || 0;
            const qSaldo = order.QTDE_SALDO || 0;
            const vUnit = order.VALOR_UNITARIO || 0;

            clientStats.qtdePedida += qPedida;
            clientStats.qtdeEntregue += qEntregue;
            clientStats.qtdeSaldo += qSaldo;
            clientStats.valorTotalPedido += qPedida * vUnit;
            clientStats.valorTotalEntregue += qEntregue * vUnit;
            clientStats.valorTotalSaldo += qSaldo * vUnit;

            if (new Date(order.DATA_PEDIDO) > new Date(clientStats.dataPedido)) {
                clientStats.dataPedido = order.DATA_PEDIDO;
            }

            // Consolidate by Order Number (Level 3)
            const clientOrders = clientOrdersMap.get(key)!;
            if (!clientOrders.has(pedNum)) {
                clientOrders.set(pedNum, {
                    pedNumPedido: pedNum,
                    dataPedido: order.DATA_PEDIDO,
                    qtdePedida: 0,
                    qtdeEntregue: 0,
                    qtdeSaldo: 0,
                    valorTotal: 0,
                    valorTotalEntregue: 0,
                    valorTotalSaldo: 0,
                    status: order.STATUS,
                    items: [] // Level 4
                });
            }

            const orderStats = clientOrders.get(pedNum)!;
            orderStats.qtdePedida += qPedida;
            orderStats.qtdeEntregue += qEntregue;
            orderStats.qtdeSaldo += qSaldo;
            orderStats.valorTotal += qPedida * vUnit;
            orderStats.valorTotalEntregue += qEntregue * vUnit;
            orderStats.valorTotalSaldo += qSaldo * vUnit;

            // Add Item Detail (Level 4)
            orderStats.items.push({
                itemCodigo: order.ITEM_CODIGO,
                descricao: itemMap.get(order.ITEM_CODIGO) || 'Produto sem descrição',
                qtdePedida: qPedida,
                qtdeEntregue: qEntregue,
                qtdeSaldo: qSaldo,
                valorUnitario: vUnit,
                valorTotal: qPedida * vUnit,
                status: order.STATUS
            });
        });

        // 4. Transform Maps to Arrays
        for (const [key, clientStats] of clientMapAgg.entries()) {
            const ordersMap = clientOrdersMap.get(key)!;
            const ordersArray = Array.from(ordersMap.values()).sort((a, b) =>
                new Date(b.dataPedido).getTime() - new Date(a.dataPedido).getTime()
            );
            clientStats.orders = ordersArray;
        }

        // Return aggregated array sorted by Total Saldo (descending)
        return Array.from(clientMapAgg.values()).sort((a, b) => b.valorTotalSaldo - a.valorTotalSaldo);

    } catch (error) {
        console.error('[WALLET_SERVICE] Error:', error);
        return [];
    }
};
