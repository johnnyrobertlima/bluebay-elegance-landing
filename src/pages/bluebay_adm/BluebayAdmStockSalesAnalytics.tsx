
import { useState } from "react";
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { useStockSalesAnalytics } from "@/hooks/bluebay_adm/useStockSalesAnalytics";
import { StockSalesFilters } from "@/components/bluebay_adm/stock-sales/StockSalesFilters";
import { StockSalesAnalyticsTable } from "@/components/bluebay_adm/stock-sales/StockSalesAnalyticsTable";
import { StockSalesSummary } from "@/components/bluebay_adm/stock-sales/StockSalesSummary";
import { StockSalesLegend } from "@/components/bluebay_adm/stock-sales/StockSalesLegend";

const BluebayAdmStockSalesAnalytics = () => {
  const { 
    isLoading, 
    items, 
    dateRange, 
    updateDateRange,
    searchTerm,
    setSearchTerm,
    groupFilter,
    setGroupFilter,
    availableGroups,
    sortConfig,
    handleSort,
    refreshData,
    clearFilters,
    getSummaryStats,
    usingSampleData,
    minCadastroYear,
    setMinCadastroYear,
    showZeroStock,
    setShowZeroStock,
    filterLowStock,
    filterNewProducts
  } = useStockSalesAnalytics();

  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayAdmBanner />
      <BluebayAdmMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight mb-4 md:mb-0">Análise de Estoque vs Vendas</h1>
          </div>
          
          <div className="space-y-6">
            <StockSalesFilters 
              dateRange={dateRange}
              onDateRangeChange={updateDateRange}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              groupFilter={groupFilter}
              onGroupFilterChange={setGroupFilter}
              availableGroups={availableGroups}
              onRefresh={refreshData}
              onClearFilters={clearFilters}
              isLoading={isLoading}
              minCadastroYear={minCadastroYear}
              onMinCadastroYearChange={setMinCadastroYear}
              showZeroStock={showZeroStock}
              onShowZeroStockChange={setShowZeroStock}
            />
            
            <StockSalesSummary 
              stats={getSummaryStats()} 
              usingSampleData={usingSampleData}
              onFilterLowStock={filterLowStock}
              onFilterNewProducts={filterNewProducts}
            />
            
            <div className="bg-white shadow rounded-lg overflow-hidden border">
              <div className="p-4 sm:p-6">
                <StockSalesAnalyticsTable 
                  items={items}
                  isLoading={isLoading}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
              </div>
            </div>
            
            <StockSalesLegend />
          </div>
        </div>
      </div>
    </main>
  );
};

export default BluebayAdmStockSalesAnalytics;
