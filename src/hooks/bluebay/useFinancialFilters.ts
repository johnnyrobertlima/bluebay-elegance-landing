
import { useState, useCallback } from "react";

export interface ClientFinancialSummary {
  PES_CODIGO: string;
  CLIENTE_NOME: string;
  CNPJCPF?: string;
  totalVencido: number;
  totalAVencer: number;
  totalGeral: number;
  qtdTitulos: number;
  diasAtrasoMax: number;
  totalValoresVencidos: number;
  totalEmAberto: number;
  totalPago: number;
}

export interface FinancialFiltersState {
  searchTerm: string;
  statusFilter: "todos" | "vencidos" | "a_vencer" | "pagos";
  sortField: string;
  sortDirection: "asc" | "desc";
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export const useFinancialFilters = () => {
  const [filters, setFilters] = useState<FinancialFiltersState>({
    searchTerm: "",
    statusFilter: "todos",
    sortField: "DTVENCIMENTO",
    sortDirection: "asc",
    dateRange: {
      from: undefined,
      to: undefined,
    },
  });

  const updateSearchTerm = useCallback((term: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: term }));
  }, []);

  const updateStatusFilter = useCallback((status: FinancialFiltersState["statusFilter"]) => {
    setFilters((prev) => ({ ...prev, statusFilter: status }));
  }, []);

  const updateSort = useCallback((field: string) => {
    setFilters((prev) => ({
      ...prev,
      sortField: field,
      sortDirection:
        prev.sortField === field && prev.sortDirection === "asc" ? "desc" : "asc",
    }));
  }, []);

  const updateDateRange = useCallback((range: { from: Date | undefined; to: Date | undefined }) => {
    setFilters((prev) => ({ ...prev, dateRange: range }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      statusFilter: "todos",
      sortField: "DTVENCIMENTO",
      sortDirection: "asc",
      dateRange: {
        from: undefined,
        to: undefined,
      },
    });
  }, []);

  return {
    filters,
    updateSearchTerm,
    updateStatusFilter,
    updateSort,
    updateDateRange,
    resetFilters,
  };
};
