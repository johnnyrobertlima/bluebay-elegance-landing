
import { supabase } from "@/integrations/supabase/client";
import { getItemWithMatrizFilial } from "./itemManagementService";

// Simple UUID generator
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

import { eanService } from "@/service/bluebay_adm/eanService";

export const saveVariationGrid = async (
  itemCode: string,
  selectedColors: any[],
  selectedSizes: any[],
  existingVariations: any[],
  autoAssignEan: boolean = false
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
            id: generateUUID(),
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

    // Handle EAN Assignment if Auto
    if (autoAssignEan && combinations.length > 0) {
      const availableEans = await eanService.fetchAvailableEans(combinations.length);

      if (availableEans.length < combinations.length) {
        console.warn(`Not enough EANs available. Needed ${combinations.length}, found ${availableEans.length}`);
        // Assign what we have, leave rest null
      }

      for (let i = 0; i < combinations.length; i++) {
        if (i < availableEans.length) {
          const ean = availableEans[i];
          combinations[i].ean = ean;

          // Bind in DB (Update BLUEBAY_EAN)
          // We do this individually or we could create a bulk method. Individual is safer for now.
          // We need the color/size names, but 'combinations' has IDs. 
          // We rely on the caller passing objects with names, or we look them up.
          // selectedColors/Sizes have the info.
          const colorObj = selectedColors.find(c => c.id === combinations[i].id_cor);
          const sizeObj = selectedSizes.find(s => s.id === combinations[i].id_tamanho);

          await eanService.bindEanToItem(ean, itemCode, colorObj?.nome || "", sizeObj?.nome || "");
        }
      }
    }

    // Add new combinations
    if (combinations.length > 0) {
      console.log("DEBUG: Inserting combinations payload:", JSON.stringify(combinations, null, 2));
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

          // Free up EAN if it was assigned? 
          // Requirement doesn't explicitly say to unbind EANs on delete, but good practice.
          // For now, let's keep it simple as user didn't request unbind.
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

// Helper to check if EAN is already used
const isEanAvailable = async (ean: string, excludeVariationId?: string): Promise<boolean> => {
  if (!ean) return true;

  // Check in BLUEBAY_ITEM_VARIACAO
  let query = supabase
    .from("BLUEBAY_ITEM_VARIACAO")
    .select("id")
    .eq("ean", ean);

  if (excludeVariationId) {
    query = query.neq("id", excludeVariationId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error checking EAN availability:", error);
    throw error;
  }

  return data.length === 0;
};

// Update multiple variations at once
export const updateVariations = async (
  variations: { id: string; quantidade?: number; ean?: string }[]
) => {
  try {
    // Validate EAN uniqueness first
    for (const variation of variations) {
      if (variation.ean) {
        const isAvailable = await isEanAvailable(variation.ean, variation.id);
        if (!isAvailable) {
          throw new Error(`O EAN ${variation.ean} já está em uso por outra variação.`);
        }
      }
    }

    // Perform updates
    for (const variation of variations) {
      const updateData: any = {};
      if (variation.quantidade !== undefined) updateData.quantidade = variation.quantidade;
      if (variation.ean !== undefined) updateData.ean = variation.ean;

      if (Object.keys(updateData).length > 0) {
        console.log(`DEBUG: Updating variation ${variation.id} with data:`, updateData);
        const { data, error } = await supabase
          .from("BLUEBAY_ITEM_VARIACAO")
          .update(updateData)
          .eq("id", variation.id)
          .select();

        if (error) {
          console.error("DEBUG: Error updating variation:", error);
          throw error;
        }
        console.log("DEBUG: Update successful, returned data:", data);
      }
    }
    return true;
  } catch (error) {
    console.error("Error updating variations:", error);
    throw error;
  }
};
