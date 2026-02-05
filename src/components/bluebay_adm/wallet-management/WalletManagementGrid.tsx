
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2, ChevronRight, ChevronDown } from "lucide-react";
import { WalletOrder } from "@/services/bluebay/walletManagementService";
import { formatCurrency } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface WalletManagementGridProps {
    data: WalletOrder[];
    isLoading: boolean;
}

const ProgressBar = ({ delivered, total, pending, onHoverDetails }: { delivered: number, total: number, pending: number, onHoverDetails: any }) => {
    const progress = total > 0 ? (delivered / total) * 100 : 0;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="w-full h-4 bg-secondary rounded-full overflow-hidden cursor-help relative">
                        <div
                            className="h-full bg-green-500 transition-all duration-500 ease-in-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </TooltipTrigger>
                <TooltipContent className="p-4 bg-popover border text-popover-foreground shadow-md rounded-md">
                    <div className="space-y-1 text-xs">
                        <div className="font-bold border-b pb-1 mb-1">Detalhes Financeiros</div>
                        <div className="flex justify-between gap-4">
                            <span>Total ({total}):</span>
                            <span className="font-mono">{formatCurrency(onHoverDetails.total)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-green-600">
                            <span>Entregue ({delivered}):</span>
                            <span className="font-mono">{formatCurrency(onHoverDetails.delivered)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-orange-600">
                            <span>Saldo ({pending}):</span>
                            <span className="font-mono">{formatCurrency(onHoverDetails.pending)}</span>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export const WalletManagementGrid = ({ data, isLoading }: WalletManagementGridProps) => {
    // State to track expanded categories
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    // State to track expanded orders (Level 3 -> Level 4)
    const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const toggleOrder = (orderId: string) => {
        setExpandedOrders(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    // Group data by category
    const { groupedData, globalTotals } = useMemo(() => {
        const groups: Record<string, {
            items: WalletOrder[],
            totals: {
                qtdePedida: number,
                qtdeEntregue: number,
                qtdeSaldo: number,
                valorTotalPedido: number,
                valorTotalEntregue: number,
                valorTotalSaldo: number
            }
        }> = {};

        const global = {
            qtdePedida: 0,
            qtdeEntregue: 0,
            qtdeSaldo: 0,
            valorTotalPedido: 0,
            valorTotalEntregue: 0,
            valorTotalSaldo: 0
        };

        data.forEach(order => {
            const cat = order.categoria || 'Sem Categoria';
            if (!groups[cat]) {
                groups[cat] = {
                    items: [],
                    totals: {
                        qtdePedida: 0,
                        qtdeEntregue: 0,
                        qtdeSaldo: 0,
                        valorTotalPedido: 0,
                        valorTotalEntregue: 0,
                        valorTotalSaldo: 0
                    }
                };
            }
            groups[cat].items.push(order);

            // Accumulate totals
            groups[cat].totals.qtdePedida += order.qtdePedida;
            groups[cat].totals.qtdeEntregue += order.qtdeEntregue;
            groups[cat].totals.qtdeSaldo += order.qtdeSaldo;
            groups[cat].totals.valorTotalPedido += order.valorTotalPedido;
            groups[cat].totals.valorTotalEntregue += order.valorTotalEntregue;
            groups[cat].totals.valorTotalSaldo += order.valorTotalSaldo;

            // Global totals
            global.qtdePedida += order.qtdePedida;
            global.qtdeEntregue += order.qtdeEntregue;
            global.qtdeSaldo += order.qtdeSaldo;
            global.valorTotalPedido += order.valorTotalPedido;
            global.valorTotalEntregue += order.valorTotalEntregue;
            global.valorTotalSaldo += order.valorTotalSaldo;
        });

        const sortedGroups = Object.entries(groups).sort(([, a], [, b]) => b.totals.valorTotalSaldo - a.totals.valorTotalSaldo);

        return {
            groupedData: sortedGroups,
            globalTotals: global
        };
    }, [data]);


    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (data.length === 0) {
        return <div className="text-center p-8 text-muted-foreground">Nenhum pedido encontrado para o período.</div>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Categoria / Cliente</TableHead>
                        <TableHead className="w-[100px] text-right">Qtd. Pedida</TableHead>
                        <TableHead className="w-[100px] text-right">Qtd. Entregue</TableHead>
                        <TableHead className="w-[100px] text-right">Saldo</TableHead>
                        <TableHead className="w-[200px]">Status Entrega</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groupedData.map(([category, { items, totals }]) => {
                        // Check if this is the "Sem Categoria" or "GERAL" group to flatten it
                        const cleanCat = category.toUpperCase().trim();
                        const isFlattened = cleanCat === 'SEM CATEGORIA' || cleanCat === 'GERAL';

                        return (
                            <React.Fragment key={category}>
                                {/* Category Row - Only render if not flattened */}
                                {!isFlattened && (
                                    <TableRow
                                        className="bg-muted/50 hover:bg-muted cursor-pointer font-semibold"
                                        onClick={() => toggleCategory(category)}
                                    >
                                        <TableCell>
                                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                                                {expandedCategories[category] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            </Button>
                                        </TableCell>
                                        <TableCell>{category}</TableCell>
                                        <TableCell className="text-right">{totals.qtdePedida}</TableCell>
                                        <TableCell className="text-right text-green-600">{totals.qtdeEntregue}</TableCell>
                                        <TableCell className="text-right text-orange-600">{totals.qtdeSaldo}</TableCell>
                                        <TableCell>
                                            <ProgressBar
                                                delivered={totals.qtdeEntregue}
                                                total={totals.qtdePedida}
                                                pending={totals.qtdeSaldo}
                                                onHoverDetails={{
                                                    total: totals.valorTotalPedido,
                                                    delivered: totals.valorTotalEntregue,
                                                    pending: totals.valorTotalSaldo
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}

                                {/* Client Rows (Expanded or Flattened) */}
                                {(isFlattened || expandedCategories[category]) && items.map((order) => {
                                    const isClientExpanded = expandedCategories[`client-${order.pesCodigo}`];

                                    return (
                                        <React.Fragment key={order.pesCodigo}>
                                            <TableRow className={isFlattened ? "bg-background font-medium hover:bg-muted/50" : "bg-background/50"}>
                                                {/* Indent Level: Level 1 (Flattened) vs Level 2 (Nested) */}
                                                {isFlattened ? (
                                                    // Level 1 Style (Like Category)
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-4 w-4 p-0"
                                                            onClick={() => toggleCategory(`client-${order.pesCodigo}`)}
                                                        >
                                                            {isClientExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                        </Button>
                                                    </TableCell>
                                                ) : (
                                                    // Level 2 Style (Nested)
                                                    <TableCell></TableCell>
                                                )}

                                                <TableCell className={isFlattened ? "" : "pl-10"}>
                                                    <div className="flex items-center gap-2">
                                                        {/* For nested, chevron is here. For flattened, chevron is in first col */}
                                                        {!isFlattened && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-4 w-4 p-0"
                                                                onClick={() => toggleCategory(`client-${order.pesCodigo}`)}
                                                            >
                                                                {isClientExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                            </Button>
                                                        )}
                                                        <div className="flex flex-col cursor-pointer" onClick={() => toggleCategory(`client-${order.pesCodigo}`)}>
                                                            <span className={isFlattened ? "font-semibold" : "font-medium"}>{order.clienteNome}</span>
                                                            <span className="text-xs text-muted-foreground">Cód: {order.pesCodigo}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-right">{order.qtdePedida}</TableCell>
                                                <TableCell className="text-right text-green-600">{order.qtdeEntregue}</TableCell>
                                                <TableCell className="text-right text-orange-600">{order.qtdeSaldo}</TableCell>
                                                <TableCell>
                                                    <ProgressBar
                                                        delivered={order.qtdeEntregue}
                                                        total={order.qtdePedida}
                                                        pending={order.qtdeSaldo}
                                                        onHoverDetails={{
                                                            total: order.valorTotalPedido,
                                                            delivered: order.valorTotalEntregue,
                                                            pending: order.valorTotalSaldo
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>

                                            {/* Level 3: Orders (Expanded) */}
                                            {isClientExpanded && order.orders && (
                                                <TableRow>
                                                    {/* Span full width */}
                                                    <TableCell colSpan={6} className="p-0">
                                                        <div className={`bg-muted/30 p-4 ${isFlattened ? 'pl-4 md:pl-8' : 'pl-20'}`}>
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead className="w-[40px]"></TableHead>
                                                                        <TableHead>Pedido</TableHead>
                                                                        <TableHead>Data</TableHead>
                                                                        <TableHead className="text-right">Qtd</TableHead>
                                                                        <TableHead className="text-right">Valor</TableHead>
                                                                        <TableHead className="text-right">Saldo</TableHead>
                                                                        <TableHead>Status</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {order.orders.map((subOrder: any, idx: number) => {
                                                                        const orderKey = `${order.pesCodigo}-${subOrder.pedNumPedido}`;
                                                                        const isOrderExpanded = expandedOrders[orderKey];

                                                                        return (
                                                                            <React.Fragment key={orderKey}>
                                                                                <TableRow
                                                                                    className="cursor-pointer hover:bg-muted/50"
                                                                                    onClick={() => toggleOrder(orderKey)}
                                                                                >
                                                                                    <TableCell>
                                                                                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                                                                                            {isOrderExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                                                        </Button>
                                                                                    </TableCell>
                                                                                    <TableCell className="font-mono">{subOrder.pedNumPedido}</TableCell>
                                                                                    <TableCell>{format(new Date(subOrder.dataPedido), 'dd/MM/yyyy')}</TableCell>
                                                                                    <TableCell className="text-right">{subOrder.qtdePedida}</TableCell>
                                                                                    <TableCell className="text-right">{formatCurrency(subOrder.valorTotal)}</TableCell>
                                                                                    <TableCell className="text-right text-orange-600">{subOrder.qtdeSaldo}</TableCell>
                                                                                    <TableCell>
                                                                                        <span className={`text-xs px-2 py-1 rounded-full ${subOrder.qtdeSaldo === 0 ? 'bg-green-100 text-green-800' :
                                                                                            subOrder.qtdeEntregue > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                                                                            }`}>
                                                                                            {subOrder.qtdeSaldo === 0 ? 'Entregue' : (subOrder.qtdeEntregue > 0 ? 'Parcial' : 'Aberto')}
                                                                                        </span>
                                                                                    </TableCell>
                                                                                </TableRow>

                                                                                {/* Level 4: Items (Expanded) */}
                                                                                {isOrderExpanded && subOrder.items && (
                                                                                    <TableRow>
                                                                                        <TableCell colSpan={7} className="p-0 bg-background">
                                                                                            <div className="p-4 pl-12 border-t border-b">
                                                                                                <div className="text-xs font-semibold text-muted-foreground mb-2">ITENS DO PEDIDO</div>
                                                                                                <Table>
                                                                                                    <TableHeader>
                                                                                                        <TableRow className="h-8 hover:bg-transparent">
                                                                                                            <TableHead className="h-8 text-xs">Código</TableHead>
                                                                                                            <TableHead className="h-8 text-xs">Descrição</TableHead>
                                                                                                            <TableHead className="h-8 text-xs text-right">Qtd.</TableHead>
                                                                                                            <TableHead className="h-8 text-xs text-right">Unitário</TableHead>
                                                                                                            <TableHead className="h-8 text-xs text-right">Total</TableHead>
                                                                                                            <TableHead className="h-8 text-xs text-right">Saldo</TableHead>
                                                                                                        </TableRow>
                                                                                                    </TableHeader>
                                                                                                    <TableBody>
                                                                                                        {subOrder.items.map((item: any, i: number) => (
                                                                                                            <TableRow key={`${orderKey}-item-${i}`} className="h-8 hover:bg-transparent">
                                                                                                                <TableCell className="py-1 text-xs font-mono">{item.itemCodigo}</TableCell>
                                                                                                                <TableCell className="py-1 text-xs">{item.descricao}</TableCell>
                                                                                                                <TableCell className="py-1 text-xs text-right">{item.qtdePedida}</TableCell>
                                                                                                                <TableCell className="py-1 text-xs text-right">{formatCurrency(item.valorUnitario)}</TableCell>
                                                                                                                <TableCell className="py-1 text-xs text-right">{formatCurrency(item.valorTotal)}</TableCell>
                                                                                                                <TableCell className="py-1 text-xs text-right text-orange-600">{item.qtdeSaldo}</TableCell>
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
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                </TableBody>
                <TableRow className="bg-primary/5 font-bold border-t-2 border-primary/20">
                    <TableCell></TableCell>
                    <TableCell className="text-primary uppercase tracking-wider">TOTAL GERAL DA CARTEIRA</TableCell>
                    <TableCell className="text-right">{globalTotals.qtdePedida}</TableCell>
                    <TableCell className="text-right text-green-700">{globalTotals.qtdeEntregue}</TableCell>
                    <TableCell className="text-right text-orange-700 font-extrabold">{globalTotals.qtdeSaldo}</TableCell>
                    <TableCell>
                        <ProgressBar
                            delivered={globalTotals.qtdeEntregue}
                            total={globalTotals.qtdePedida}
                            pending={globalTotals.qtdeSaldo}
                            onHoverDetails={{
                                total: globalTotals.valorTotalPedido,
                                delivered: globalTotals.valorTotalEntregue,
                                pending: globalTotals.valorTotalSaldo
                            }}
                        />
                    </TableCell>
                </TableRow>
            </Table>
        </div>
    );
};
