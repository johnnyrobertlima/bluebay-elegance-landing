
import React from "react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency } from "@/utils/formatters";
import { FinancialTitle } from "@/hooks/bluebay/types/financialTypes";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { formatNumDocumento } from "@/hooks/bluebay/utils/titleUtils";

interface ClientesVencidosTableProps {
  titles: FinancialTitle[];
  isLoading: boolean;
  onClientSelect?: (clientCode: string) => void;
}

export const ClientesVencidosTable: React.FC<ClientesVencidosTableProps> = ({ 
  titles, 
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

  // Filter only titles that are overdue (vencidos)
  const vencidosTitles = titles.filter(title => {
    if (!title.DTVENCIMENTO) return false;
    const vencimentoDate = new Date(title.DTVENCIMENTO);
    const today = new Date();
    return vencimentoDate < today && title.VLRSALDO > 0;
  });

  if (vencidosTitles.length === 0) {
    return (
      <div className="bg-muted/40 py-8 text-center rounded-md">
        <p className="text-muted-foreground">Nenhum título vencido encontrado</p>
        <p className="text-sm text-muted-foreground">Todos os títulos estão em dia</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Nota Fiscal</TableHead>
            <TableHead>Nº do Documento</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Data Emissão</TableHead>
            <TableHead>Data Vencimento</TableHead>
            <TableHead>Dias Vencido</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Valor Saldo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vencidosTitles.map((title, index) => {
            const vencimentoDate = new Date(title.DTVENCIMENTO);
            const today = new Date();
            const diasVencido = differenceInDays(today, vencimentoDate);
            
            return (
              <TableRow key={`${title.NUMNOTA}-${index}`}>
                <TableCell className="font-medium">{title.NUMNOTA}</TableCell>
                <TableCell className="font-mono">{formatNumDocumento(title.NUMDOCUMENTO)}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={title.CLIENTE_NOME}>
                  {title.CLIENTE_NOME}
                </TableCell>
                <TableCell>
                  {title.DTEMISSAO ? format(new Date(title.DTEMISSAO), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                </TableCell>
                <TableCell>
                  {title.DTVENCIMENTO ? format(new Date(title.DTVENCIMENTO), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                </TableCell>
                <TableCell className="text-red-600 font-medium">
                  {diasVencido} dias
                </TableCell>
                <TableCell>{formatCurrency(title.VLRTITULO)}</TableCell>
                <TableCell>{formatCurrency(title.VLRSALDO)}</TableCell>
                <TableCell><StatusBadge status={title.STATUS} /></TableCell>
                <TableCell>
                  {onClientSelect && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => onClientSelect(String(title.PES_CODIGO))}
                    >
                      <Eye className="h-4 w-4" />
                      Ver títulos
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
