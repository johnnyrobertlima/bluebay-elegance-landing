
import { useState, useCallback } from "react";

/**
 * Hook for managing color and size selection state
 */
export const useSelectionState = (colors: any[], sizes: any[], existingVariations: any[]) => {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // Initialize selected items based on existing variations
  useCallback(() => {
    if (existingVariations.length > 0) {
      const colorIds = [...new Set(existingVariations.map(v => v.id_cor))];
      const sizeIds = [...new Set(existingVariations.map(v => v.id_tamanho))];
      
      setSelectedColors(colorIds);
      setSelectedSizes(sizeIds);
    }
  }, [existingVariations]);

  const handleToggleColor = (colorId: string) => {
    setSelectedColors(prev => {
      if (prev.includes(colorId)) {
        return prev.filter(id => id !== colorId);
      } else {
        return [...prev, colorId];
      }
    });
  };

  const handleToggleSize = (sizeId: string) => {
    setSelectedSizes(prev => {
      if (prev.includes(sizeId)) {
        return prev.filter(id => id !== sizeId);
      } else {
        return [...prev, sizeId];
      }
    });
  };

  const handleSelectAllColors = () => {
    setSelectedColors(colors.map(color => color.id));
  };

  const handleClearAllColors = () => {
    setSelectedColors([]);
  };

  const handleSelectAllSizes = () => {
    setSelectedSizes(sizes.map(size => size.id));
  };

  const handleClearAllSizes = () => {
    setSelectedSizes([]);
  };

  return {
    selectedColors,
    selectedSizes,
    handleToggleColor,
    handleToggleSize,
    handleSelectAllColors,
    handleClearAllColors,
    handleSelectAllSizes,
    handleClearAllSizes
  };
};
