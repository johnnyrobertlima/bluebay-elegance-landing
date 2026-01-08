
import React from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { FaturamentoItem } from "@/services/bluebay/dashboardComercialTypes";

interface NotaItem {
  NOTA: string;
  DATA_EMISSAO: string | Date;
  TOTAL_QUANTIDADE: number;
  TOTAL_VALOR: number;
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
}

export const FaturamentoExpandableRow: React.FC<FaturamentoExpandableRowProps> = ({
  dateStr,
  dateGroup,
  expandedDates,
  expandedNotes,
  toggleDate,
  toggleNote
}) => {
  const totalNotas = dateGroup.notas.length;
  const totalValor = dateGroup.notas.reduce((sum, nota) => sum + nota.TOTAL_VALOR, 0);
  
  const formatDate = (dateValue: string | Date) => {
    if (!dateValue) return '-';
    
    try {
      if (typeof dateValue === 'string') {
        return format(parseISO(dateValue), 'dd/MM/yyyy', { locale: ptBR });
      }
      return format(dateValue, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error("Error formatting date:", dateValue, error);
      return '-';
    }
  };
  
  return (
    <React.Fragment>
      <TableRow 
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => toggleDate(dateStr)}
      >
        <TableCell>
          {expandedDates.has(dateStr) ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </TableCell>
        <TableCell className="font-medium">
          {formatDate(dateGroup.DATA_EMISSAO)}
        </TableCell>
        <TableCell className="text-right">{totalNotas}</TableCell>
        <TableCell className="text-right">{formatCurrency(totalValor)}</TableCell>
      </TableRow>
      
      {expandedDates.has(dateStr) && (
        <TableRow>
          <TableCell colSpan={4} className="p-0 bg-muted/30">
            <div className="px-4 py-2">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead className="text-right">Quantidade Total</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dateGroup.notas.map((nota) => {
                    // Skip invalid items
                    if (!nota?.NOTA) return null;
                    
                    const notaKey = nota.NOTA;
                    
                    return (
                      <React.Fragment key={notaKey}>
                        <TableRow 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleNote(notaKey)}
                        >
                          <TableCell>
                            {expandedNotes.has(notaKey) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{nota.NOTA}</TableCell>
                          <TableCell className="text-right">{nota.TOTAL_QUANTIDADE.toLocaleString('pt-BR')}</TableCell>
                          <TableCell className="text-right">{formatCurrency(nota.TOTAL_VALOR)}</TableCell>
                        </TableRow>
                        
                        {expandedNotes.has(notaKey) && (
                          <TableRow>
                            <TableCell colSpan={4} className="p-0 bg-muted/20">
                              <div className="p-4">
                                <h4 className="font-medium mb-2">Itens da Nota {nota.NOTA}</h4>
                                <Table>
                                  <TableHead>
                                    <TableRow>
                                      <TableHead>Código Item</TableHead>
                                      <TableHead className="text-right">Quantidade</TableHead>
                                      <TableHead className="text-right">Valor Unitário</TableHead>
                                      <TableHead className="text-right">Valor Total</TableHead>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {nota.items.filter(item => item != null).map((item, idx) => (
                                      <TableRow key={`${nota.NOTA}-${item.ITEM_CODIGO || 'unknown'}-${idx}`}>
                                        <TableCell>{item.ITEM_CODIGO || '-'}</TableCell>
                                        <TableCell className="text-right">{item.QUANTIDADE?.toLocaleString('pt-BR') || '-'}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.VALOR_UNITARIO || 0)}</TableCell>
                                        <TableCell className="text-right">
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
            </div>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
};
