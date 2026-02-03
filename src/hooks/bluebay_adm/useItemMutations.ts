
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateItem, deleteItem } from "@/services/bluebay_adm/itemManagementService";

export const useItemMutations = (onSuccess: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveItem = async (itemData: any, isUpdate: boolean = false) => {
    try {
      setIsLoading(true);

      // Clean up empty string UUID values
      const cleanedItemData = {
        ...itemData,
        id_subcategoria: itemData.id_subcategoria || null,
        id_marca: itemData.id_marca || null
      };

      if (isUpdate) {
        // Use default 1 only if null or undefined, preserving 0
        const matriz = cleanedItemData.MATRIZ ?? 1;
        const filial = cleanedItemData.FILIAL ?? 1;

        await updateItem(
          cleanedItemData.ITEM_CODIGO,
          matriz,
          filial,
          cleanedItemData
        );
      }

      toast({
        title: isUpdate ? "Item atualizado" : "Item cadastrado",
        description: "Operação realizada com sucesso.",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error saving item:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar item",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (item: any) => {
    try {
      setIsLoading(true);
      await deleteItem(item.ITEM_CODIGO, item.MATRIZ || 1, item.FILIAL || 1);

      toast({
        title: "Item excluído",
        description: "Item removido com sucesso.",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir item",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSaveItem,
    handleDeleteItem
  };
};
