
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
}

export interface FiltersState {
  dateRange: DateRange;
  brand: string | null;
  status: string | null;
  representative: string;
  searchTerm: string;
}

interface FiltersContextType {
  filters: FiltersState;
  updateDateRange: (from: Date, to: Date) => void;
  updateBrand: (brand: string | null) => void;
  updateStatus: (status: string | null) => void;
  updateRepresentative: (rep: string) => void;
  updateSearchTerm: (term: string) => void;
  resetFilters: () => void;
}

const defaultFilters: FiltersState = {
  dateRange: { from: undefined, to: undefined, startDate: undefined, endDate: undefined },
  brand: null,
  status: null,
  representative: "",
  searchTerm: "",
};

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export const FiltersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);

  const updateDateRange = useCallback((from: Date, to: Date) => {
    setFilters((prev) => ({ 
      ...prev, 
      dateRange: { from, to, startDate: from, endDate: to } 
    }));
  }, []);

  const updateBrand = useCallback((brand: string | null) => {
    setFilters((prev) => ({ ...prev, brand }));
  }, []);

  const updateStatus = useCallback((status: string | null) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const updateRepresentative = useCallback((representative: string) => {
    setFilters((prev) => ({ ...prev, representative }));
  }, []);

  const updateSearchTerm = useCallback((searchTerm: string) => {
    setFilters((prev) => ({ ...prev, searchTerm }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <FiltersContext.Provider
      value={{
        filters,
        updateDateRange,
        updateBrand,
        updateStatus,
        updateRepresentative,
        updateSearchTerm,
        resetFilters,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = (): FiltersContextType => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error("useFilters must be used within a FiltersProvider");
  }
  return context;
};
