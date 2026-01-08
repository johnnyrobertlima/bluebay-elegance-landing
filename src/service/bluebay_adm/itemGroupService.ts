import { supabase } from "@/integrations/supabase/client";
import { fetchInBatches } from "@/services/bluebay/utils/batchFetchUtils";
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
  empresa_id: string; // Ensure empresa_id is included in ItemGroup interface
}

export const fetchEmpresas = async (): Promise<string[]> => {
  console.info("Buscando todas as empresas...");
  
  try {
    // Fetch all empresas from the new table
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
    // Get count of groups for logging
    const { count, error: countError } = await supabase
      .from('bluebay_grupo_item_view')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.info(`Esperamos carregar aproximadamente ${count} grupos`);
    }
    
    // Function to fetch groups in batches
    const fetchGroupBatch = async (offset: number, limit: number) => {
      return await supabase
        .from('bluebay_grupo_item_view')
        .select('id, gru_codigo, gru_descricao, ativo, empresa_id, empresa_nome')
        .range(offset, offset + limit - 1);
    };
    
    // Fetch all groups in batches with a larger batch size
    const batchedData = await fetchInBatches<ItemGroup>(fetchGroupBatch, 10000);
    console.info(`Total de grupos carregados: ${batchedData.length}`);
    
    return batchedData;
  } catch (error) {
    console.error("Erro ao buscar grupos:", error);
    return []; // Return empty array in case of error
  }
};

export const saveGroup = async (groupData: any): Promise<void> => {
  console.info("Salvando grupo:", groupData);
  
  try {
    // Get empresa_id from nome
    const { data: empresaData, error: empresaError } = await supabase
      .from('bluebay_empresa')
      .select('id')
      .eq('nome', groupData.empresa)
      .single();
    
    if (empresaError && empresaError.code !== 'PGRST116') { // Not found is OK
      throw empresaError;
    }
    
    let empresa_id = empresaData?.id;
    
    // If empresa doesn't exist and it's not "nao_definida", create it
    if (!empresa_id && groupData.empresa !== 'nao_definida') {
      const { data: newEmpresa, error: createError } = await supabase
        .from('bluebay_empresa')
        .insert({ nome: groupData.empresa })
        .select('id')
        .single();
      
      if (createError) throw createError;
      empresa_id = newEmpresa.id;
    }
    
    // If still no empresa_id, use the default "nao_definida"
    if (!empresa_id) {
      const { data: defaultEmpresa, error: defaultError } = await supabase
        .from('bluebay_empresa')
        .select('id')
        .eq('nome', 'nao_definida')
        .single();
      
      if (defaultError) throw defaultError;
      empresa_id = defaultEmpresa.id;
    }
    
    // Prepare group data for saving
    const saveData = {
      gru_codigo: groupData.GRU_CODIGO,
      gru_descricao: groupData.GRU_DESCRICAO,
      empresa_id,
      ativo: groupData.ativo
    };
    
    if (groupData.id) {
      // Update existing group
      const { error: updateError } = await supabase
        .from('bluebay_grupo_item')
        .update(saveData)
        .eq('id', groupData.id);
      
      if (updateError) throw updateError;
    } else {
      // Insert new group
      const { error: insertError } = await supabase
        .from('bluebay_grupo_item')
        .insert(saveData);
      
      if (insertError) throw insertError;
    }
    
    console.info("Grupo salvo com sucesso");
    return;
  } catch (error) {
    console.error("Erro ao salvar grupo:", error);
    throw error;
  }
};

// Function to get a single group by ID
export const fetchGroupById = async (id: string): Promise<ItemGroup | null> => {
  try {
    const { data, error } = await supabase
      .from('bluebay_grupo_item_view')
      .select('id, gru_codigo, gru_descricao, ativo, empresa_id, empresa_nome')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao buscar grupo por ID:", error);
    return null;
  }
};

// Function to delete a group
export const deleteGroup = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('bluebay_grupo_item')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Erro ao excluir grupo:", error);
    return false;
  }
};

// Update the exportGroupsToExcel function to include empresa_id
export const exportGroupsToExcel = (groups: ItemGroup[]): void => {
  try {
    if (!groups || groups.length === 0) {
      console.error("Nenhum grupo para exportar");
      return;
    }

    console.info(`Exportando ${groups.length} grupos para Excel...`);
    
    // Transform data for export (simplify structure)
    const exportData = groups.map(group => ({
      GRU_CODIGO: group.gru_codigo,
      GRU_DESCRICAO: group.gru_descricao,
      empresa: group.empresa_nome,
      ativo: group.ativo
    }));
    
    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Grupos');
    
    // Write to file and trigger download
    XLSX.writeFile(workbook, 'grupos_de_itens.xlsx');
    
    console.info("Exportação concluída com sucesso");
  } catch (error) {
    console.error("Erro ao exportar grupos para Excel:", error);
  }
};

// Function to import groups from Excel data
export const importGroupsFromExcel = async (data: any[]): Promise<number> => {
  console.info(`Importando ${data.length} grupos do Excel...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  try {
    for (const row of data) {
      try {
        // Validate required fields
        if (!row.GRU_CODIGO || !row.GRU_DESCRICAO) {
          console.warn("Linha ignorada por falta de dados obrigatórios:", row);
          errorCount++;
          continue;
        }
        
        // Prepare data for save
        const groupData = {
          GRU_CODIGO: row.GRU_CODIGO,
          GRU_DESCRICAO: row.GRU_DESCRICAO,
          empresa: row.empresa || 'nao_definida',
          ativo: row.ativo !== undefined ? row.ativo : true
        };
        
        // Check if group already exists
        const { data: existingGroup } = await supabase
          .from('bluebay_grupo_item')
          .select('id')
          .eq('gru_codigo', groupData.GRU_CODIGO)
          .single();
        
        if (existingGroup) {
          // Update existing group
          await saveGroup({ ...groupData, id: existingGroup.id });
        } else {
          // Create new group
          await saveGroup(groupData);
        }
        
        successCount++;
      } catch (error) {
        console.error("Erro ao importar grupo:", error, row);
        errorCount++;
      }
    }
    
    console.info(`Importação concluída. ${successCount} grupos importados com sucesso. ${errorCount} erros.`);
    return successCount;
  } catch (error) {
    console.error("Erro geral na importação:", error);
    throw error;
  }
};
