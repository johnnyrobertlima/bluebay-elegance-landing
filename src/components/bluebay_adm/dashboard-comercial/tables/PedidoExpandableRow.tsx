
import React from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { PedidoItem } from "@/services/bluebay/dashboardComercialTypes";

interface PedidoData {
  PED_NUMPEDIDO: string;
  PED_ANOBASE: number;
  DATA_PEDIDO: string | Date;
  TOTAL_QUANTIDADE: number;
  TOTAL_VALOR: number;
  items: PedidoItem[];
}

interface PedidoExpandableRowProps {
  dateStr: string;
  dateGroup: {
    DATA_PEDIDO: string | Date;
    pedidos: PedidoData[];
  };
  expandedDates: Set<string>;
  expandedPedidos: Set<string>;
  togglePedidoDate: (dateStr: string) => void;
  togglePedido: (pedidoKey: string) => void;
}

export const PedidoExpandableRow: React.FC<PedidoExpandableRowProps> = ({
  dateStr,
  dateGroup,
  expandedDates,
  expandedPedidos,
  togglePedidoDate,
  togglePedido
}) => {
  const totalPedidos = dateGroup.pedidos.length;
  const totalValor = dateGroup.pedidos.reduce((sum, pedido) => sum + pedido.TOTAL_VALOR, 0);
  
  const formatDate = (dateValue: string | Date) => {
    if (typeof dateValue === 'string') {
      return format(parseISO(dateValue), 'dd/MM/yyyy', { locale: ptBR });
    }
    return format(dateValue, 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <React.Fragment>
      <TableRow 
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => togglePedidoDate(dateStr)}
      >
        <TableCell>
          {expandedDates.has(dateStr) ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </TableCell>
        <TableCell className="font-medium">
          {formatDate(dateGroup.DATA_PEDIDO)}
        </TableCell>
        <TableCell className="text-right">{totalPedidos}</TableCell>
        <TableCell className="text-right">{formatCurrency(totalValor)}</TableCell>
      </TableRow>
      
      {expandedDates.has(dateStr) && (
        <TableRow>
          <TableCell colSpan={4} className="p-0 bg-muted/30">
            <div className="px-4 py-2">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Nº Pedido</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead className="text-right">Quantidade Total</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dateGroup.pedidos.map((pedido) => {
                    const pedidoKey = `${pedido.PED_NUMPEDIDO}-${pedido.PED_ANOBASE}`;
                    
                    return (
                      <React.Fragment key={pedidoKey}>
                        <TableRow 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => togglePedido(pedidoKey)}
                        >
                          <TableCell>
                            {expandedPedidos.has(pedidoKey) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{pedido.PED_NUMPEDIDO}</TableCell>
                          <TableCell>{pedido.PED_ANOBASE}</TableCell>
                          <TableCell className="text-right">{pedido.TOTAL_QUANTIDADE.toLocaleString('pt-BR')}</TableCell>
                          <TableCell className="text-right">{formatCurrency(pedido.TOTAL_VALOR)}</TableCell>
                        </TableRow>
                        
                        {expandedPedidos.has(pedidoKey) && (
                          <TableRow>
                            <TableCell colSpan={5} className="p-0 bg-muted/20">
                              <div className="p-4">
                                <h4 className="font-medium mb-2">
                                  Itens do Pedido {pedido.PED_NUMPEDIDO}/{pedido.PED_ANOBASE}
                                </h4>
                                <Table>
                                  <TableHead>
                                    <TableRow>
                                      <TableHead>Código Item</TableHead>
                                      <TableHead className="text-right">Qtd. Pedida</TableHead>
                                      <TableHead className="text-right">Qtd. Entregue</TableHead>
                                      <TableHead className="text-right">Qtd. Saldo</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead>Centro Custo</TableHead>
                                      <TableHead className="text-right">Valor Unitário</TableHead>
                                      <TableHead className="text-right">Valor Total</TableHead>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {pedido.items.map((item, idx) => {
                                      const totalItem = (item.QTDE_PEDIDA || 0) * (item.VALOR_UNITARIO || 0);
                                      const statusMap: Record<string, string> = {
                                        '0': 'Bloqueado',
                                        '1': 'Em Aberto',
                                        '2': 'Parcial',
                                        '3': 'Total',
                                        '4': 'Cancelado'
                                      };
                                      
                                      return (
                                        <TableRow key={`${pedidoKey}-${item.ITEM_CODIGO}-${idx}`}>
                                          <TableCell>{item.ITEM_CODIGO || '-'}</TableCell>
                                          <TableCell className="text-right">
                                            {item.QTDE_PEDIDA?.toLocaleString('pt-BR') || '-'}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {item.QTDE_ENTREGUE?.toLocaleString('pt-BR') || '-'}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {item.QTDE_SALDO?.toLocaleString('pt-BR') || '-'}
                                          </TableCell>
                                          <TableCell>
                                            {item.STATUS ? statusMap[item.STATUS] || item.STATUS : '-'}
                                          </TableCell>
                                          <TableCell>{item.CENTROCUSTO || '-'}</TableCell>
                                          <TableCell className="text-right">
                                            {formatCurrency(item.VALOR_UNITARIO || 0)}
                                          </TableCell>
                                          <TableCell className="text-right">{formatCurrency(totalItem)}</TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
};
