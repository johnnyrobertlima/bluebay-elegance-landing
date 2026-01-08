
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle, RefreshCcw } from "lucide-react";
import { CollectionRecord } from "@/hooks/bluebay/types/financialTypes";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CollectedTitlesTableProps {
  records: CollectionRecord[];
  onResetRecord: (clientCode: string) => void;
  onResetAll: () => void;
}

export const CollectedTitlesTable: React.FC<CollectedTitlesTableProps> = ({
  records,
  onResetRecord,
  onResetAll
}) => {
  if (records.length === 0) {
    return (
      <div className="bg-muted/40 py-8 text-center rounded-md">
        <p className="text-muted-foreground">Nenhum registro de cobrança encontrado</p>
        <p className="text-sm text-muted-foreground">Ainda não foram realizadas cobranças</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onResetAll}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Limpar Todas as Cobranças
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data da Cobrança</TableHead>
              <TableHead>Cobrado por</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record, index) => (
              <TableRow key={`${record.clientCode}-${index}`}>
                <TableCell className="max-w-[200px] truncate" title={record.clientName}>
                  {record.clientName}
                </TableCell>
                <TableCell>{record.clientCode}</TableCell>
                <TableCell>{record.status}</TableCell>
                <TableCell>
                  {record.date && isValid(new Date(record.date)) 
                    ? format(new Date(record.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                    : 'Data inválida'}
                </TableCell>
                <TableCell>{record.collectedBy}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onResetRecord(record.clientCode)}
                  >
                    <ArrowLeftCircle className="h-4 w-4 mr-1" />
                    Voltar para Pendentes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
