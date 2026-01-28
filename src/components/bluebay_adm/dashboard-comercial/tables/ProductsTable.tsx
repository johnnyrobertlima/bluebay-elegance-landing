import React, { useEffect, useState } from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, PackageSearch } from "lucide-react";
import { fetchProductStats } from "@/services/bluebay/dashboardComercialService";
import { ProductCategoryStat } from "@/services/bluebay/dashboardComercialTypes";
import { ProductCategoryRow } from "./ProductCategoryRow";

interface ProductsTableProps {
    startDate: Date;
    endDate: Date;
    selectedCentroCusto: string | null;
    selectedRepresentative: string[];
    selectedClient?: string[];
    selectedProduct?: string[];
}

export const ProductsTable = ({
    startDate,
    endDate,
    selectedCentroCusto,
    selectedRepresentative = [],
    selectedClient = [],
    selectedProduct = []
}: ProductsTableProps) => {
    const [data, setData] = useState<ProductCategoryStat[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            setIsLoading(true);
            try {
                const stats = await fetchProductStats(
                    startDate,
                    endDate,
                    selectedCentroCusto,
                    selectedRepresentative,
                    selectedClient,
                    selectedProduct
                );
                if (isMounted) {
                    setData(stats);
                }
            } catch (error) {
                console.error("Failed to load product stats", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [startDate, endDate, selectedCentroCusto, selectedRepresentative, selectedClient, selectedProduct]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Carregando estatísticas de produtos...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <PackageSearch className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum produto encontrado para o período selecionado.</p>
            </div>
        );
    }

    // Calculate Grand Totals
    const totalPedido = data.reduce((acc, cat) => acc + cat.VALOR_PEDIDO, 0);
    const totalFaturado = data.reduce((acc, cat) => acc + cat.VALOR_FATURADO, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Performance por Produto</CardTitle>
                <CardDescription>
                    Análise detalhada por Categoria, Item e Pedidos.
                    Total Pedido: <strong>{totalPedido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong> •
                    Total Faturado: <strong>{totalFaturado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10"></TableHead>
                                <TableHead className="w-[300px]">Categoria</TableHead>
                                <TableHead className="text-right">Valor Pedido</TableHead>
                                <TableHead className="text-right">Qtd. Itens</TableHead>
                                <TableHead className="text-right">Valor Faturado</TableHead>
                                <TableHead className="text-right">Qtd. Faturada</TableHead>
                                <TableHead className="text-right">TM</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((category) => (
                                <ProductCategoryRow key={category.GRU_DESCRICAO} category={category} />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};
