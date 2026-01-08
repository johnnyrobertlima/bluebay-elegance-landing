
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchGroups, 
  fetchEmpresas, 
  saveGroup,
  deleteGroup,
  exportGroupsToExcel,
  importGroupsFromExcel
} from "@/services/bluebay_adm/itemGroupService";

interface ItemGroup {
  id: string;
  gru_codigo: string;
  gru_descricao: string;
  ativo: boolean;
  empresa_nome: string;
  empresa_id: string; // Adding this required property to fix the type error
}

export const useItemGroupManagement = () => {
  const [groups, setGroups] = useState<ItemGroup[]>([]);
  const [empresas, setEmpresas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<ItemGroup | null>(null);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Loading data for item group management...");
      
      // Load data concurrently for better performance
      const [fetchedGroups, fetchedEmpresas] = await Promise.all([
        fetchGroups(),
        fetchEmpresas()
      ]);
      
      console.log(`Loaded ${fetchedGroups.length} groups`);
      setGroups(fetchedGroups);
      setEmpresas(fetchedEmpresas);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: error.message || "Ocorreu um erro desconhecido",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveGroup = useCallback(async (groupData: any) => {
    try {
      setIsLoading(true);
      await saveGroup(groupData);
      
      toast({
        title: "Sucesso",
        description: groupData.id 
          ? "Grupo atualizado com sucesso!" 
          : "Novo grupo criado com sucesso!",
      });
      
      // Refresh data to ensure consistency
      await loadData();
      return true;
    } catch (error: any) {
      console.error("Error saving group:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar grupo",
        description: error.message || "Ocorreu um erro desconhecido",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadData, toast]);

  const handleDeleteGroup = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const success = await deleteGroup(id);
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Grupo excluído com sucesso!",
        });
        
        // Refresh data to ensure consistency
        await loadData();
        return true;
      } else {
        throw new Error("Falha ao excluir grupo");
      }
    } catch (error: any) {
      console.error("Error deleting group:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir grupo",
        description: error.message || "Ocorreu um erro desconhecido",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadData, toast]);

  const handleExportGroups = useCallback(() => {
    try {
      if (groups.length === 0) {
        toast({
          variant: "destructive",
          title: "Exportação falhou",
          description: "Não há grupos para exportar",
        });
        return;
      }

      exportGroupsToExcel(groups);
      
      toast({
        title: "Exportação concluída",
        description: `${groups.length} grupos exportados com sucesso.`,
      });
    } catch (error: any) {
      console.error("Error exporting groups:", error);
      toast({
        variant: "destructive",
        title: "Erro ao exportar",
        description: error.message || "Ocorreu um erro na exportação",
      });
    }
  }, [groups, toast]);

  const handleImportGroups = useCallback(async (data: any[]) => {
    try {
      setIsLoading(true);
      const importedCount = await importGroupsFromExcel(data);
      
      toast({
        title: "Importação concluída",
        description: `${importedCount} grupos importados com sucesso.`,
      });
      
      await loadData();
    } catch (error: any) {
      console.error("Error importing groups:", error);
      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: error.message || "Ocorreu um erro ao importar os grupos",
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadData, toast]);

  return {
    groups,
    empresas,
    isLoading,
    selectedGroup,
    setSelectedGroup,
    handleSaveGroup,
    handleDeleteGroup,
    handleExportGroups,
    handleImportGroups,
    refreshData: loadData
  };
};
