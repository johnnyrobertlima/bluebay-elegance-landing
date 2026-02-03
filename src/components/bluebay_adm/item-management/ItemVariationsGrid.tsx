
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorSelectionPanel } from "./variation-grid/ColorSelectionPanel";
import { SizeSelectionPanel } from "./variation-grid/SizeSelectionPanel";
import { VariationSummary } from "./variation-grid/VariationSummary";
import { EmptyStateDisplay } from "./variation-grid/EmptyStateDisplay";
import { VariationLoading } from "./variation-grid/VariationLoading";
import { VariationEditGrid } from "./variation-grid/VariationEditGrid";
import { useVariationGrid } from "@/hooks/bluebay_adm/variation-grid/useVariationGrid";

interface ItemVariationsGridProps {
  itemCode: string;
}

export const ItemVariationsGrid = ({ itemCode }: ItemVariationsGridProps) => {
  const [showEditGrid, setShowEditGrid] = useState(false);

  const {
    colors,
    sizes,
    selectedColors,
    selectedSizes,
    existingVariations,
    isLoading,
    isCheckingItem,
    itemExists,
    itemDetails,
    handleToggleColor,
    handleToggleSize,
    handleSelectAllColors,
    handleClearAllColors,
    handleSelectAllSizes,
    handleClearAllSizes,
    handleSaveGrid,
    refreshExistingVariations
  } = useVariationGrid(itemCode);

  // Check if we should show the edit grid on initial load
  useEffect(() => {
    if (existingVariations.length > 0 && !showEditGrid && !isLoading && !isCheckingItem) {
      // Only auto-show when there are variations and we haven't explicitly decided to hide it
      setShowEditGrid(true);
    }
  }, [existingVariations, isLoading, isCheckingItem, showEditGrid]);


  const [showEanDialog, setShowEanDialog] = useState(false);

  // Determine what to render based on current state
  if (isCheckingItem || (isLoading && (!colors.length || !sizes.length))) {
    return <VariationLoading />;
  }

  if (!itemCode) {
    return <EmptyStateDisplay type="no-item" />;
  }

  if (!itemExists) {
    return <EmptyStateDisplay type="item-not-found" details={`Item código: ${itemCode}`} />;
  }

  if (!colors.length || !sizes.length) {
    return <EmptyStateDisplay type="no-data" />;
  }

  // Handle successful save of the grid
  const handleGridSaved = async (result: any) => {
    if (result && (result.added > 0 || result.removed > 0)) {
      await refreshExistingVariations();
      setShowEditGrid(true);
    }
  };

  const handleConfirmSave = async (autoAssign: boolean) => {
    setShowEanDialog(false);
    const result = await handleSaveGrid(autoAssign);
    handleGridSaved(result);
  };

  // Function to view existing variations
  const viewExistingVariations = () => {
    setShowEditGrid(true);
  };

  // If we're showing the edit grid
  if (showEditGrid && existingVariations.length > 0) {
    return (
      <VariationEditGrid
        itemCode={itemCode}
        variations={existingVariations}
        onBack={() => setShowEditGrid(false)}
        onSaved={refreshExistingVariations}
        itemDetails={itemDetails}
        colors={colors}
        sizes={sizes}
      />
    );
  }

  return (
    <>
      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Grade de Variações</CardTitle>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowEanDialog(true)}
            disabled={isLoading || selectedColors.length === 0 || selectedSizes.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Gerar Grade
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colors selection */}
            <ColorSelectionPanel
              colors={colors}
              selectedColors={selectedColors}
              onToggleColor={handleToggleColor}
              onSelectAll={handleSelectAllColors}
              onClearAll={handleClearAllColors}
            />

            {/* Sizes selection */}
            <SizeSelectionPanel
              sizes={sizes}
              selectedSizes={selectedSizes}
              onToggleSize={handleToggleSize}
              onSelectAll={handleSelectAllSizes}
              onClearAll={handleClearAllSizes}
            />
          </div>

          <VariationSummary
            selectedColorsCount={selectedColors.length}
            selectedSizesCount={selectedSizes.length}
            combinationsCount={selectedColors.length * selectedSizes.length}
            existingVariationsCount={existingVariations.length}
            onSave={() => setShowEanDialog(true)}
            onViewExisting={viewExistingVariations}
            isLoading={isLoading}
            isValid={selectedColors.length > 0 && selectedSizes.length > 0}
          />
        </CardContent>
      </Card>

      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${showEanDialog ? '' : 'hidden'}`}>
        <div className="bg-background p-6 rounded-lg max-w-md w-full space-y-4 shadow-lg border">
          <h3 className="text-lg font-semibold">Vínculo de EANs</h3>
          <p className="text-sm text-muted-foreground">
            Como deseja prosseguir com o vínculo de códigos EAN para esta grade?
          </p>
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              onClick={() => handleConfirmSave(true)}
              className="w-full flex flex-col items-start gap-1 h-auto py-3"
              variant="default"
            >
              <span className="font-semibold">Automático</span>
              <span className="text-xs font-normal opacity-90">O sistema vinculará EANs disponíveis do banco de dados para cada combinação.</span>
            </Button>

            <Button
              type="button"
              onClick={() => handleConfirmSave(false)}
              className="w-full flex flex-col items-start gap-1 h-auto py-3"
              variant="outline"
            >
              <span className="font-semibold">Manual / Já tenho o EAN</span>
              <span className="text-xs font-normal text-muted-foreground">Será gerado o campo para digitar manualmente.</span>
            </Button>

            <Button
              type="button"
              onClick={() => setShowEanDialog(false)}
              className="w-full mt-2"
              variant="ghost"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
