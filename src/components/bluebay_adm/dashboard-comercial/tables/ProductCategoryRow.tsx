import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronRight, Package, Box } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ProductCategoryStat } from "@/services/bluebay/dashboardComercialTypes";
import { ProductItemRow } from "./ProductItemRow";

interface ProductCategoryRowProps {
    category: ProductCategoryStat;
}

export const ProductCategoryRow = ({ category }: ProductCategoryRowProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
        <React.Fragment>
            <TableRow
                className="cursor-pointer hover:bg-muted/50 font-medium"
                onClick={toggleExpand}
            >
                <TableCell className="w-10">
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </TableCell>
                <TableCell className="w-[300px]">
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        <span className="truncate" title={category.GRU_DESCRICAO}>
                            {category.GRU_DESCRICAO || "OUTROS"}
                        </span>
                    </div>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(category.VALOR_PEDIDO)}</TableCell>
                <TableCell className="text-right">{category.QTDE_ITENS.toLocaleString('pt-BR')}</TableCell>
                <TableCell className="text-right">{formatCurrency(category.VALOR_FATURADO)}</TableCell>
                <TableCell className="text-right">{category.QTDE_FATURADA.toLocaleString('pt-BR')}</TableCell>
                <TableCell className="text-right">{formatCurrency(category.TM)}</TableCell>
            </TableRow>

            {isExpanded && (
                <TableRow>
                    <TableCell colSpan={7} className="p-0 bg-muted/10">
                        <div className="p-4 pl-12">
                            <div className="border rounded-md bg-background">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="w-10"></TableHead>
                                            <TableHead className="w-[100px]">Cod. Item</TableHead>
                                            <TableHead className="w-auto">Descrição</TableHead>
                                            <TableHead className="text-right w-[120px]">Valor Pedido</TableHead>
                                            <TableHead className="text-right w-[100px]">Qtd. Itens</TableHead>
                                            <TableHead className="text-right w-[120px]">Valor Faturado</TableHead>
                                            <TableHead className="text-right w-[100px]">Qtd. Faturada</TableHead>
                                            <TableHead className="text-right w-[100px]">TM</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {category.items.map((item) => (
                                            <ProductItemRow key={item.ITEM_CODIGO} item={item} />
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
