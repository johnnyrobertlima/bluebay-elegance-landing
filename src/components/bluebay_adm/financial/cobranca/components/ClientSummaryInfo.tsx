
import React from "react";
import { TableCell } from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatters";
import { ClientDebtSummary } from "@/hooks/bluebay/types/financialTypes";

interface ClientSummaryInfoProps {
  summary: ClientDebtSummary;
}

export const ClientSummaryInfo: React.FC<ClientSummaryInfoProps> = ({ summary }) => {
  return (
    <>
      <TableCell>{summary.PES_CODIGO}</TableCell>
      <TableCell className="max-w-[200px] truncate" title={summary.CLIENTE_NOME}>
        {summary.CLIENTE_NOME}
      </TableCell>
      <TableCell>{summary.QUANTIDADE_TITULOS}</TableCell>
      <TableCell className="text-amber-600 font-medium">{summary.DIAS_VENCIDO_MAX} dias</TableCell>
      <TableCell className="text-red-600 font-medium">{formatCurrency(summary.TOTAL_SALDO)}</TableCell>
    </>
  );
};
