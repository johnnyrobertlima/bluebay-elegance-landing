
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useVariationData } from "./useVariationData";
import { useSelectionState } from "./useSelectionState";
import { saveVariationGrid } from "@/services/bluebay_adm/variationGridService";

/**
 * Main hook that composes all the other hooks and utilities for variation grid management
 */
export const useVariationGrid = (itemCode: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Get variation data (colors, sizes, existing variations)
  const {
    colors,
    sizes,
    existingVariations,
    isCheckingItem,
    itemExists,
    itemDetails,
    refreshExistingVariations
  } = useVariationData(itemCode);
  
  // Get selection state management
  const {
    selectedColors,
    selectedSizes,
    handleToggleColor,
    handleToggleSize,
    handleSelectAllColors,
    handleClearAllColors,
    handleSelectAllSizes,
    handleClearAllSizes
  } = useSelectionState(colors, sizes, existingVariations);

  // Handle saving the grid
  const handleSaveGrid = async () => {
    if (!itemCode) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Código do item não encontrado",
      });
      return null;
    }

    if (!itemDetails) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Detalhes do item não encontrados (matriz/filial)",
      });
      return null;
    }

    setIsLoading(true);
    try {
      const result = await saveVariationGrid(
        itemCode,
        selectedColors,
        selectedSizes,
        existingVariations
      );
      
      // Refresh variations after save
      await refreshExistingVariations();
      
      toast({
        title: "Grade atualizada",
        description: `Adicionadas: ${result.added}, Removidas: ${result.removed}`,
      });
      
      return result;
    } catch (error: any) {
      console.error("Error saving grid:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar grade",
        description: error.message,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
};
