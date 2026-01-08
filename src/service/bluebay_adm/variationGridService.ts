
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { getItemWithMatrizFilial } from "./itemManagementService";

export const saveVariationGrid = async (
  itemCode: string,
  selectedColors: any[],
  selectedSizes: any[],
  existingVariations: any[]
) => {
  try {
    // First, we check if the item exists and get the matriz/filial values
    const itemDetails = await getItemWithMatrizFilial(itemCode);
    
    if (!itemDetails) {
      throw new Error(`Item ${itemCode} not found or missing matriz/filial values`);
    }
    
    const matriz = itemDetails.MATRIZ;
    const filial = itemDetails.FILIAL;
    
    console.log(`Using matriz: ${matriz}, filial: ${filial} for item ${itemCode}`);

    // Calculate combinations to add
    const combinations = [];
    for (const color of selectedColors) {
      for (const size of selectedSizes) {
        const exists = existingVariations.some(
          (v) => v.id_cor === color.id && v.id_tamanho === size.id
        );
        
        if (!exists) {
          combinations.push({
            id: uuidv4(),
            item_codigo: itemCode,
            id_cor: color.id,
            id_tamanho: size.id,
            quantidade: 0,
            ean: null,
            matriz,
            filial
          });
        }
      }
    }
    
    // Find variations to remove (if a color or size is deselected)
    const variationsToRemove = existingVariations.filter((variation) => {
      const colorSelected = selectedColors.some((c) => c.id === variation.id_cor);
      const sizeSelected = selectedSizes.some((s) => s.id === variation.id_tamanho);
      return !colorSelected || !sizeSelected;
    });
    
    // Execute operations
    let addedCount = 0;
    let removedCount = 0;
    
    // Add new combinations
    if (combinations.length > 0) {
      console.log("Adding variations:", combinations);
      const { error } = await supabase
        .from("BLUEBAY_ITEM_VARIACAO")
        .insert(combinations);
        
      if (error) {
        console.error("Error adding variations:", error);
        throw error;
      }
      
      addedCount = combinations.length;
    }
    
    // Remove deselected variations
    if (variationsToRemove.length > 0) {
      for (const variation of variationsToRemove) {
        const { error } = await supabase
          .from("BLUEBAY_ITEM_VARIACAO")
          .delete()
          .eq("id", variation.id);
          
        if (error) {
          console.error(`Error removing variation ${variation.id}:`, error);
          // Continue with other deletions even if this one fails
        } else {
          removedCount++;
        }
      }
    }
    
    return {
      added: addedCount,
      removed: removedCount
    };
  } catch (error) {
    console.error("Error saving grid:", error);
    throw error;
  }
};

// Update a single variation
export const updateVariation = async (
  variationId: string, 
  data: { quantidade?: number; ean?: string }
) => {
  try {
    const { error } = await supabase
      .from("BLUEBAY_ITEM_VARIACAO")
      .update(data)
      .eq("id", variationId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating variation:", error);
    throw error;
  }
};

// Update multiple variations at once
export const updateVariations = async (
  variations: { id: string; quantidade?: number; ean?: string }[]
) => {
  try {
    // Use a transaction or batch update if available
    for (const variation of variations) {
      const { error } = await supabase
        .from("BLUEBAY_ITEM_VARIACAO")
        .update({
          quantidade: variation.quantidade,
          ean: variation.ean
        })
        .eq("id", variation.id);
        
      if (error) throw error;
    }
    return true;
  } catch (error) {
    console.error("Error updating variations:", error);
    throw error;
  }
};
