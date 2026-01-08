
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

  // Custom save grid handler that shows edit grid on success
  const saveGridAndShowEdit = async () => {
    const result = await handleSaveGrid();
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
      />
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Grade de Variações</CardTitle>
        <Button 
          size="sm" 
          onClick={saveGridAndShowEdit} 
          disabled={isLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar Grade
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
          onSave={saveGridAndShowEdit}
          onViewExisting={viewExistingVariations}
          isLoading={isLoading}
          isValid={selectedColors.length > 0 && selectedSizes.length > 0}
        />
      </CardContent>
    </Card>
  );
};
