
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getItemWithMatrizFilial } from "@/services/bluebay_adm/itemManagementService";

export const useVariationData = (itemCode: string) => {
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [existingVariations, setExistingVariations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingItem, setIsCheckingItem] = useState(true);
  const [itemExists, setItemExists] = useState(false);
  const [itemDetails, setItemDetails] = useState<any>(null);

  // Check if item exists and get matrix/filial values
  useEffect(() => {
    const checkItemExists = async () => {
      if (!itemCode) {
        setIsCheckingItem(false);
        setItemExists(false);
        return;
      }
      
      setIsCheckingItem(true);
      console.info(`Checking if item ${itemCode} exists in database...`);
      
      try {
        const item = await getItemWithMatrizFilial(itemCode);
        const exists = !!item;
        setItemExists(exists);
        setItemDetails(item);
        console.info(`Item ${itemCode} exists: ${exists}`);
      } catch (error) {
        console.error(`Error checking if item ${itemCode} exists:`, error);
        setItemExists(false);
      } finally {
        setIsCheckingItem(false);
      }
    };
    
    checkItemExists();
  }, [itemCode]);

  // Load colors
  useEffect(() => {
    const fetchColors = async () => {
      if (!itemExists) return;
      
      try {
        const { data, error } = await supabase
          .from("Cor")
          .select("*")
          .order("nome");
          
        if (error) throw error;
        setColors(data || []);
      } catch (error) {
        console.error("Error loading colors:", error);
        setColors([]);
      }
    };
    
    fetchColors();
  }, [itemExists]);

  // Load sizes
  useEffect(() => {
    const fetchSizes = async () => {
      if (!itemExists) return;
      
      try {
        const { data, error } = await supabase
          .from("Tamanho")
          .select("*")
          .order("ordem");
          
        if (error) throw error;
        setSizes(data || []);
      } catch (error) {
        console.error("Error loading sizes:", error);
        setSizes([]);
      }
    };
    
    fetchSizes();
  }, [itemExists]);

  // Load existing variations for this item
  const fetchExistingVariations = useCallback(async () => {
    if (!itemCode || !itemExists || !itemDetails) {
      setExistingVariations([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("BLUEBAY_ITEM_VARIACAO")
        .select(`
          id,
          item_codigo,
          id_cor,
          id_tamanho,
          quantidade,
          ean,
          matriz,
          filial,
          Cor (
            id,
            nome,
            codigo_hex
          ),
          Tamanho (
            id,
            nome,
            ordem
          )
        `)
        .eq("item_codigo", itemCode)
        .eq("matriz", itemDetails.MATRIZ)
        .eq("filial", itemDetails.FILIAL);
        
      if (error) throw error;
      
      // Organize data in a cleaner format
      const formattedVariations = (data || []).map((variation) => ({
        id: variation.id,
        item_codigo: variation.item_codigo,
        color: variation.Cor,
        size: variation.Tamanho,
        quantidade: variation.quantidade,
        ean: variation.ean,
        matriz: variation.matriz,
        filial: variation.filial,
        id_cor: variation.id_cor,
        id_tamanho: variation.id_tamanho
      }));
      
      setExistingVariations(formattedVariations);
    } catch (error) {
      console.error("Error loading variations:", error);
      setExistingVariations([]);
    } finally {
      setIsLoading(false);
    }
  }, [itemCode, itemExists, itemDetails]);

  // Load variations on initial load and when item changes
  useEffect(() => {
    fetchExistingVariations();
  }, [fetchExistingVariations]);

  return {
    colors,
    sizes,
    existingVariations,
    isLoading,
    isCheckingItem,
    itemExists,
    itemDetails,
    refreshExistingVariations: fetchExistingVariations
  };
};
