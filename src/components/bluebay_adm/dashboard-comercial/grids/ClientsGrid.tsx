
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClientStat } from '@/service/bluebay/dashboardComercialTypes';
import { ArrowUpDown } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ClientsGridProps {
    data: ClientStat[];
    isLoading: boolean;
}

export function ClientsGrid({ data, isLoading }: ClientsGridProps) {
    const [sortConfig, setSortConfig] = useState<{ key: keyof ClientStat; direction: 'asc' | 'desc' } | null>({ key: 'TOTAL_PEDIDO', direction: 'desc' });

    const sortedData = useMemo(() => {
        if (!data) return [];
        let sortableItems = [...data];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                // @ts-ignore
                const aValue = a[sortConfig.key];
                // @ts-ignore
                const bValue = b[sortConfig.key];

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const requestSort = (key: keyof ClientStat) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        } else if (!sortConfig) {
            direction = 'desc'; // Default to desc for numbers first time
        }
        setSortConfig({ key, direction });
    };


    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    if (isLoading) {
        return (
            <Card>
                <CardHeader><CardTitle><Skeleton className="h-6 w-32" /></CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Performance por Cliente</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border max-h-[500px] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {/* Column 1: Nome_Categoria (As requested) */}
                                <TableHead onClick={() => requestSort('NOME_CATEGORIA')} className="cursor-pointer hover:bg-gray-50">
                                    Nome_Categoria <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                                </TableHead>

                                {/* Column 2: Apelido */}
                                <TableHead onClick={() => requestSort('APELIDO')} className="cursor-pointer hover:bg-gray-50">
                                    Apelido <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                                </TableHead>

                                {/* Indicators */}
                                <TableHead className="text-right cursor-pointer hover:bg-gray-50" onClick={() => requestSort('TOTAL_FATURADO')}>
                                    Total Faturado <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                                </TableHead>

                                <TableHead className="text-right cursor-pointer hover:bg-gray-50" onClick={() => requestSort('ITENS_FATURADOS')}>
                                    Itens Fat. <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                                </TableHead>

                                <TableHead className="text-right cursor-pointer hover:bg-gray-50" onClick={() => requestSort('TM_ITEM_FATURADO')}>
                                    TM/Item Fat. <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                                </TableHead>

                                <TableHead className="text-right cursor-pointer hover:bg-gray-50" onClick={() => requestSort('TOTAL_PEDIDO')}>
                                    Total Pedido <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                                </TableHead>

                                <TableHead className="text-right cursor-pointer hover:bg-gray-50" onClick={() => requestSort('ITENS_PEDIDOS')}>
                                    Itens Ped. <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedData?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24">
                                        Nenhum cliente encontrado com vendas no período.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedData.map((client) => (
                                    <TableRow key={client.PES_CODIGO}>
                                        <TableCell className="font-medium text-gray-500">
                                            {client.NOME_CATEGORIA}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {client.APELIDO}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-green-700">
                                            {formatCurrency(client.TOTAL_FATURADO)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {client.ITENS_FATURADOS}
                                        </TableCell>
                                        <TableCell className="text-right text-gray-600">
                                            {formatCurrency(client.TM_ITEM_FATURADO)}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-blue-700">
                                            {formatCurrency(client.TOTAL_PEDIDO)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {client.ITENS_PEDIDOS}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
