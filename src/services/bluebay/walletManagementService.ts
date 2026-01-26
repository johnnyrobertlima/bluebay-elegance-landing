
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
}

export const fetchWalletOrders = async (
    startDate: Date,
    endDate: Date
): Promise<WalletOrder[]> => {
    try {
        const formattedStartDate = format(startDate, 'yyyy-MM-dd 00:00:00');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd 23:59:59');

        console.log(`[WALLET_SERVICE] Fetching orders: ${formattedStartDate} to ${formattedEndDate}`);

        // Fetch Orders directly from BLUEBAY_PEDIDO
        // We need to fetch in chunks if data is large, similar to season report
        let allOrders: any[] = [];
        {
            let hasMore = true;
            let page = 0;
            const pageSize = 5000;

            while (hasMore) {
                const { data: chunk, error } = await supabase
                    .from('BLUEBAY_PEDIDO')
                    .select('PED_NUMPEDIDO, DATA_PEDIDO, PES_CODIGO, QTDE_PEDIDA, QTDE_ENTREGUE, QTDE_SALDO, VALOR_UNITARIO, STATUS')
                    .gte('DATA_PEDIDO', formattedStartDate)
                    .lte('DATA_PEDIDO', formattedEndDate)
                    .neq('STATUS', '4') // Exclude cancelled
                    .range(page * pageSize, (page + 1) * pageSize - 1);

                if (error) throw error;

                if (chunk && chunk.length > 0) {
                    allOrders = [...allOrders, ...chunk];
                    if (chunk.length < pageSize) hasMore = false;
                    page++;
                } else {
                    hasMore = false;
                }

                if (allOrders.length > 50000) break; // Safety limit
            }
        }

        if (allOrders.length === 0) return [];

        // Fetch Client Names
        const uniquePesCodigos = [...new Set(allOrders.map((o: any) => o.PES_CODIGO).filter(Boolean))];
        const clientMap = new Map<string, string>();

        if (uniquePesCodigos.length > 0) {
            // Chunk client fetch
            const batchSize = 1000;
            for (let i = 0; i < uniquePesCodigos.length; i += batchSize) {
                const batch = uniquePesCodigos.slice(i, i + batchSize);
                const { data: clients, error: clientError } = await supabase
                    .from('BLUEBAY_PESSOA')
                    .select('PES_CODIGO, RAZAOSOCIAL, APELIDO')
                    .in('PES_CODIGO', batch);

                if (clientError) console.error("Error fetching clients:", clientError);

                clients?.forEach((c: any) => {
                    const name = c.APELIDO && c.APELIDO.trim() !== '' ? c.APELIDO : c.RAZAOSOCIAL;
                    clientMap.set(String(c.PES_CODIGO), name || `Cliente ${c.PES_CODIGO}`);
                });
            }
        }

        // Aggregate by Client
        const clientMapAgg = new Map<string, WalletOrder>();

        allOrders.forEach((order: any) => {
            const pesCodigo = order.PES_CODIGO;
            const key = String(pesCodigo);

            if (!clientMapAgg.has(key)) {
                clientMapAgg.set(key, {
                    pedNumPedido: 'Vários',
                    dataPedido: order.DATA_PEDIDO, // Keep most recent
                    pesCodigo: pesCodigo,
                    clienteNome: clientMap.get(key) || `Cliente ${pesCodigo}`,
                    qtdePedida: 0,
                    qtdeEntregue: 0,
                    qtdeSaldo: 0,
                    valorUnitario: 0,
                    valorTotalPedido: 0,
                    valorTotalEntregue: 0,
                    valorTotalSaldo: 0,
                    status: 'Variado'
                });
            }

            const stats = clientMapAgg.get(key)!;
            const qPedida = order.QTDE_PEDIDA || 0;
            const qEntregue = order.QTDE_ENTREGUE || 0;
            const qSaldo = order.QTDE_SALDO || 0;
            const vUnit = order.VALOR_UNITARIO || 0;

            stats.qtdePedida += qPedida;
            stats.qtdeEntregue += qEntregue;
            stats.qtdeSaldo += qSaldo;

            stats.valorTotalPedido += qPedida * vUnit;
            stats.valorTotalEntregue += qEntregue * vUnit;
            stats.valorTotalSaldo += qSaldo * vUnit;

            // Keep the latest date
            if (new Date(order.DATA_PEDIDO) > new Date(stats.dataPedido)) {
                stats.dataPedido = order.DATA_PEDIDO;
            }
        });

        // Return aggregated array sorted by Total Saldo (descending)
        return Array.from(clientMapAgg.values()).sort((a, b) => b.valorTotalSaldo - a.valorTotalSaldo);

    } catch (error) {
        console.error('[WALLET_SERVICE] Error:', error);
        return [];
    }
};
