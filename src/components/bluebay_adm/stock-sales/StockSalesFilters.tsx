
import React, { useState } from "react";
import { DateRangeFilterSection } from "./filters/DateRangeFilterSection";
import { SearchFilter } from "./filters/SearchFilter";
import { GroupFilter } from "./filters/GroupFilter";
import { ActionButtons } from "./filters/ActionButtons";
import { AdditionalFilters } from "./filters/AdditionalFilters";
import { DateRange } from "@/hooks/bluebay_adm/stock-sales/useStockSalesFilters";

interface StockSalesFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  groupFilter: string;
  onGroupFilterChange: (value: string) => void;
  availableGroups: string[];
  onRefresh: () => void;
  onClearFilters: () => void;
  isLoading: boolean;
  minCadastroYear: string;
  onMinCadastroYearChange: (value: string) => void;
  showZeroStock: boolean;
  onShowZeroStockChange: (value: boolean) => void;
}

export const StockSalesFilters: React.FC<StockSalesFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  searchTerm,
  onSearchChange,
  groupFilter,
  onGroupFilterChange,
  availableGroups,
  onRefresh,
  onClearFilters,
  isLoading,
  minCadastroYear,
  onMinCadastroYearChange,
  showZeroStock,
  onShowZeroStockChange
}) => {
  const [showAdditionalFilters, setShowAdditionalFilters] = useState(true);

  return (
    <div className="bg-white p-4 shadow rounded-lg border">
      <div className="grid gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <DateRangeFilterSection
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
          />
          
          <div className="flex-1 grid gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
              />
              
              <GroupFilter
                value={groupFilter}
                onChange={onGroupFilterChange}
                options={availableGroups || []}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowAdditionalFilters(!showAdditionalFilters)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            {showAdditionalFilters ? "Ocultar filtros adicionais" : "Mostrar filtros adicionais"}
            <svg
              className={`ml-1 h-5 w-5 transform ${showAdditionalFilters ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <ActionButtons
            onRefresh={onRefresh}
            onClearFilters={onClearFilters}
            isLoading={isLoading}
          />
        </div>
        
        {showAdditionalFilters && (
          <AdditionalFilters
            minCadastroYear={minCadastroYear}
            onMinCadastroYearChange={onMinCadastroYearChange}
            showZeroStock={showZeroStock}
            onShowZeroStockChange={onShowZeroStockChange}
          />
        )}
      </div>
    </div>
  );
};
