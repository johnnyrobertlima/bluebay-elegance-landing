
import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { FaturamentoItem } from "@/services/bluebay/dashboardComercialTypes";
import { FaturamentoExpandableRow } from "./FaturamentoExpandableRow";
import { format, parseISO } from "date-fns";

interface GroupedFaturamento {
  DATA_EMISSAO: string | Date;
  notas: {
    NOTA: string;
    DATA_EMISSAO: string | Date;
    TOTAL_QUANTIDADE: number;
    TOTAL_VALOR: number;
    items: FaturamentoItem[];
  }[];
}

interface FaturamentoTableProps {
  faturamentoData: FaturamentoItem[];
  isLoading: boolean;
}

export const FaturamentoTableContent: React.FC<FaturamentoTableProps> = ({ faturamentoData, isLoading }) => {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  // Agrupar faturamento por data e nota
  const groupedByDate: Record<string, GroupedFaturamento> = {};
  
  // Filter out null or invalid items first
  const validItems = Array.isArray(faturamentoData) ? 
    faturamentoData.filter(item => item && item.DATA_EMISSAO && item.NOTA) : [];
  
  validItems.forEach(item => {
    // Skip invalid items - ensure both DATA_EMISSAO and NOTA exist
    if (!item || !item.DATA_EMISSAO || !item.NOTA) return;
    
    const dateStr = typeof item.DATA_EMISSAO === 'string' 
      ? format(parseISO(item.DATA_EMISSAO), 'yyyy-MM-dd')
      : format(item.DATA_EMISSAO, 'yyyy-MM-dd');
    
    if (!groupedByDate[dateStr]) {
      groupedByDate[dateStr] = {
        DATA_EMISSAO: item.DATA_EMISSAO,
        notas: []
      };
    }

    // Verificar se já temos essa nota no grupo da data
    const notaExistente = groupedByDate[dateStr].notas.find(n => n && n.NOTA === item.NOTA);
    
    // Garantir valores numéricos válidos
    const quantidade = Number(item.QUANTIDADE) || 0;
    const valorUnitario = Number(item.VALOR_UNITARIO) || 0;
    
    if (notaExistente) {
      notaExistente.TOTAL_QUANTIDADE += quantidade;
      notaExistente.TOTAL_VALOR += quantidade * valorUnitario;
      notaExistente.items.push(item);
    } else {
      groupedByDate[dateStr].notas.push({
        NOTA: item.NOTA,
        DATA_EMISSAO: item.DATA_EMISSAO,
        TOTAL_QUANTIDADE: quantidade,
        TOTAL_VALOR: quantidade * valorUnitario,
        items: [item]
      });
    }
  });
  
  // Converter para array e ordenar por data (mais recente primeiro)
  const groupedFaturamentos = Object.values(groupedByDate).sort((a, b) => {
    const dateA = new Date(a.DATA_EMISSAO).getTime();
    const dateB = new Date(b.DATA_EMISSAO).getTime();
    return dateB - dateA;
  });

  const toggleDate = (dateStr: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr);
      } else {
        newSet.add(dateStr);
      }
      return newSet;
    });
  };

  const toggleNote = (nota: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nota)) {
        newSet.delete(nota);
      } else {
        newSet.add(nota);
      }
      return newSet;
    });
  };

  if (groupedFaturamentos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma nota fiscal encontrada para o período selecionado
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>Data Emissão</TableHead>
            <TableHead className="text-right">Total de Notas</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedFaturamentos.map((dateGroup) => {
            const dateStr = typeof dateGroup.DATA_EMISSAO === 'string'
              ? dateGroup.DATA_EMISSAO
              : format(dateGroup.DATA_EMISSAO, 'yyyy-MM-dd');
            
            return (
              <FaturamentoExpandableRow
                key={dateStr}
                dateStr={dateStr}
                dateGroup={dateGroup}
                expandedDates={expandedDates}
                expandedNotes={expandedNotes}
                toggleDate={toggleDate}
                toggleNote={toggleNote}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
