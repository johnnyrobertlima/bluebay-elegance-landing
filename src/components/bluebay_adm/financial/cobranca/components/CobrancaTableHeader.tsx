
import React from "react";
import { TableHead, TableRow } from "@/components/ui/table";

export const CobrancaTableHeader: React.FC = () => {
  return (
    <TableRow>
      <TableHead className="w-10"></TableHead>
      <TableHead>Código Cliente</TableHead>
      <TableHead>Nome Cliente</TableHead>
      <TableHead>Qtd. Títulos</TableHead>
      <TableHead>Dias Vencidos (máx)</TableHead>
      <TableHead>Valor Saldo</TableHead>
      <TableHead className="text-right">Ações</TableHead>
    </TableRow>
  );
};
