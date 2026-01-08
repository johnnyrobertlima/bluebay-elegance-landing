
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { ConsolidatedInvoice } from "@/hooks/bluebay/useFinancialData";

interface InvoiceTableProps {
  invoices: ConsolidatedInvoice[];
  isLoading: boolean;
  onViewTitles?: (pesCode: string | number) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ 
  invoices, 
  isLoading,
  onViewTitles 
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-12" />
        ))}
      </div>
    );
  }

  console.log("Rendering InvoiceTable with invoices:", invoices);

  if (invoices.length === 0) {
    return (
      <div className="bg-muted/40 py-8 text-center rounded-md">
        <p className="text-muted-foreground">Nenhuma nota fiscal encontrada</p>
        <p className="text-sm text-muted-foreground">Tente ajustar os filtros para ver mais resultados</p>
      </div>
    );
  }

  const handleViewTitles = (pesCode: string | number) => {
    if (onViewTitles) {
      onViewTitles(pesCode);
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nota</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Data Emissão</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead className="text-center">Ver Títulos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.NOTA}>
              <TableCell className="font-medium">{invoice.NOTA}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={invoice.CLIENTE_NOME}>
                {invoice.CLIENTE_NOME || `Cliente ${invoice.PES_CODIGO || "Desconhecido"}`}
              </TableCell>
              <TableCell>
                {invoice.DATA_EMISSAO ? format(new Date(invoice.DATA_EMISSAO), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
              </TableCell>
              <TableCell>{formatCurrency(invoice.VALOR_NOTA)}</TableCell>
              <TableCell className="text-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleViewTitles(invoice.PES_CODIGO)}
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
