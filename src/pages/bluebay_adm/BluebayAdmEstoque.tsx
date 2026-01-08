
import { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { EstoqueSearchFilter } from "@/components/bluebay_adm/estoque/EstoqueSearchFilter";
import { EstoqueSummaryCards } from "@/components/bluebay_adm/estoque/EstoqueSummaryCards";
import { EstoqueItemList } from "@/components/bluebay_adm/estoque/EstoqueItemList";
import { useEstoqueData } from "@/hooks/bluebay/useEstoqueData";
import { useEstoqueExport } from "@/hooks/bluebay/useEstoqueExport";

const BluebayAdmEstoque = () => {
  const { 
    filteredItems, 
    groupedItems, 
    isLoading, 
    searchTerm, 
    setSearchTerm 
  } = useEstoqueData();
  
  const { handleExportEstoque } = useEstoqueExport();

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
          <h1 className="text-3xl font-bold text-primary">Gestão de Estoque</h1>
          <Button 
            variant="outline" 
            onClick={() => handleExportEstoque(groupedItems, filteredItems)}
            disabled={isLoading || filteredItems.length === 0}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </Button>
        </div>

        {/* Search Filter */}
        <EstoqueSearchFilter 
          searchTerm={searchTerm} 
          onSearchChange={handleSearchChange} 
        />

        {/* Summary Cards */}
        {!isLoading && filteredItems.length > 0 && (
          <EstoqueSummaryCards 
            totalGroups={totalGroups}
            totalItems={totalItems}
            totalPhysicalStock={totalPhysicalStock}
          />
        )}

        {/* Estoque Items List */}
        <EstoqueItemList
          isLoading={isLoading}
          groupedItems={groupedItems}
          searchTerm={searchTerm}
          totalItems={totalItems}
        />
      </div>
    </main>
  );
};

export default BluebayAdmEstoque;
