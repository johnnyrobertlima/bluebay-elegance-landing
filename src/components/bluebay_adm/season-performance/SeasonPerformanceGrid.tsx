
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { Fragment, useState } from "react";
import { SeasonPerformanceStat } from "@/services/bluebay/seasonPerformanceService";
import { formatCurrency } from "@/lib/utils";

interface SeasonPerformanceGridProps {
    data: SeasonPerformanceStat[];
    isLoading: boolean;
}

export const SeasonPerformanceGrid = ({ data, isLoading }: SeasonPerformanceGridProps) => {
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    const toggleRow = (groupName: string) => {
        setExpandedRows(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (data.length === 0) {
        return <div className="text-center p-8 text-muted-foreground">Nenhum dado encontrado para o período.</div>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Grupo</TableHead>
                        <TableHead>Estação</TableHead>
                        <TableHead className="text-right">Total Faturado</TableHead>
                        <TableHead className="text-right">Itens Faturados</TableHead>
                        <TableHead className="text-right">TM (Item)</TableHead>
                        <TableHead className="text-right">Total Pedido</TableHead>
                        <TableHead className="text-right">Itens Pedidos</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((group) => {
                        const isExpanded = expandedRows[group.grupo];
                        return (
                            <Fragment key={group.grupo}>
                                <TableRow
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => toggleRow(group.grupo)}
                                >
                                    <TableCell>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="font-medium">{group.grupo}</TableCell>
                                    <TableCell>{group.estacao}</TableCell>
                                    <TableCell className="text-right font-medium text-green-600">
                                        {formatCurrency(group.totalFaturado)}
                                    </TableCell>
                                    <TableCell className="text-right">{group.itensFaturados}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(group.tmFaturado)}</TableCell>
                                    <TableCell className="text-right text-blue-600">
                                        {formatCurrency(group.totalPedido)}
                                    </TableCell>
                                    <TableCell className="text-right">{group.itensPedidos}</TableCell>
                                </TableRow>

                                {isExpanded && (
                                    <TableRow className="bg-muted/30">
                                        <TableCell colSpan={8} className="p-0">
                                            <div className="p-4 border-l-4 border-primary/20">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="border-b border-border/50">
                                                            <TableHead className="text-xs">Código</TableHead>
                                                            <TableHead className="text-xs">Descrição do Item</TableHead>
                                                            <TableHead className="text-xs text-right">Total Fat.</TableHead>
                                                            <TableHead className="text-xs text-right">Qtd Fat.</TableHead>
                                                            <TableHead className="text-xs text-right">TM</TableHead>
                                                            <TableHead className="text-xs text-right">Total Ped.</TableHead>
                                                            <TableHead className="text-xs text-right">Qtd Ped.</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {group.items.map((item) => (
                                                            <TableRow key={item.itemCodigo} className="border-none">
                                                                <TableCell className="text-xs font-mono">{item.itemCodigo}</TableCell>
                                                                <TableCell className="text-xs">{item.descricao}</TableCell>
                                                                <TableCell className="text-xs text-right">{formatCurrency(item.totalFaturado)}</TableCell>
                                                                <TableCell className="text-xs text-right">{item.itensFaturados}</TableCell>
                                                                <TableCell className="text-xs text-right">{formatCurrency(item.tmFaturado)}</TableCell>
                                                                <TableCell className="text-xs text-right">{formatCurrency(item.totalPedido)}</TableCell>
                                                                <TableCell className="text-xs text-right">{item.itensPedidos}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </Fragment>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};
