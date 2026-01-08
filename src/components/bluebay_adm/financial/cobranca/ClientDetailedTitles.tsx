
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatters";
import { FinancialTitle } from "@/hooks/bluebay/types/financialTypes";
import { differenceInDays } from "date-fns";

interface ClientDetailedTitlesProps {
  clientTitles: FinancialTitle[];
}

export const ClientDetailedTitles: React.FC<ClientDetailedTitlesProps> = ({ clientTitles }) => {
  return (
    <div className="p-4">
      <h4 className="text-sm font-medium mb-2">Detalhes dos Títulos</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nota Fiscal</TableHead>
            <TableHead>Nº Documento</TableHead>
            <TableHead>Data Emissão</TableHead>
            <TableHead>Data Vencimento</TableHead>
            <TableHead>Dias Vencido</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Valor Saldo</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientTitles.map((title) => {
            const vencimentoDate = title.DTVENCIMENTO ? new Date(title.DTVENCIMENTO) : null;
            const diasVencido = vencimentoDate ? differenceInDays(new Date(), vencimentoDate) : 0;
            
            return (
              <TableRow key={`${title.NUMNOTA}-${title.NUMDOCUMENTO || ''}`}>
                <TableCell>{title.NUMNOTA}</TableCell>
                <TableCell>{title.NUMDOCUMENTO || '-'}</TableCell>
                <TableCell>{new Date(title.DTEMISSAO).toLocaleDateString()}</TableCell>
                <TableCell>{vencimentoDate?.toLocaleDateString() || '-'}</TableCell>
                <TableCell className="text-red-600">{diasVencido} dias</TableCell>
                <TableCell>{formatCurrency(title.VLRTITULO)}</TableCell>
                <TableCell className="text-red-600 font-medium">{formatCurrency(title.VLRSALDO)}</TableCell>
                <TableCell>
                  {title.STATUS === '1' && 'Em Aberto'}
                  {title.STATUS === '2' && 'Parcial'}
                  {title.STATUS === '3' && 'Pago'}
                  {title.STATUS === '4' && 'Cancelado'}
                  {!['1', '2', '3', '4'].includes(title.STATUS) && title.STATUS}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
