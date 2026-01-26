import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronRight, Hash } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ProductItemStat } from "@/services/bluebay/dashboardComercialTypes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProductItemRowProps {
    item: ProductItemStat;
}

export const ProductItemRow = ({ item }: ProductItemRowProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
        <React.Fragment>
            <TableRow
                className="cursor-pointer hover:bg-muted/50"
                onClick={toggleExpand}
            >
                <TableCell className="w-10">
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </TableCell>
                <TableCell className="w-[100px] font-mono text-xs">{item.ITEM_CODIGO}</TableCell>
                <TableCell className="w-auto truncate max-w-[300px]" title={item.DESCRICAO}>{item.DESCRICAO}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(item.VALOR_PEDIDO)}</TableCell>
                <TableCell className="text-right">{item.QTDE_ITENS.toLocaleString('pt-BR')}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.VALOR_FATURADO)}</TableCell>
                <TableCell className="text-right">{item.QTDE_FATURADA.toLocaleString('pt-BR')}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.TM)}</TableCell>
            </TableRow>

            {isExpanded && (
                <TableRow>
                    <TableCell colSpan={8} className="p-0 bg-muted/20">
                        <div className="p-4 pl-12">
                            <h4 className="font-medium mb-2 text-sm text-muted-foreground">Pedidos do Item {item.ITEM_CODIGO}</h4>
                            <div className="border rounded-md bg-background">
                                <Table className="table-fixed">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[120px]">Pedido</TableHead>
                                            <TableHead className="w-[100px]">Data</TableHead>
                                            <TableHead className="w-auto">Cliente</TableHead>
                                            <TableHead className="text-right w-[100px]">Qtd. Pedida</TableHead>
                                            <TableHead className="text-right w-[120px]">Valor Unit.</TableHead>
                                            <TableHead className="text-right w-[120px]">Valor Total</TableHead>
                                            <TableHead className="text-right w-[100px]">Qtd. Fat</TableHead>
                                            <TableHead className="text-right w-[120px]">Valor Fat.</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {item.orders.map((order, idx) => (
                                            <TableRow key={`${order.PED_NUMPEDIDO}-${idx}`} className="text-xs">
                                                <TableCell className="font-medium">{order.PED_NUMPEDIDO}</TableCell>
                                                <TableCell>{order.DATA_PEDIDO ? format(new Date(order.DATA_PEDIDO), 'dd/MM/yyyy', { locale: ptBR }) : '-'}</TableCell>
                                                <TableCell className="truncate max-w-[200px]" title={order.APELIDO}>{order.APELIDO}</TableCell>
                                                <TableCell className="text-right">{order.QTDE_PEDIDA.toLocaleString('pt-BR')}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(order.VALOR_UNITARIO)}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(order.VALOR_TOTAL)}</TableCell>
                                                <TableCell className="text-right">{order.QTDE_ENTREGUE.toLocaleString('pt-BR')}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(order.VALOR_FATURADO)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </React.Fragment>
    );
};
