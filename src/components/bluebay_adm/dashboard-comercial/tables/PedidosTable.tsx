import React, { useState } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { PedidoItem, DailyFaturamento } from "@/services/bluebay/dashboardComercialTypes";
import { format, parseISO } from "date-fns";
import { Loader2 } from 'lucide-react';
import { PedidosExpandableRow } from './PedidosExpandableRow';

interface PedidosTableContentProps {
  dailyStats: DailyFaturamento[];
  isLoading: boolean;
  onFetchDayOrders: (date: Date) => Promise<PedidoItem[]>;
}

const groupOrders = (items: PedidoItem[], dateStr: string) => {
  const grouped: any = {
    DATA_PEDIDO: dateStr,
    pedidos: []
  };

  const orderMap: Record<string, any> = {};

  items.forEach(item => {
    if (!item.PED_NUMPEDIDO) return;

    if (!orderMap[item.PED_NUMPEDIDO]) {
      orderMap[item.PED_NUMPEDIDO] = {
        PED_NUMPEDIDO: item.PED_NUMPEDIDO,
        DATA_PEDIDO: item.DATA_PEDIDO,
        TOTAL_QUANTIDADE: 0,
        TOTAL_VALOR: 0,
        items: []
      };
      grouped.pedidos.push(orderMap[item.PED_NUMPEDIDO]);
    }

    const group = orderMap[item.PED_NUMPEDIDO];
    const qty = item.QTDE_PEDIDA || 0;
    const valUnit = item.VALOR_UNITARIO || 0;

    group.TOTAL_QUANTIDADE += qty;
    group.TOTAL_VALOR += (qty * valUnit);
    group.items.push(item);
  });

  return grouped;
};

export const PedidosTable: React.FC<PedidosTableContentProps> = ({
  dailyStats,
  isLoading,
  onFetchDayOrders
}) => {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const [loadedData, setLoadedData] = useState<Record<string, PedidoItem[]>>({});
  const [loadingDates, setLoadingDates] = useState<Set<string>>(new Set());

  const toggleDate = async (dateStr: string) => {
    const isExpanding = !expandedDates.has(dateStr);

    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (isExpanding) newSet.add(dateStr);
      else newSet.delete(dateStr);
      return newSet;
    });

    if (isExpanding && !loadedData[dateStr]) {
      setLoadingDates(prev => new Set(prev).add(dateStr));
      try {
        const dateObj = parseISO(dateStr);
        const orders = await onFetchDayOrders(dateObj);
        setLoadedData(prev => ({ ...prev, [dateStr]: orders }));
      } catch (e) {
        console.error("Failed to load orders", e);
      } finally {
        setLoadingDates(prev => {
          const n = new Set(prev);
          n.delete(dateStr);
          return n;
        });
      }
    }
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) newSet.delete(orderId);
      else newSet.add(orderId);
      return newSet;
    });
  };

  const stats = dailyStats || [];

  if (isLoading && stats.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
      </div>
    );
  }

  if (stats.length === 0) {
    return <div className="text-center p-8 text-muted-foreground">Nenhum pedido encontrado.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>Data Pedido</TableHead>
            <TableHead className="text-right">Pedidos</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((stat) => {
            const dateStr = stat.date;

            const orders = loadedData[dateStr] || [];
            const isLoaded = !!loadedData[dateStr];
            const isLoadingDetails = loadingDates.has(dateStr);

            const dateGroup = isLoaded
              ? groupOrders(orders, dateStr)
              : { DATA_PEDIDO: dateStr, pedidos: [] };

            return (
              <PedidosExpandableRow
                key={dateStr}
                dateStr={dateStr}
                dateGroup={dateGroup}
                expandedDates={expandedDates}
                expandedOrders={expandedOrders}
                toggleDate={toggleDate}
                toggleOrder={toggleOrder}
                stats={{
                  totalCount: stat.pedidoCount || 0,
                  totalValue: stat.pedidoTotal
                }}
                isLoading={isLoadingDetails}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
