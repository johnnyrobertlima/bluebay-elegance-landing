
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency } from "@/utils/formatters";
import { FinancialTitle } from "@/hooks/bluebay/types/financialTypes";
import { formatNumDocumento } from "@/hooks/bluebay/utils/titleUtils";
import { ChevronDown, ChevronUp } from "lucide-react";

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

interface TitleTableProps {
  titles: FinancialTitle[];
  isLoading: boolean;
}

export const TitleTable: React.FC<TitleTableProps> = ({ titles, isLoading }) => {
  const [sortField, setSortField] = useState<string>("DTVENCIMENTO");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [processedTitles, setProcessedTitles] = useState<FinancialTitle[]>([]);

  // Process titles to identify overdue ones
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const processed = titles.map(title => {
      // Create a deep copy to avoid mutating the original data
      const newTitle = { ...title };
      
      // Check if title has balance and is overdue
      if (newTitle.VLRSALDO > 0 && newTitle.DTVENCIMENTO) {
        const vencimentoDate = new Date(newTitle.DTVENCIMENTO);
        vencimentoDate.setHours(0, 0, 0, 0);
        
        // If due date is before today and status is 'Em Aberto' (1), update to 'Vencido'
        if (vencimentoDate < today && newTitle.STATUS === '1') {
          newTitle.STATUS = 'VENCIDO';
        }
      }
      
      return newTitle;
    });
    
    setProcessedTitles(processed);
  }, [titles]);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedTitles = React.useMemo(() => {
    if (!processedTitles.length) return [];
    
    return [...processedTitles].sort((a, b) => {
      // Handle date fields
      if (["DTEMISSAO", "DTVENCIMENTO", "DTPAGTO"].includes(sortField)) {
        const dateA = a[sortField as keyof FinancialTitle] ? new Date(a[sortField as keyof FinancialTitle] as string).getTime() : 0;
        const dateB = b[sortField as keyof FinancialTitle] ? new Date(b[sortField as keyof FinancialTitle] as string).getTime() : 0;
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      
      // Handle numeric fields
      if (["VLRTITULO", "VLRSALDO", "VLRDESCONTO"].includes(sortField)) {
        const numA = a[sortField as keyof FinancialTitle] as number || 0;
        const numB = b[sortField as keyof FinancialTitle] as number || 0;
        return sortDirection === "asc" ? numA - numB : numB - numA;
      }
      
      // Handle strings and other fields
      const valA = String(a[sortField as keyof FinancialTitle] || "");
      const valB = String(b[sortField as keyof FinancialTitle] || "");
      return sortDirection === "asc" 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    });
  }, [processedTitles, sortField, sortDirection]);

  // Function to determine if a title is overdue
  const isOverdue = (title: FinancialTitle) => {
    if (title.VLRSALDO > 0 && title.DTVENCIMENTO) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const vencimentoDate = new Date(title.DTVENCIMENTO);
      vencimentoDate.setHours(0, 0, 0, 0);
      return vencimentoDate < today;
    }
    return false;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-12" />
        ))}
      </div>
    );
  }

  if (titles.length === 0) {
    return (
      <div className="bg-muted/40 py-8 text-center rounded-md">
        <p className="text-muted-foreground">Nenhum título financeiro encontrado</p>
        <p className="text-sm text-muted-foreground">Tente ajustar os filtros para ver mais resultados</p>
      </div>
    );
  }

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
            <TableHead className="cursor-pointer" onClick={() => handleSort("NUMDOCUMENTO")}>
              <div className="flex items-center">
                Nº do Documento <SortIcon field="NUMDOCUMENTO" sortField={sortField} sortDirection={sortDirection} />
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
            <TableHead className="cursor-pointer" onClick={() => handleSort("DTVENCIMENTO")}>
              <div className="flex items-center">
                Vencimento <SortIcon field="DTVENCIMENTO" sortField={sortField} sortDirection={sortDirection} />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("DTPAGTO")}>
              <div className="flex items-center">
                Pagamento <SortIcon field="DTPAGTO" sortField={sortField} sortDirection={sortDirection} />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("VLRTITULO")}>
              <div className="flex items-center">
                Valor <SortIcon field="VLRTITULO" sortField={sortField} sortDirection={sortDirection} />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("VLRSALDO")}>
              <div className="flex items-center">
                Saldo <SortIcon field="VLRSALDO" sortField={sortField} sortDirection={sortDirection} />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("STATUS")}>
              <div className="flex items-center">
                Status <SortIcon field="STATUS" sortField={sortField} sortDirection={sortDirection} />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTitles.map((title, index) => {
            const overdueStyle = isOverdue(title) ? "text-red-600 font-medium" : "";
            
            return (
              <TableRow key={`${title.NUMNOTA}-${index}`} className={overdueStyle}>
                <TableCell className={`font-medium ${overdueStyle}`}>{title.NUMNOTA}</TableCell>
                <TableCell className={`font-mono ${overdueStyle}`}>{formatNumDocumento(title.NUMDOCUMENTO)}</TableCell>
                <TableCell className={`max-w-[200px] truncate ${overdueStyle}`} title={title.CLIENTE_NOME}>
                  {title.CLIENTE_NOME}
                </TableCell>
                <TableCell className={overdueStyle}>
                  {title.DTEMISSAO ? format(new Date(title.DTEMISSAO), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                </TableCell>
                <TableCell className={overdueStyle}>
                  {title.DTVENCIMENTO ? format(new Date(title.DTVENCIMENTO), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                </TableCell>
                <TableCell className={overdueStyle}>
                  {title.DTPAGTO ? format(new Date(title.DTPAGTO), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                </TableCell>
                <TableCell className={overdueStyle}>{formatCurrency(title.VLRTITULO)}</TableCell>
                <TableCell className={overdueStyle}>{formatCurrency(title.VLRSALDO)}</TableCell>
                <TableCell><StatusBadge status={title.STATUS} /></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
