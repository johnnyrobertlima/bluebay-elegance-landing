
import React, { useState } from "react";
import { DateRangeFilterSection } from "./filters/DateRangeFilterSection";
import { SearchFilter } from "./filters/SearchFilter";
import { GroupFilter } from "./filters/GroupFilter";
import { CompanyFilter } from "./filters/CompanyFilter"; // Added
import { ActionButtons } from "./filters/ActionButtons";
import { AdditionalFilters } from "./filters/AdditionalFilters";
import { DateRange } from "@/hooks/bluebay_adm/stock-sales/useStockSalesFilters";

interface StockSalesFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  searchTerms: string[];
  onAddSearchTerm: (term: string) => void;
  onRemoveSearchTerm: (term: string) => void;
  groupFilter: string;
  onGroupFilterChange: (value: string) => void;
  companyFilter: string; // Added
  onCompanyFilterChange: (value: string) => void; // Added
  availableGroups: string[];
  onRefresh: () => void;
  onClearFilters: () => void;
  isLoading: boolean;
  minCadastroYear: string;
  onMinCadastroYearChange: (value: string) => void;
  showZeroStock: boolean;
  onShowZeroStockChange: (value: boolean) => void;
  showAdditionalFilters: boolean;
  onToggleAdditionalFilters: () => void;
  hideDateRange?: boolean; // Added
}

export const StockSalesFilters: React.FC<StockSalesFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  searchTerms,
  onAddSearchTerm,
  onRemoveSearchTerm,
  groupFilter,
  onGroupFilterChange,
  companyFilter,
  onCompanyFilterChange,
  availableGroups,
  onRefresh,
  onClearFilters,
  isLoading,
  minCadastroYear,
  onMinCadastroYearChange,
  showZeroStock,
  onShowZeroStockChange,
  showAdditionalFilters,
  onToggleAdditionalFilters,
  hideDateRange = false // Added
}) => {

  return (
    <div className="bg-white p-4 shadow rounded-lg border">
      <div className="grid gap-6">
        {/* Main Filters: 4-column grid for perfect alignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {!hideDateRange && (
            <div className="xl:col-span-1">
              <h3 className="text-sm font-medium text-gray-700 mb-1.5">Período de Vendas</h3>
              <DateRangeFilterSection
                dateRange={dateRange}
                onDateRangeChange={onDateRangeChange}
              />
            </div>
          )}

          <div className="xl:col-span-1">
            <h3 className="text-sm font-medium text-gray-700 mb-1.5">Buscar Produtos</h3>
            <SearchFilter
              searchTerms={searchTerms}
              onAddSearchTerm={onAddSearchTerm}
              onRemoveSearchTerm={onRemoveSearchTerm}
            />
          </div>

          <div className="xl:col-span-1">
            <h3 className="text-sm font-medium text-gray-700 mb-1.5">Empresa do Grupo</h3>
            <CompanyFilter
              value={companyFilter}
              onChange={onCompanyFilterChange}
            />
          </div>

          <div className="xl:col-span-1">
            <h3 className="text-sm font-medium text-gray-700 mb-1.5">Categorias / Grupos</h3>
            <GroupFilter
              value={groupFilter}
              onChange={onGroupFilterChange}
              options={availableGroups || []}
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <button
            type="button"
            onClick={onToggleAdditionalFilters}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-medium"
          >
            {showAdditionalFilters ? "Ocultar filtros adicionais" : "Mostrar filtros adicionais"}
            <svg
              className={`ml-1 h-5 w-5 transform transition-transform ${showAdditionalFilters ? 'rotate-180' : ''}`}
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
          <div className="pt-2 animate-in fade-in slide-in-from-top-2">
            <AdditionalFilters
              minCadastroYear={minCadastroYear}
              onMinCadastroYearChange={onMinCadastroYearChange}
              showZeroStock={showZeroStock}
              onShowZeroStockChange={onShowZeroStockChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};
