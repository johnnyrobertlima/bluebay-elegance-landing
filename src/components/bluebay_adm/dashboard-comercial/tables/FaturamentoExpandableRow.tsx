
import React from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { FaturamentoItem } from "@/services/bluebay/dashboardComercialTypes";
import { cn } from "@/lib/utils";

// Traceability check
console.log('[DASHBOARD_V4] FaturamentoExpandableRow Loaded');

interface NotaItem {
  NOTA: string;
  DATA_EMISSAO: string | Date;
  TOTAL_QUANTIDADE: number;
  TOTAL_VALOR: number;
  CLIENT_NAME?: string;
  REP_NAME?: string;
  items: FaturamentoItem[];
}

interface FaturamentoExpandableRowProps {
  dateStr: string;
  dateGroup: {
    DATA_EMISSAO: string | Date;
    notas: NotaItem[];
  };
  expandedDates: Set<string>;
  expandedNotes: Set<string>;
  toggleDate: (dateStr: string) => void;
  toggleNote: (nota: string) => void;
  stats?: {
    totalCount: number;
    totalValue: number;
  };
  isLoading?: boolean;
}

export const FaturamentoExpandableRow: React.FC<FaturamentoExpandableRowProps> = ({
  dateStr,
  dateGroup,
  expandedDates,
  expandedNotes,
  toggleDate,
  toggleNote,
  stats,
  isLoading
}) => {
  const totalNotas = stats ? stats.totalCount : dateGroup.notas.length;
  const totalValor = stats ? stats.totalValue : dateGroup.notas.reduce((sum, nota) => sum + nota.TOTAL_VALOR, 0);

  const formatDate = (dateValue: string | Date) => {
    if (!dateValue) return '-';
    try {
      if (typeof dateValue === 'string') {
        const dateObj = parseISO(dateValue);
        if (isNaN(dateObj.getTime())) return dateValue;
        return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
      }
      return format(dateValue, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error("Error formatting date:", dateValue, error);
      return '-';
    }
  };

  const renderNotasContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-6">
          <span className="text-muted-foreground animate-pulse font-medium">Carregando notas fiscais...</span>
        </div>
      );
    }

    if (!dateGroup.notas || dateGroup.notas.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground font-medium bg-muted/5 rounded">Nenhuma nota encontrada.</div>
      );
    }

    return (
      <Table>
        {/* Usando thead direto para evitar erros de importação/escopo com TableHeader */}
        <thead className="[&_tr]:border-b bg-muted/20">
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead className="text-xs uppercase font-bold text-muted-foreground">Nota</TableHead>
            <TableHead className="text-xs uppercase font-bold text-muted-foreground">Cliente</TableHead>
            <TableHead className="text-xs uppercase font-bold text-muted-foreground">Representante</TableHead>
            <TableHead className="text-right text-xs uppercase font-bold text-muted-foreground">Qtd. Itens</TableHead>
            <TableHead className="text-right text-xs uppercase font-bold text-muted-foreground">Valor Total</TableHead>
          </TableRow>
        </thead>
        <TableBody>
          {dateGroup.notas.map((nota) => {
            if (!nota?.NOTA) return null;
            const notaKey = nota.NOTA;
            const isNoteExpanded = expandedNotes.has(notaKey);

            return (
              <React.Fragment key={notaKey}>
                <TableRow
                  className="cursor-pointer hover:bg-muted/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNote(notaKey);
                  }}
                >
                  <TableCell>
                    {isNoteExpanded ? (
                      <ChevronDown className="h-4 w-4 text-primary" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-blue-950">{nota.NOTA}</TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]" title={nota.CLIENT_NAME}>{nota.CLIENT_NAME || '-'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]" title={nota.REP_NAME}>{nota.REP_NAME || '-'}</TableCell>
                  <TableCell className="text-right font-medium">{nota.TOTAL_QUANTIDADE.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-right font-bold text-green-700">{formatCurrency(nota.TOTAL_VALOR)}</TableCell>
                </TableRow>

                {isNoteExpanded && (
                  <TableRow>
                    <TableCell colSpan={4} className="p-0 bg-white">
                      <div className="p-4 border-l-4 border-primary/40 m-2 shadow-sm rounded-r-md">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Itens da Nota {nota.NOTA}</h4>
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">V4 FIX</span>
                        </div>
                        <Table>
                          <thead className="[&_tr]:border-b bg-gray-50">
                            <TableRow>
                              <TableHead className="text-[10px] font-bold uppercase py-2">Código Item</TableHead>
                              <TableHead className="text-right text-[10px] font-bold uppercase py-2">Qtd</TableHead>
                              <TableHead className="text-right text-[10px] font-bold uppercase py-2">Unitário</TableHead>
                              <TableHead className="text-right text-[10px] font-bold uppercase py-2">Total</TableHead>
                            </TableRow>
                          </thead>
                          <TableBody>
                            {nota.items.filter(item => item != null).map((item, idx) => (
                              <TableRow key={`${nota.NOTA}-${item.ITEM_CODIGO || idx}-${idx}`} className="hover:bg-blue-50/20">
                                <TableCell className="py-2 text-[11px] font-mono font-medium">{item.ITEM_CODIGO || '-'}</TableCell>
                                <TableCell className="py-2 text-right text-[11px]">{item.QUANTIDADE?.toLocaleString('pt-BR') || '-'}</TableCell>
                                <TableCell className="py-2 text-right text-[11px]">{formatCurrency(item.VALOR_UNITARIO || 0)}</TableCell>
                                <TableCell className="py-2 text-right text-[11px] font-bold text-gray-700">
                                  {formatCurrency((item.QUANTIDADE || 0) * (item.VALOR_UNITARIO || 0))}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <React.Fragment>
      <TableRow
        className={cn(
          "cursor-pointer hover:bg-primary/5 transition-all duration-200",
          expandedDates.has(dateStr) && "bg-primary/5 border-l-4 border-primary"
        )}
        onClick={() => toggleDate(dateStr)}
      >
        <TableCell>
          {expandedDates.has(dateStr) ? (
            <ChevronDown className="h-4 w-4 text-primary" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </TableCell>
        <TableCell className="font-bold text-gray-900">
          {formatDate(dateGroup.DATA_EMISSAO)}
        </TableCell>
        <TableCell className="text-right font-medium">{totalNotas}</TableCell>
        <TableCell className="text-right font-bold text-primary">{formatCurrency(totalValor)}</TableCell>
      </TableRow>

      {expandedDates.has(dateStr) && (
        <TableRow>
          <TableCell colSpan={4} className="p-0 border-t border-muted/20">
            <div className="px-6 py-4 bg-muted/5 shadow-inner">
              {renderNotasContent()}
            </div>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
};
