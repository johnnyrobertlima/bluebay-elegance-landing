import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

// Define interfaces for better type safety
interface Empresa {
  id: string;
  nome: string;
}

interface ItemGroup {
  id: string;
  gru_codigo: string;
  gru_descricao: string;
  ativo: boolean;
  empresa_nome: string;
  empresa_id: string;
}

export const fetchEmpresas = async (): Promise<string[]> => {
  console.info("Buscando todas as empresas...");
  
  try {
    const { data, error } = await supabase
      .from('bluebay_empresa')
      .select('nome')
      .order('nome');
    
    if (error) throw error;
    
    const empresas = data.map(item => item.nome);
    console.info(`Total de empresas: ${empresas.length}`);
    
    return empresas;
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    
    // Fallback to hardcoded list in case of error
    const empresas = ["Bluebay", "BK", "JAB", "nao_definida"];
    console.info(`Total de empresas (fallback): ${empresas.length}`);
    return empresas.sort();
  }
};

export const fetchGroups = async (): Promise<ItemGroup[]> => {
  console.info("Buscando todos os grupos...");
  
  try {
    // Use bluebay_grupo_item table directly instead of view
    const { data, error } = await supabase
      .from('bluebay_grupo_item' as any)
      .select('id, gru_codigo, gru_descricao, ativo, empresa_id');
    
    if (error) {
      console.error("Error fetching groups:", error);
      return [];
    }

    // Map data with empresa_nome placeholder
    const groups: ItemGroup[] = ((data as any[]) || []).map(item => ({
      id: item.id,
      gru_codigo: item.gru_codigo,
      gru_descricao: item.gru_descricao,
      ativo: item.ativo ?? true,
      empresa_id: item.empresa_id || '',
      empresa_nome: ''
    }));
    
    console.info(`Total de grupos carregados: ${groups.length}`);
    return groups;
  } catch (error) {
    console.error("Erro ao buscar grupos:", error);
    return [];
  }
};

export const saveGroup = async (groupData: any): Promise<void> => {
  console.info("Salvando grupo:", groupData);
  
  const { error } = await supabase
    .from('bluebay_grupo_item' as any)
    .upsert({
      id: groupData.id,
      gru_codigo: groupData.gru_codigo,
      gru_descricao: groupData.gru_descricao,
      ativo: groupData.ativo ?? true,
      empresa_id: groupData.empresa_id
    });
  
  if (error) {
    console.error("Erro ao salvar grupo:", error);
    throw error;
  }
};

export const deleteGroup = async (groupId: string): Promise<void> => {
  console.info("Excluindo grupo:", groupId);
  
  const { error } = await supabase
    .from('bluebay_grupo_item' as any)
    .delete()
    .eq('id', groupId);
  
  if (error) {
    console.error("Erro ao excluir grupo:", error);
    throw error;
  }
};

export const fetchGroupById = async (groupId: string): Promise<ItemGroup | null> => {
  console.info("Buscando grupo por ID:", groupId);
  
  try {
    const { data, error } = await supabase
      .from('bluebay_grupo_item' as any)
      .select('id, gru_codigo, gru_descricao, ativo, empresa_id')
      .eq('id', groupId)
      .single();
    
    if (error) {
      console.error("Error fetching group:", error);
      return null;
    }

    if (!data) return null;

    return {
      id: (data as any).id,
      gru_codigo: (data as any).gru_codigo,
      gru_descricao: (data as any).gru_descricao,
      ativo: (data as any).ativo ?? true,
      empresa_id: (data as any).empresa_id || '',
      empresa_nome: ''
    };
  } catch (error) {
    console.error("Erro ao buscar grupo:", error);
    return null;
  }
};

export const importGroupsFromExcel = async (file: File): Promise<{ success: boolean; count: number; errors: string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("Falha ao ler o arquivo"));
          return;
        }
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const errors: string[] = [];
        let successCount = 0;
        
        for (const row of jsonData as any[]) {
          try {
            await saveGroup({
              gru_codigo: row['Código'] || row.gru_codigo,
              gru_descricao: row['Descrição'] || row.gru_descricao,
              ativo: true,
              empresa_id: row.empresa_id
            });
            successCount++;
          } catch (error: any) {
            errors.push(`Erro ao importar linha: ${error.message}`);
          }
        }
        
        resolve({ success: errors.length === 0, count: successCount, errors });
      } catch (error: any) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
};

export const exportGroupsToExcel = (groups: ItemGroup[], filename: string = 'grupos'): void => {
  const exportData = groups.map(g => ({
    'Código': g.gru_codigo,
    'Descrição': g.gru_descricao,
    'Ativo': g.ativo ? 'Sim' : 'Não',
    'Empresa': g.empresa_nome
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Grupos');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
