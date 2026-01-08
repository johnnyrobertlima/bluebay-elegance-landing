
import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Eye, ChevronDown, ChevronUp } from "lucide-react";
import { FinancialTitle } from "@/hooks/bluebay/types/financialTypes";

interface SortIconProps {
  field: string;
  sortField: string;
  sortDirection: "asc" | "desc";
}

const SortIcon = ({ field, sortField, sortDirection }: SortIconProps) => {
  if (field !== sortField) return null;
  return sortDirection === "asc" ? (
    <ChevronUp className="w-4 h-4 ml-1" />
  ) : (
    <ChevronDown className="w-4 h-4 ml-1" />
  );
};

interface OrigemTableProps {
  titles: FinancialTitle[];
  isLoading: boolean;
  onViewTitles?: (pesCode: string) => void;
}

export const OrigemTable: React.FC<OrigemTableProps> = ({ 
  titles, 
  isLoading,
  onViewTitles
}) => {
  const [sortField, setSortField] = useState<string>("DTEMISSAO");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get unique invoice numbers with their info
  const uniqueInvoices = titles.reduce((acc: Record<number | string, FinancialTitle>, title) => {
    const numNota = title.NUMNOTA;
    if (numNota !== null && !acc[numNota]) {
      acc[numNota] = title;
    }
    return acc;
  }, {});

  // Convert to array for sorting
  const invoicesList = Object.values(uniqueInvoices);

  const sortedInvoices = React.useMemo(() => {
    if (!invoicesList.length) return [];
    
    return [...invoicesList].sort((a, b) => {
      // Handle date fields
      if (sortField === "DTEMISSAO") {
        const dateA = a[sortField] ? new Date(a[sortField] as string).getTime() : 0;
        const dateB = b[sortField] ? new Date(b[sortField] as string).getTime() : 0;
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      
      // Handle NUMNOTA (numeric field)
      if (sortField === "NUMNOTA") {
        const numA = Number(a[sortField]) || 0;
        const numB = Number(b[sortField]) || 0;
        return sortDirection === "asc" ? numA - numB : numB - numA;
      }
      
      // Handle strings and other fields
      const valA = String(a[sortField as keyof FinancialTitle] || "");
      const valB = String(b[sortField as keyof FinancialTitle] || "");
      return sortDirection === "asc" 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    });
  }, [invoicesList, sortField, sortDirection]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-12" />
        ))}
      </div>
    );
  }

  if (sortedInvoices.length === 0) {
    return (
      <div className="bg-muted/40 py-8 text-center rounded-md">
        <p className="text-muted-foreground">Nenhuma nota fiscal encontrada</p>
        <p className="text-sm text-muted-foreground">Tente ajustar os filtros para ver mais resultados</p>
      </div>
    );
  }

  const handleViewTitles = (pesCode: string) => {
    if (onViewTitles && pesCode) {
      onViewTitles(pesCode);
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => handleSort("NUMNOTA")}>
              <div className="flex items-center">
                Nota Fiscal <SortIcon field="NUMNOTA" sortField={sortField} sortDirection={sortDirection} />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("CLIENTE_NOME")}>
              <div className="flex items-center">
                Cliente <SortIcon field="CLIENTE_NOME" sortField={sortField} sortDirection={sortDirection} />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("DTEMISSAO")}>
              <div className="flex items-center">
                Data Emissão <SortIcon field="DTEMISSAO" sortField={sortField} sortDirection={sortDirection} />
              </div>
            </TableHead>
            <TableHead className="text-center">Ver Títulos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedInvoices.map((invoice, index) => (
            <TableRow key={`${invoice.NUMNOTA}-${index}`}>
              <TableCell className="font-medium">{invoice.NUMNOTA}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={invoice.CLIENTE_NOME}>
                {invoice.CLIENTE_NOME}
              </TableCell>
              <TableCell>
                {invoice.DTEMISSAO ? format(new Date(invoice.DTEMISSAO), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
              </TableCell>
              <TableCell className="text-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleViewTitles(String(invoice.PES_CODIGO))}
                  disabled={!invoice.PES_CODIGO}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
