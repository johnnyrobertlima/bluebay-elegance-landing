import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { useStockSalesAnalytics } from "@/hooks/bluebay_adm/useStockSalesAnalytics";
import { StockSalesFilters } from "@/components/bluebay_adm/stock-sales/StockSalesFilters";
import { StockSalesAnalyticsTable } from "@/components/bluebay_adm/stock-sales/StockSalesAnalyticsTable";
import { useEstoqueExport } from "@/hooks/bluebay/useEstoqueExport";

const BluebayAdmEstoque = () => {
  const [showAdditionalFilters, setShowAdditionalFilters] = useState(false);

  const {
    items,
    isLoading,
    dateRange,
    updateDateRange,
    searchTerms,
    addSearchTerm,
    removeSearchTerm,
    groupFilter,
    setGroupFilter,
    companyFilter,
    setCompanyFilter,
    availableGroups,
    minCadastroYear,
    setMinCadastroYear,
    showZeroStock,
    setShowZeroStock,
    sortConfig,
    handleSort,
    refreshData,
    clearFilters
  } = useStockSalesAnalytics(false);

  // Force "all" years for Estoque page
  useEffect(() => {
    setMinCadastroYear("all");
  }, [setMinCadastroYear]);

  const { handleExportEstoque } = useEstoqueExport();

  // Calculate summary data for stock only
  const totalItems = items.length;
  const totalPhysicalStock = items.reduce((sum, item) => sum + (Number(item.FISICO) || 0), 0);
  const totalAvailableStock = items.reduce((sum, item) => sum + (Number(item.DISPONIVEL) || 0), 0);

  const SALES_COLUMNS = [
    'QTD_VENDIDA', 'VALOR_TOTAL_VENDIDO', 'PRECO_MEDIO',
    'CUSTO_MEDIO', 'GIRO_ESTOQUE', 'PERCENTUAL_ESTOQUE_VENDIDO',
    'DIAS_COBERTURA', 'DATA_ULTIMA_VENDA'
  ];

  return (
    <main className="container-fluid p-0 max-w-full">

      <BluebayAdmMenu />

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Gestão de Estoque</h1>
          <Button
            variant="outline"
            onClick={() => handleExportEstoque([], items)}
            disabled={isLoading || items.length === 0}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </Button>
        </div>

        {/* Totals Section */}
        {!isLoading && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Total de Itens</div>
              <div className="text-2xl font-bold text-primary">{totalItems}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Estoque Físico Total</div>
              <div className="text-2xl font-bold text-green-600">{(totalPhysicalStock).toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Disponível Total</div>
              <div className="text-2xl font-bold text-blue-600">{(totalAvailableStock).toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Shared Filters Component - Stock Only Mode */}
        <div className="mb-6">
          <StockSalesFilters
            dateRange={dateRange}
            onDateRangeChange={updateDateRange}
            searchTerms={searchTerms}
            onAddSearchTerm={addSearchTerm}
            onRemoveSearchTerm={removeSearchTerm}
            groupFilter={groupFilter}
            onGroupFilterChange={setGroupFilter}
            companyFilter={companyFilter}
            onCompanyFilterChange={setCompanyFilter}
            availableGroups={availableGroups}
            onRefresh={refreshData}
            onClearFilters={clearFilters}
            isLoading={isLoading}
            minCadastroYear={minCadastroYear}
            onMinCadastroYearChange={setMinCadastroYear}
            showZeroStock={showZeroStock}
            onShowZeroStockChange={setShowZeroStock}
            showAdditionalFilters={showAdditionalFilters}
            onToggleAdditionalFilters={() => setShowAdditionalFilters(!showAdditionalFilters)}
            hideDateRange={true}
          />
        </div>

        {/* Updated Table with Stock-only Columns */}
        <StockSalesAnalyticsTable
          items={items}
          isLoading={isLoading}
          sortConfig={sortConfig}
          onSort={handleSort}
          configKey="bluebay_estoque_columns_v1"
          excludeIds={SALES_COLUMNS}
        />
      </div>
    </main>
  );
};

export default BluebayAdmEstoque;
