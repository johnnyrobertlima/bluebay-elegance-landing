
import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { FaturamentoItem, DailyFaturamento, PedidoItem } from "@/services/bluebay/dashboardComercialTypes";
import { FaturamentoExpandableRow } from "./FaturamentoExpandableRow";
import { parseISO } from "date-fns";

// --- Types ---
interface FaturamentoTableProps {
  dailyStats: DailyFaturamento[];
  isLoading: boolean;
  onFetchDayDetails: (date: Date) => Promise<FaturamentoItem[]>;
  onFetchDayOrders?: (date: Date) => Promise<PedidoItem[]>; // Optional now
  monthlyStats?: any[];
  startDate?: Date;
  endDate?: Date;
  onDateSelect?: (date: Date) => void;
}

interface FaturamentoTableContentProps {
  dailyStats: DailyFaturamento[];
  isLoading: boolean;
  onFetchDayDetails: (date: Date) => Promise<FaturamentoItem[]>;
}

// --- Helper Functions ---
const groupItemsByNote = (items: FaturamentoItem[], dateStr: string) => {
  const grouped: any = {
    DATA_EMISSAO: dateStr,
    notas: []
  };

  const notasMap: Record<string, any> = {};

  items.forEach(item => {
    if (!item.NOTA) return;

    if (!notasMap[item.NOTA]) {
      notasMap[item.NOTA] = {
        NOTA: item.NOTA,
        DATA_EMISSAO: item.DATA_EMISSAO,
        CLIENT_NAME: item.APELIDO,
        REP_NAME: item.REPRESENTANTE_NOME,
        TOTAL_QUANTIDADE: 0,
        TOTAL_VALOR: 0,
        items: []
      };
      grouped.notas.push(notasMap[item.NOTA]);
    }

    const notaGroup = notasMap[item.NOTA];

    const qty = Number(item.QUANTIDADE) || 0;
    const valUnit = Number(item.VALOR_UNITARIO) || 0;
    const valTotal = (item.VALOR_NOTA !== undefined && item.VALOR_NOTA !== null)
      ? Number(item.VALOR_NOTA)
      : (qty * valUnit);

    notaGroup.TOTAL_QUANTIDADE += qty;
    notaGroup.TOTAL_VALOR += valTotal;
    notaGroup.items.push(item);
  });

  return grouped;
};

// --- Main Wrapper Component ---
export const FaturamentoTable: React.FC<FaturamentoTableProps> = ({
  dailyStats,
  isLoading,
  onFetchDayDetails
}) => {
  return (
    <div className="border rounded-md p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Notas Fiscais Emitidas</h3>
      <FaturamentoTableContent
        dailyStats={dailyStats}
        isLoading={isLoading}
        onFetchDayDetails={onFetchDayDetails}
      />
    </div>
  );
};

// --- Content Component (Invoices) ---
export const FaturamentoTableContent: React.FC<FaturamentoTableContentProps> = ({
  dailyStats,
  isLoading,
  onFetchDayDetails
}) => {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const [loadedData, setLoadedData] = useState<Record<string, FaturamentoItem[]>>({});
  const [loadingDates, setLoadingDates] = useState<Set<string>>(new Set());

  const toggleDate = async (dateStr: string) => {
    const isExpanding = !expandedDates.has(dateStr);

    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (isExpanding) newSet.add(dateStr);
      else newSet.delete(dateStr);
      return newSet;
    });

    if (isExpanding && !loadedData[dateStr]) {
      setLoadingDates(prev => new Set(prev).add(dateStr));
      try {
        const dateObj = parseISO(dateStr);
        const details = await onFetchDayDetails(dateObj);
        setLoadedData(prev => ({ ...prev, [dateStr]: details }));
      } catch (err) {
        console.error("Failed to load details for date", dateStr, err);
      } finally {
        setLoadingDates(prev => {
          const next = new Set(prev);
          next.delete(dateStr);
          return next;
        });
      }
    }
  };

  const toggleNote = (nota: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nota)) newSet.delete(nota);
      else newSet.add(nota);
      return newSet;
    });
  };

  if (isLoading && (!dailyStats || dailyStats.length === 0)) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando dados...
      </div>
    );
  }

  if (!dailyStats || dailyStats.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum registro encontrado para o período.
      </div>
    );
  }

  // Filter and sort stats to show most recent days with actual data first
  const invoiceStats = (dailyStats || [])
    .filter(stat => {
      const val = Number(stat.total || 0);
      const count = Number(stat.faturamentoCount || 0);
      return val > 0 || count > 0;
    })
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  if (invoiceStats.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nenhuma nota fiscal encontrada.</div>;
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
          {invoiceStats.map((stat) => {
            const dateStr = stat.date;

            const details = loadedData[dateStr] || [];
            const isLoaded = !!loadedData[dateStr];
            const isLoadingDetails = loadingDates.has(dateStr);

            const dateGroup = isLoaded
              ? groupItemsByNote(details, dateStr)
              : { DATA_EMISSAO: dateStr, notas: [] };

            return (
              <FaturamentoExpandableRow
                key={dateStr}
                dateStr={dateStr}
                dateGroup={dateGroup}
                expandedDates={expandedDates}
                expandedNotes={expandedNotes}
                toggleDate={toggleDate}
                toggleNote={toggleNote}
                stats={{
                  totalCount: Number(stat.faturamentoCount || 0),
                  totalValue: Number(stat.total || 0)
                }}
                isLoading={isLoadingDetails}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
