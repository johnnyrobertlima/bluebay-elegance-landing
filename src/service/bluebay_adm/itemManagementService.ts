
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
  estacao?: string;
}

/**
 * Fetches active groups from the bluebay_grupo_item table
 */
export const fetchGroups = async (): Promise<GroupItem[]> => {
  console.log("Fetching active groups...");

  try {
    const { data, error } = await supabase
      .from("bluebay_grupo_item" as any)
      .select("id, gru_codigo, gru_descricao, empresa_id, estacao_ano, bluebay_empresa(nome)")
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

      const empresaObj = group.bluebay_empresa;
      const empresaNome = Array.isArray(empresaObj) ? empresaObj[0]?.nome : empresaObj?.nome;

      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          id: group.id,
          gru_codigo: group.gru_codigo,
          gru_descricao: group.gru_descricao,
          empresa_id: group.empresa_id,
          empresa_nome: empresaNome,
          estacao: group.estacao_ano
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
      .select("ITEM_CODIGO, MATRIZ, FILIAL, DESCRICAO, GRU_CODIGO, GRU_DESCRICAO, estacao, FOTO_PRODUTO, URL_CATALOGO, LOOKBOOK, SHOWROOM, CORES, GRADE, QTD_CAIXA, ENDERECO_CD, CODIGO_RFID, DUN14")
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
  searchTerms: string[] = [], // Changed from string to string[]
  groupFilter?: string,
  empresaFilter?: string
): Promise<{ items: any[]; totalCount: number }> => {
  try {
    let query = supabase
      .from("BLUEBAY_ITEM")
      .select("ITEM_CODIGO, DESCRICAO, GRU_CODIGO, GRU_DESCRICAO, CODIGOAUX, id_subcategoria, id_marca, empresa, estacao, genero, faixa_etaria, ativo, ncm, FOTO_PRODUTO, URL_CATALOGO, LOOKBOOK, SHOWROOM, CORES, GRADE, QTD_CAIXA, ENDERECO_CD, CODIGO_RFID, DUN14, MATRIZ, FILIAL", { count: "exact" });

    // Apply cumulative search terms
    if (searchTerms && searchTerms.length > 0) {
      searchTerms.forEach(term => {
        if (term.trim()) {
          query = query.or(`ITEM_CODIGO.ilike.%${term}%,DESCRICAO.ilike.%${term}%,CODIGOAUX.ilike.%${term}%`);
        }
      });
    }

    if (groupFilter && groupFilter !== "all") {
      query = query.eq("GRU_CODIGO", groupFilter);
    }

    if (empresaFilter && empresaFilter !== "all") {
      if (empresaFilter === "sem-empresa") {
        query = query.or('empresa.is.null,empresa.eq.""');
      } else {
        query = query.eq("empresa", empresaFilter);
      }
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

  console.log("Item updated successfully");
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
  empresasCache = null;
};

/**
 * Upload product image to Supabase Storage
 */
export const uploadProductImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadProductImage:', error);
    throw error;
  }
};

/**
 * Upload product image to Supabase Storage
 */



