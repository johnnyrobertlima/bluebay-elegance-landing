
import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { PedidoItem } from "@/services/bluebay/dashboardComercialTypes";
import { PedidoExpandableRow } from "./PedidoExpandableRow";
import { format, parseISO } from "date-fns";

interface GroupedPedido {
  DATA_PEDIDO: string | Date;
  pedidos: {
    PED_NUMPEDIDO: string;
    PED_ANOBASE: number;
    DATA_PEDIDO: string | Date;
    TOTAL_QUANTIDADE: number;
    TOTAL_VALOR: number;
    items: PedidoItem[];
  }[];
}

interface PedidosTableProps {
  pedidoData: PedidoItem[];
  isLoading: boolean;
}

export const PedidosTableContent: React.FC<PedidosTableProps> = ({ pedidoData, isLoading }) => {
  const [expandedPedidoDates, setExpandedPedidoDates] = useState<Set<string>>(new Set());
  const [expandedPedidos, setExpandedPedidos] = useState<Set<string>>(new Set());

  // Agrupar pedidos por data e número de pedido
  const groupedPedidoByDate: Record<string, GroupedPedido> = {};
  
  pedidoData.forEach(item => {
    if (!item.DATA_PEDIDO || !item.PED_NUMPEDIDO) return;
    
    const dateStr = typeof item.DATA_PEDIDO === 'string' 
      ? format(parseISO(item.DATA_PEDIDO), 'yyyy-MM-dd')
      : format(item.DATA_PEDIDO, 'yyyy-MM-dd');
    
    if (!groupedPedidoByDate[dateStr]) {
      groupedPedidoByDate[dateStr] = {
        DATA_PEDIDO: item.DATA_PEDIDO,
        pedidos: []
      };
    }

    // Criar key única para o pedido
    const pedidoKey = `${item.PED_NUMPEDIDO}-${item.PED_ANOBASE}`;
    
    // Verificar se já temos esse pedido no grupo da data
    const pedidoExistente = groupedPedidoByDate[dateStr].pedidos.find(
      p => `${p.PED_NUMPEDIDO}-${p.PED_ANOBASE}` === pedidoKey
    );
    
    if (pedidoExistente) {
      pedidoExistente.TOTAL_QUANTIDADE += (item.QTDE_PEDIDA || 0);
      pedidoExistente.TOTAL_VALOR += (item.QTDE_PEDIDA || 0) * (item.VALOR_UNITARIO || 0);
      pedidoExistente.items.push(item);
    } else {
      groupedPedidoByDate[dateStr].pedidos.push({
        PED_NUMPEDIDO: item.PED_NUMPEDIDO,
        PED_ANOBASE: item.PED_ANOBASE,
        DATA_PEDIDO: item.DATA_PEDIDO,
        TOTAL_QUANTIDADE: item.QTDE_PEDIDA || 0,
        TOTAL_VALOR: (item.QTDE_PEDIDA || 0) * (item.VALOR_UNITARIO || 0),
        items: [item]
      });
    }
  });
  
  // Converter para array e ordenar por data (mais recente primeiro)
  const groupedPedidos = Object.values(groupedPedidoByDate).sort((a, b) => {
    const dateA = new Date(a.DATA_PEDIDO).getTime();
    const dateB = new Date(b.DATA_PEDIDO).getTime();
    return dateB - dateA;
  });

  const togglePedidoDate = (dateStr: string) => {
    setExpandedPedidoDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr);
      } else {
        newSet.add(dateStr);
      }
      return newSet;
    });
  };

  const togglePedido = (pedidoKey: string) => {
    setExpandedPedidos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pedidoKey)) {
        newSet.delete(pedidoKey);
      } else {
        newSet.add(pedidoKey);
      }
      return newSet;
    });
  };

  if (groupedPedidos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum pedido encontrado para o período selecionado
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>Data Pedido</TableHead>
            <TableHead className="text-right">Total de Pedidos</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedPedidos.map((dateGroup) => {
            const dateStr = typeof dateGroup.DATA_PEDIDO === 'string'
              ? dateGroup.DATA_PEDIDO
              : format(dateGroup.DATA_PEDIDO, 'yyyy-MM-dd');
            
            return (
              <PedidoExpandableRow
                key={dateStr}
                dateStr={dateStr}
                dateGroup={dateGroup}
                expandedDates={expandedPedidoDates}
                expandedPedidos={expandedPedidos}
                togglePedidoDate={togglePedidoDate}
                togglePedido={togglePedido}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
