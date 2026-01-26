
import React from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableRow, TableHead, TableCell, TableHeader } from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PedidoItem } from "@/services/bluebay/dashboardComercialTypes";

interface GroupedPedidoItem {
    PED_NUMPEDIDO: string;
    DATA_PEDIDO: string | Date;
    TOTAL_QUANTIDADE: number;
    TOTAL_VALOR: number;
    items: PedidoItem[];
}

interface PedidosExpandableRowProps {
    dateStr: string;
    dateGroup: {
        DATA_PEDIDO: string | Date;
        pedidos: GroupedPedidoItem[];
    };
    expandedDates: Set<string>;
    expandedOrders: Set<string>;
    toggleDate: (dateStr: string) => void;
    toggleOrder: (orderId: string) => void;
    stats?: {
        totalCount: number;
        totalValue: number;
    };
    isLoading?: boolean;
}

export const PedidosExpandableRow: React.FC<PedidosExpandableRowProps> = ({
    dateStr,
    dateGroup,
    expandedDates,
    expandedOrders,
    toggleDate,
    toggleOrder,
    stats,
    isLoading
}) => {
    const totalPedidos = stats ? stats.totalCount : dateGroup.pedidos.length;
    const totalValor = stats ? stats.totalValue : dateGroup.pedidos.reduce((sum, ped) => sum + ped.TOTAL_VALOR, 0);

    const formatDate = (dateValue: string | Date) => {
        if (!dateValue) return '-';

        try {
            if (typeof dateValue === 'string') {
                const dateObj = parseISO(dateValue);
                // Only format if valid
                if (isNaN(dateObj.getTime())) return dateValue;
                return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
            }
            return format(dateValue, 'dd/MM/yyyy', { locale: ptBR });
        } catch (error) {
            console.error("Error formatting date:", dateValue, error);
            return '-';
        }
    };

    return (
        <React.Fragment>
            <TableRow
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => toggleDate(dateStr)}
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
                            {isLoading ? (
                                <div className="flex justify-center items-center py-4">
                                    <span className="text-muted-foreground mr-2">Carregando pedidos...</span>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-10"></TableHead>
                                            <TableHead className="w-[120px]">Pedido</TableHead>
                                            <TableHead className="w-auto">Apelido</TableHead>
                                            <TableHead className="text-right w-[100px]">Qtd</TableHead>
                                            <TableHead className="text-right w-[120px]">TM</TableHead>
                                            <TableHead className="text-right w-[150px]">Valor Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dateGroup.pedidos.map((ped) => {
                                            const pedKey = ped.PED_NUMPEDIDO;
                                            // Debug log
                                            // console.log('[DEBUG_UI] Pedido Row Data:', pedKey, ped.items[0]?.APELIDO);


                                            return (
                                                <React.Fragment key={pedKey}>
                                                    <TableRow
                                                        className="cursor-pointer hover:bg-muted/50"
                                                        onClick={() => toggleOrder(pedKey)}
                                                    >
                                                        <TableCell className="w-10">
                                                            {expandedOrders.has(pedKey) ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="w-[120px] font-medium">{ped.PED_NUMPEDIDO}</TableCell>
                                                        <TableCell className="w-auto text-sm text-muted-foreground uppercase truncate max-w-[200px]" title={ped.items[0]?.APELIDO || '-'}>{ped.items[0]?.APELIDO || '-'}</TableCell>
                                                        <TableCell className="w-[100px] text-right">{ped.TOTAL_QUANTIDADE.toLocaleString('pt-BR')}</TableCell>
                                                        <TableCell className="w-[120px] text-right">
                                                            {formatCurrency(ped.TOTAL_QUANTIDADE > 0 ? ped.TOTAL_VALOR / ped.TOTAL_QUANTIDADE : 0)}
                                                        </TableCell>
                                                        <TableCell className="w-[150px] text-right">{formatCurrency(ped.TOTAL_VALOR)}</TableCell>
                                                    </TableRow>

                                                    {expandedOrders.has(pedKey) && (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="p-0 bg-muted/20">
                                                                <div className="p-4">
                                                                    <h4 className="font-medium mb-2">Itens do Pedido {ped.PED_NUMPEDIDO}</h4>
                                                                    <Table className="table-fixed">
                                                                        <TableHeader>
                                                                            <TableRow>
                                                                                <TableHead className="w-[120px]">Código Item</TableHead>
                                                                                <TableHead className="w-auto">Descrição</TableHead>
                                                                                <TableHead className="text-right w-[100px]">Qtd. Pedida</TableHead>
                                                                                <TableHead className="text-right w-[100px]">Qtd. Entregue</TableHead>
                                                                                <TableHead className="text-right w-[100px]">Saldo</TableHead>
                                                                                <TableHead className="text-right w-[120px]">Valor Unitário</TableHead>
                                                                                <TableHead className="text-right w-[150px]">Valor Total</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {ped.items.map((item, idx) => (
                                                                                <TableRow key={`${pedKey}-${item.ITEM_CODIGO || 'unk'}-${idx}`}>
                                                                                    <TableCell className="w-[120px] font-mono text-xs">{item.ITEM_CODIGO || '-'}</TableCell>
                                                                                    <TableCell className="w-auto text-xs text-muted-foreground uppercase truncate max-w-[300px]" title={item.DESCRICAO || ''}>{item.DESCRICAO || '-'}</TableCell>
                                                                                    <TableCell className="w-[100px] text-right">{item.QTDE_PEDIDA?.toLocaleString('pt-BR')}</TableCell>
                                                                                    <TableCell className="w-[100px] text-right">{item.QTDE_ENTREGUE?.toLocaleString('pt-BR')}</TableCell>
                                                                                    <TableCell className="w-[100px] text-right">{item.QTDE_SALDO?.toLocaleString('pt-BR')}</TableCell>
                                                                                    <TableCell className="w-[120px] text-right">{formatCurrency(item.VALOR_UNITARIO)}</TableCell>
                                                                                    <TableCell className="w-[150px] text-right">
                                                                                        {formatCurrency((item.QTDE_PEDIDA || 0) * (item.VALOR_UNITARIO || 0))}
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            ))}
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
                            )}
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </React.Fragment>
    );
};
