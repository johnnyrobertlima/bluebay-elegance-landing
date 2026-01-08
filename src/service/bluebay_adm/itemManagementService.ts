
import { supabase } from "@/integrations/supabase/client";

// Cache para grupos (não muda com frequência)
let groupsCache: any[] | null = null;
// Cache para empresas (não muda com frequência)
let empresasCache: string[] | null = null;

interface GroupItem {
  id: string;
  gru_codigo: string;
  gru_descricao: string;
  empresa_nome?: string;
  empresa_id?: string;
}

/**
 * Fetches active groups from the bluebay_grupo_item table
 */
export const fetchGroups = async (): Promise<GroupItem[]> => {
  console.log("Fetching active groups...");
  
  try {
    const { data, error } = await supabase
      .from("bluebay_grupo_item" as any)
      .select("id, gru_codigo, gru_descricao, empresa_id")
      .eq("ativo", true)
      .order("gru_descricao");

    if (error) {
      console.error("Error fetching groups:", error);
      throw error;
    }

    // Make sure we sanitize the data
    const groupsMap = new Map<string, GroupItem>();
    
    ((data as any[]) || []).forEach((group: any) => {
      if (!group.gru_codigo) {
        group.gru_codigo = `group-${group.id}`;
      }
      
      const key = `${group.gru_codigo}|${group.gru_descricao}`;
      
      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          id: group.id,
          gru_codigo: group.gru_codigo,
          gru_descricao: group.gru_descricao,
          empresa_id: group.empresa_id
        });
      }
    });
    
    const sanitizedData = Array.from(groupsMap.values());
    
    groupsCache = sanitizedData;
    console.log(`Found ${sanitizedData.length} unique groups`);
    
    return sanitizedData;
  } catch (error) {
    console.error("Error in fetchGroups:", error);
    return groupsCache || [];
  }
};

/**
 * Fetches all empresas
 */
export const fetchEmpresas = async (): Promise<string[]> => {
  if (empresasCache) {
    return empresasCache;
  }
  
  try {
    const { data, error } = await supabase
      .from('bluebay_empresa')
      .select('nome')
      .order('nome');
    
    if (error) throw error;
    
    empresasCache = data.map(item => item.nome);
    return empresasCache;
  } catch (error) {
    console.error("Error fetching empresas:", error);
    return ["Bluebay", "BK", "JAB", "nao_definida"];
  }
};

/**
 * Get item with MATRIZ and FILIAL values
 */
export const getItemWithMatrizFilial = async (itemCode: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from("BLUEBAY_ITEM")
      .select("ITEM_CODIGO, MATRIZ, FILIAL, DESCRICAO, GRU_CODIGO, GRU_DESCRICAO")
      .eq("ITEM_CODIGO", itemCode)
      .limit(1)
      .single();

    if (error) {
      console.error("Error getting item:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getItemWithMatrizFilial:", error);
    return null;
  }
};

/**
 * Fetches items with pagination
 */
export const fetchItems = async (
  page: number = 1,
  pageSize: number = 50,
  searchTerm?: string,
  groupFilter?: string,
  empresaFilter?: string
): Promise<{ items: any[]; totalCount: number }> => {
  try {
    let query = supabase
      .from("BLUEBAY_ITEM")
      .select("*", { count: "exact" });

    if (searchTerm) {
      query = query.or(`ITEM_CODIGO.ilike.%${searchTerm}%,DESCRICAO.ilike.%${searchTerm}%,CODIGOAUX.ilike.%${searchTerm}%`);
    }

    if (groupFilter && groupFilter !== "all") {
      query = query.eq("GRU_CODIGO", groupFilter);
    }

    if (empresaFilter && empresaFilter !== "all") {
      query = query.eq("empresa", empresaFilter);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query.range(from, to).order("DESCRICAO");

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching items:", error);
      throw error;
    }

    return {
      items: data || [],
      totalCount: count || 0
    };
  } catch (error) {
    console.error("Error in fetchItems:", error);
    return { items: [], totalCount: 0 };
  }
};

/**
 * Update an item
 */
export const updateItem = async (itemCode: string, matriz: number, filial: number, data: any): Promise<void> => {
  const { error } = await supabase
    .from("BLUEBAY_ITEM")
    .update(data)
    .eq("ITEM_CODIGO", itemCode)
    .eq("MATRIZ", matriz)
    .eq("FILIAL", filial);

  if (error) {
    console.error("Error updating item:", error);
    throw error;
  }
};

/**
 * Delete an item
 */
export const deleteItem = async (itemCode: string, matriz: number, filial: number): Promise<void> => {
  const { error } = await supabase
    .from("BLUEBAY_ITEM")
    .delete()
    .eq("ITEM_CODIGO", itemCode)
    .eq("MATRIZ", matriz)
    .eq("FILIAL", filial);

  if (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
};

/**
 * Clear caches
 */
export const clearCaches = (): void => {
  groupsCache = null;
  empresasCache = null;
};
