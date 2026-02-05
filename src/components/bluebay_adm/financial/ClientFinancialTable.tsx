
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { ClientDebtSummary } from "@/hooks/bluebay/types/financialTypes";

interface ClientFinancialTableProps {
  clients: ClientDebtSummary[];
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
          {clients.map((client) => {
            const totalVencido = client.totalVencido || 0;
            const totalAVencer = client.totalAVencer || 0;
            const totalPago = client.totalPago || 0;
            const totalGeral = totalVencido + totalAVencer + totalPago;

            return (
              <TableRow key={client.PES_CODIGO}>
                <TableCell>{client.PES_CODIGO}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={client.CLIENTE_NOME}>
                  {client.CLIENTE_NOME}
                </TableCell>
                <TableCell>{formatCurrency(totalVencido)}</TableCell>
                <TableCell>{formatCurrency(totalAVencer)}</TableCell>
                <TableCell>{formatCurrency(totalPago)}</TableCell>
                <TableCell className="font-bold">{formatCurrency(totalGeral)}</TableCell>
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
