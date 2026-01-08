
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { ClientFinancialSummary } from "@/hooks/bluebay/useFinancialFilters";

interface ClientFinancialTableProps {
  clients: ClientFinancialSummary[];
  isLoading: boolean;
  onClientSelect: (clientCode: string) => void;
}

export const ClientFinancialTable: React.FC<ClientFinancialTableProps> = ({ 
  clients, 
  isLoading,
  onClientSelect
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

  if (clients.length === 0) {
    return (
      <div className="bg-muted/40 py-8 text-center rounded-md">
        <p className="text-muted-foreground">Nenhum cliente encontrado</p>
        <p className="text-sm text-muted-foreground">Tente ajustar os filtros para ver mais resultados</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Valores Vencidos</TableHead>
            <TableHead>Valores em Aberto</TableHead>
            <TableHead>Valores Pagos</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.PES_CODIGO}>
              <TableCell>{client.PES_CODIGO}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={client.CLIENTE_NOME}>
                {client.CLIENTE_NOME}
              </TableCell>
              <TableCell>{formatCurrency(client.totalValoresVencidos)}</TableCell>
              <TableCell>{formatCurrency(client.totalEmAberto)}</TableCell>
              <TableCell>{formatCurrency(client.totalPago)}</TableCell>
              <TableCell>{formatCurrency(client.totalEmAberto + client.totalPago)}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onClientSelect(String(client.PES_CODIGO))}
                >
                  <Search className="h-4 w-4 mr-1" />
                  Ver Títulos
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
