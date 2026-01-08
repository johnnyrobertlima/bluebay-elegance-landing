
import { useState, useEffect, useCallback, memo } from "react";
import { Dialog } from "@/components/ui/dialog";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { useItemManagement } from "@/hooks/bluebay_adm/useItemManagement";
import { ItemManagementHeader } from "@/components/bluebay_adm/item-management/ItemManagementHeader";
import { ItemFilters } from "@/components/bluebay_adm/item-management/ItemFilters";
import { ItemDialog } from "@/components/bluebay_adm/item-management/ItemDialog";
import { ItemsContent } from "@/components/bluebay_adm/item-management/ItemsContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductVariationsManager } from "@/components/bluebay_adm/item-management/ProductVariationsManager";
import { useSearchParams } from "react-router-dom";
import { exportItemsToExcel, importItemsFromExcel } from "@/services/bluebay_adm/itemExportService";
import { useToast } from "@/hooks/use-toast";

// Memoized components to avoid unnecessary re-renders
const MemoizedItemManagementHeader = memo(ItemManagementHeader);
const MemoizedItemFilters = memo(ItemFilters);
const MemoizedItemsContent = memo(ItemsContent);
const MemoizedItemDialog = memo(ItemDialog);
const MemoizedProductVariationsManager = memo(ProductVariationsManager);

const BluebayAdmItemManagement = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "items";
  const productParam = searchParams.get("product");
  
  const [activeTab, setActiveTab] = useState(tabParam);
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const { 
    items, 
    isLoading, 
    searchTerm, 
    setSearchTerm, 
    groupFilter, 
    setGroupFilter,
    empresaFilter,
    setEmpresaFilter, 
    groups,
    empresas,
    selectedItem,
    setSelectedItem,
    isDialogOpen,
    setIsDialogOpen,
    handleSaveItem,
    handleDeleteItem,
    pagination,
    totalCount,
    subcategories,
    brands,
    addSubcategory,
    addBrand,
    isLoadingAll,
    loadAllItems,
    refreshItems
  } = useItemManagement();

  // Only render after component is mounted to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle URL parameters
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const handleNewItem = useCallback(() => {
    setSelectedItem(null);
    setIsDialogOpen(true);
  }, [setSelectedItem, setIsDialogOpen]);

  const handleEditItem = useCallback((item: any) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  }, [setSelectedItem, setIsDialogOpen]);

  const handleExportItems = useCallback(async () => {
    try {
      setIsExporting(true);
      const exportedCount = await exportItemsToExcel(searchTerm, groupFilter, empresaFilter);
      
      if (exportedCount > 0) {
        toast({
          title: "Exportação concluída",
          description: `${exportedCount} itens foram exportados com sucesso.`,
        });
      } else {
        toast({
          title: "Exportação vazia",
          description: "Nenhum item encontrado para exportação.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Erro ao exportar itens:", error);
      toast({
        title: "Erro na exportação",
        description: error.message || "Ocorreu um erro durante a exportação dos itens.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [searchTerm, groupFilter, empresaFilter, toast]);

  const handleImportItems = useCallback(async (file: File) => {
    try {
      setIsImporting(true);
      toast({
        title: "Processando importação",
        description: "Aguarde enquanto os itens são atualizados...",
      });
      
      const result = await importItemsFromExcel(file);
      
      if (result.success) {
        toast({
          title: "Importação concluída",
          description: `${result.updated} de ${result.totalProcessed} itens foram atualizados com sucesso.${
            result.errors.length > 0 ? ` Houve ${result.errors.length} erros.` : ''
          }`,
        });
        
        // Refresh the items list to show updated data
        refreshItems();
      } else {
        toast({
          title: "Erro na importação",
          description: result.errors.join('; '),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Erro ao importar itens:", error);
      toast({
        title: "Erro na importação",
        description: error.message || "Ocorreu um erro durante a importação dos itens.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  }, [toast, refreshItems]);

  if (!isMounted) {
    return null;
  }

  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayAdmMenu />
      <div className="container mx-auto p-6 max-w-7xl">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="flex justify-between items-start">
            <MemoizedItemManagementHeader 
              onNewItem={handleNewItem} 
              isDialogOpen={isDialogOpen} 
            />
            
            <TabsList>
              <TabsTrigger value="items">Produtos</TabsTrigger>
              <TabsTrigger value="variations">Variações</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="items" className="space-y-6">
            <MemoizedItemFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              groupFilter={groupFilter}
              onGroupFilterChange={setGroupFilter}
              empresaFilter={empresaFilter}
              onEmpresaFilterChange={setEmpresaFilter}
              groups={groups}
              empresas={empresas}
              onLoadAllItems={loadAllItems}
              isLoadingAll={isLoadingAll}
              onExportItems={handleExportItems}
              onImportItems={handleImportItems}
            />

            <MemoizedItemsContent
              items={items}
              isLoading={isLoading || isLoadingAll || isExporting || isImporting}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              pagination={pagination}
              totalCount={totalCount}
            />
          </TabsContent>
          
          <TabsContent value="variations" className="space-y-6">
            <MemoizedProductVariationsManager initialSelectedProduct={productParam} />
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <MemoizedItemDialog
            selectedItem={selectedItem}
            onSave={handleSaveItem}
            groups={groups}
            subcategories={subcategories}
            brands={brands}
            addSubcategory={addSubcategory}
            addBrand={addBrand}
          />
        </Dialog>
      </div>
    </main>
  );
};

export default BluebayAdmItemManagement;
