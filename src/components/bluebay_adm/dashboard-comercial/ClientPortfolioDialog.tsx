import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatters";
import { Loader2, ArrowUpDown } from "lucide-react";
import { fetchRepresentativeClientPortfolio } from "@/services/bluebay/dashboardComercialService";

interface ClientPortfolioDialogProps {
    representativeId: number | null;
}

interface PortfolioItem {
    CLIENTE_ID: number;
    APELIDO: string;
    RAZAOSOCIAL: string;
    [year: number]: number; // Dynamic year columns
}

export function ClientPortfolioDialog({ representativeId }: ClientPortfolioDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<PortfolioItem[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string | number; direction: 'asc' | 'desc' } | null>(null);

    // Calculate last 4 years dynamically
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear];

    useEffect(() => {
        if (isOpen && representativeId) {
            loadPortfolio();
        }
    }, [isOpen, representativeId]);

    const loadPortfolio = async () => {
        if (!representativeId) return;
        setIsLoading(true);
        try {
            const rawData = await fetchRepresentativeClientPortfolio(representativeId, years[0], years[3]);

            // Pivot Data
            const pivoted: Record<number, PortfolioItem> = {};

            rawData.forEach(item => {
                if (!pivoted[item.CLIENTE_ID]) {
                    pivoted[item.CLIENTE_ID] = {
                        CLIENTE_ID: item.CLIENTE_ID,
                        APELIDO: item.APELIDO,
                        RAZAOSOCIAL: item.RAZAOSOCIAL
                    };
                    // Initialize years with 0
                    years.forEach(y => pivoted[item.CLIENTE_ID][y] = 0);
                }
                pivoted[item.CLIENTE_ID][item.ANO] = item.TOTAL_VALOR;
            });

            setData(Object.values(pivoted));
        } catch (error) {
            console.error("Error loading portfolio", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSort = (key: string | number) => {
        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        if (!sortConfig) return data;
        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key as keyof PortfolioItem];
            const bValue = b[sortConfig.key as keyof PortfolioItem];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortConfig.direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return sortConfig.direction === 'asc'
                ? (Number(aValue) - Number(bValue))
                : (Number(bValue) - Number(aValue));
        });
    }, [data, sortConfig]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" disabled={!representativeId}>
                    Análise de Carteira
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Análise de Carteira de Clientes</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto mt-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                                <TableRow>
                                    <TableHead className="w-[300px] cursor-pointer" onClick={() => handleSort('APELIDO')}>
                                        Cliente <ArrowUpDown className="inline h-3 w-3 ml-1" />
                                    </TableHead>
                                    {years.map(year => (
                                        <TableHead
                                            key={year}
                                            className="text-right cursor-pointer min-w-[120px]"
                                            onClick={() => handleSort(year)}
                                        >
                                            {year} <ArrowUpDown className="inline h-3 w-3 ml-1" />
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedData.length > 0 ? (
                                    sortedData.map((client) => (
                                        <TableRow key={client.CLIENTE_ID}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{client.APELIDO || 'Sem Apelido'}</span>
                                                    <span className="text-xs text-slate-400 font-normal truncate max-w-[280px]" title={client.RAZAOSOCIAL}>
                                                        {client.RAZAOSOCIAL}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            {years.map(year => (
                                                <TableCell key={year} className="text-right font-mono text-slate-700">
                                                    {formatCurrency(Number(client[year]))}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-slate-500">
                                            Nenhum dado encontrado para este período.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
