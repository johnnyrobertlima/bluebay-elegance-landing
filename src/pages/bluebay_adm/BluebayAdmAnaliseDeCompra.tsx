
import { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { AnaliseDeCompraSearchFilter } from "@/components/bluebay_adm/analisedecompra/AnaliseDeCompraSearchFilter";
import { AnaliseDeCompraSummaryCards } from "@/components/bluebay_adm/analisedecompra/AnaliseDeCompraSummaryCards";
import { AnaliseDeCompraItemList } from "@/components/bluebay_adm/analisedecompra/AnaliseDeCompraItemList";
import { useAnaliseDeCompraData } from "@/hooks/bluebay/useAnaliseDeCompraData";
import { useAnaliseDeCompraExport } from "@/hooks/bluebay/useAnaliseDeCompraExport";

const BluebayAdmAnaliseDeCompra = () => {
  const { 
    filteredItems, 
    groupedItems, 
    isLoading, 
    searchTerm, 
    setSearchTerm 
  } = useAnaliseDeCompraData();
  
  const { handleExportAnaliseDeCompra } = useAnaliseDeCompraExport();

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Calculate summary data
  const totalGroups = groupedItems.length;
  const totalItems = filteredItems.length;
  const totalPhysicalStock = filteredItems.reduce((sum, item) => sum + (Number(item.FISICO) || 0), 0);

  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayAdmBanner />
      <BluebayAdmMenu />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Análise de Compra</h1>
          <Button 
            variant="outline" 
            onClick={() => handleExportAnaliseDeCompra(groupedItems, filteredItems)}
            disabled={isLoading || filteredItems.length === 0}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </Button>
        </div>

        {/* Search Filter */}
        <AnaliseDeCompraSearchFilter 
          searchTerm={searchTerm} 
          onSearchChange={handleSearchChange} 
        />

        {/* Summary Cards */}
        {!isLoading && filteredItems.length > 0 && (
          <AnaliseDeCompraSummaryCards 
            totalGroups={totalGroups}
            totalItems={totalItems}
            totalPhysicalStock={totalPhysicalStock}
          />
        )}

        {/* Análise de Compra Items List */}
        <AnaliseDeCompraItemList
          isLoading={isLoading}
          groupedItems={groupedItems}
          searchTerm={searchTerm}
          totalItems={totalItems}
        />
      </div>
    </main>
  );
};

export default BluebayAdmAnaliseDeCompra;
