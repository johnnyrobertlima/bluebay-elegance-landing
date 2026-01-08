
import { supabase } from "@/integrations/supabase/client";
import { fetchInBatches } from "@/services/bluebay/utils/batchFetchUtils";

// Cache para grupos (não muda com frequência)
let groupsCache: any[] | null = null;
// Cache para empresas (não muda com frequência)
let empresasCache: string[] | null = null;

/**
 * Fetches active groups from the bluebay_grupo_item_view
 */
export const fetchGroups = async () => {
  console.log("Fetching active groups from bluebay_grupo_item_view...");
  
  try {
    const { data, error } = await supabase
      .from("bluebay_grupo_item_view")
      .select("id, gru_codigo, gru_descricao, empresa_nome, empresa_id")
      .eq("ativo", true)
      .eq("empresa_id", "19f0609b-5c9f-4e69-a0ae-3a5fda98f08c")
      .order("gru_descricao");

    if (error) {
      console.error("Error fetching groups:", error);
      throw error;
    }

    // Make sure we sanitize the data to prevent empty string values
    // and remove duplicate groups by using a Map with a composite key of gru_codigo+gru_descricao
    const groupsMap = new Map();
    
    data?.forEach(group => {
      if (!group.gru_codigo) {
        // Fallback for empty string
        group.gru_codigo = `group-${group.id}`;
      }
      
      // Create a composite key using both code and description to ensure uniqueness
      const key = `${group.gru_codigo}|${group.gru_descricao}`;
      
      // Only add if not already in the map
      if (!groupsMap.has(key)) {
        groupsMap.set(key, group);
      }
    });
    
    // Convert Map back to array
    const sanitizedData = Array.from(groupsMap.values());

    console.log(`Found ${sanitizedData.length || 0} unique active groups from ${data?.length || 0} total groups`);
    return sanitizedData;
  } catch (error) {
    console.error("Error fetching groups:", error);
    return []; // Return empty array in case of error
  }
};

/**
 * Busca todas as empresas distintas dos grupos ativos
 */
export const fetchEmpresas = async () => {
  // Verificamos se temos as empresas em cache
  if (empresasCache !== null) {
    console.log("Usando empresas em cache:", empresasCache.length);
    return empresasCache;
  }

  console.log("Buscando empresas de grupos ativos...");
  
  try {
    // Buscar empresas dos grupos ativos
    const { data, error } = await supabase
      .from("bluebay_grupo_item_view")
      .select("empresa_nome")
      .eq("ativo", true)
      .eq("empresa_id", "19f0609b-5c9f-4e69-a0ae-3a5fda98f08c")
      .not("empresa_nome", "is", null);

    if (error) {
      console.error("Erro ao buscar empresas:", error);
      throw error;
    }

    console.log(`Total de registros com dados de empresa: ${data?.length}`);

    // Extrair valores únicos de empresa
    const empresasSet = new Set<string>();
    
    if (data) {
      data.forEach(item => {
        if (item.empresa_nome && item.empresa_nome.trim()) {
          empresasSet.add(item.empresa_nome.trim());
        }
      });
    }
    
    // Converter Set para array
    const uniqueEmpresas = Array.from(empresasSet);
    
    console.log(`Total de empresas únicas após processamento: ${uniqueEmpresas.length}`);
    
    // Ordenar por nome de empresa
    uniqueEmpresas.sort((a, b) => a.localeCompare(b));

    // Salvar em cache
    empresasCache = uniqueEmpresas;
    
    return empresasCache;
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    return []; // Retornar array vazio em caso de erro
  }
};

export const fetchItems = async (
  searchTerm: string,
  groupFilter: string,
  empresaFilter: string,
  page: number,
  pageSize: number
) => {
  // Get active groups to filter items
  const activeGroups = await getActiveGroupCodes();
  
  // Build our query
  let query = supabase
    .from("BLUEBAY_ITEM")
    .select("*", { count: "exact" })
    .eq("ativo", true); // Only fetch active items

  // Apply filters
  if (searchTerm) {
    query = query.or(`ITEM_CODIGO.ilike.%${searchTerm}%,DESCRICAO.ilike.%${searchTerm}%,CODIGOAUX.ilike.%${searchTerm}%`);
  }

  if (groupFilter && groupFilter !== "all") {
    query = query.eq("GRU_CODIGO", groupFilter);
  }

  if (empresaFilter && empresaFilter !== "all") {
    query = query.eq("empresa", empresaFilter);
  }

  // Calculate range based on current page and page size
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Apply pagination and ordering
  query = query.order("DESCRICAO").range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;
  
  // Filter items to only include those with active groups
  const uniqueItemsMap = new Map();
  if (data) {
    for (const item of data) {
      // Only include items whose groups are active
      if (activeGroups.includes(item.GRU_CODIGO)) {
        if (!uniqueItemsMap.has(item.ITEM_CODIGO)) {
          uniqueItemsMap.set(item.ITEM_CODIGO, item);
        }
      }
    }
  }
  
  const uniqueItems = Array.from(uniqueItemsMap.values());
  
  return { 
    items: uniqueItems, 
    count: uniqueItems.length // Adjusted count based on active groups filtering
  };
};

/**
 * Get all active group codes from bluebay_grupo_item_view
 */
const getActiveGroupCodes = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("bluebay_grupo_item_view")
      .select("gru_codigo")
      .eq("ativo", true)
      .eq("empresa_id", "19f0609b-5c9f-4e69-a0ae-3a5fda98f08c");

    if (error) {
      console.error("Error fetching active group codes:", error);
      return [];
    }

    return data.map(group => group.gru_codigo);
  } catch (error) {
    console.error("Error in getActiveGroupCodes:", error);
    return [];
  }
};

// Função para buscar todos os itens sem limitação (usando batches)
export const fetchAllItems = async (
  searchTerm?: string,
  groupFilter?: string,
  empresaFilter?: string
): Promise<any[]> => {
  try {
    console.log("Iniciando busca de todos os itens em lotes de 1000");
    
    // Get active groups to filter items
    const activeGroups = await getActiveGroupCodes();
    
    if (searchTerm) {
      // Para buscas com termo, usamos uma abordagem diferentes para garantir resultados completos
      console.log(`Buscando por texto: "${searchTerm}" em todos os itens`);
      
      // Array para guardar todas as consultas que faremos
      const searchQueries = [
        { field: "ITEM_CODIGO", term: searchTerm },
        { field: "DESCRICAO", term: searchTerm },
        { field: "CODIGOAUX", term: searchTerm }
      ];
      
      // Conjunto para controlar itens já processados e evitar duplicatas
      const processedItemCodes = new Set<string>();
      let totalItems: any[] = [];
      
      // Para cada campo de busca, executamos o carregamento em lotes
      for (const { field, term } of searchQueries) {
        console.log(`Buscando itens por ${field} contendo "${term}"`);
        
        const itemsData = await fetchInBatches<any>(
          async (offset: number, limit: number) => {
            let query = supabase
              .from("BLUEBAY_ITEM")
              .select("*", { count: "exact", head: false })
              .eq("ativo", true) // Only fetch active items
              .ilike(field, `%${term}%`)
              .order("DESCRICAO")
              .range(offset, offset + limit - 1)
              .throwOnError();
            
            if (groupFilter && groupFilter !== "all") {
              query = query.eq("GRU_CODIGO", groupFilter);
            }
            
            if (empresaFilter && empresaFilter !== "all") {
              query = query.eq("empresa", empresaFilter);
            }
            
            return await query;
          },
          1000 // Reduzir para 1000 registros por lote
        );
        
        console.log(`Encontrados ${itemsData.length} itens por ${field}`);
        
        // Adiciona os novos itens que ainda não foram processados
        let newItemsAdded = 0;
        
        for (const item of itemsData) {
          if (item && item.ITEM_CODIGO && !processedItemCodes.has(item.ITEM_CODIGO)) {
            // Only include items whose groups are active
            if (!item.GRU_CODIGO || activeGroups.includes(item.GRU_CODIGO)) {
              totalItems.push(item);
              processedItemCodes.add(item.ITEM_CODIGO);
              newItemsAdded++;
            }
          }
        }
        
        console.log(`Adicionados ${newItemsAdded} novos itens únicos por ${field} (total acumulado: ${processedItemCodes.size})`);
      }
      
      console.log(`Total final após busca por texto: ${totalItems.length} itens únicos`);
      return totalItems;
    } else {
      // Usar fetchInBatches para carregar todos os códigos de estoque
      console.log("Buscando todos os códigos de itens do estoque com LOCAL = 1");
      
      const itemCodes = await fetchInBatches<{ITEM_CODIGO: string}>(
        async (offset: number, limit: number) => {
          return await supabase
            .from("BLUEBAY_ESTOQUE")
            .select("ITEM_CODIGO", { count: "exact", head: false })
            .eq("LOCAL", 1)
            .range(offset, offset + limit - 1)
            .throwOnError();
        },
        1000 // Reduzir para 1000 registros por lote
      );
      
      console.log(`Total de ${itemCodes.length} códigos de itens encontrados no estoque`);
      
      // Extrair códigos únicos
      const uniqueItemCodesSet = new Set<string>();
      itemCodes.forEach(item => {
        if (item && item.ITEM_CODIGO) {
          uniqueItemCodesSet.add(item.ITEM_CODIGO);
        }
      });
      
      const uniqueItemCodes = Array.from(uniqueItemCodesSet);
      console.log(`Total de ${uniqueItemCodes.length} códigos únicos de itens extraídos`);
      
      // Buscar todos os itens em lotes
      let allItems: any[] = [];
      const codeBatchSize = 500; // Tamanho do lote para consultas IN
      const totalBatches = Math.ceil(uniqueItemCodes.length / codeBatchSize);
      
      console.log(`Dividindo ${uniqueItemCodes.length} códigos em ${totalBatches} lotes para busca de detalhes`);
      
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIdx = batchIndex * codeBatchSize;
        const endIdx = Math.min(startIdx + codeBatchSize, uniqueItemCodes.length);
        const codeBatch = uniqueItemCodes.slice(startIdx, endIdx);
        
        console.log(`Processando lote ${batchIndex + 1}/${totalBatches} com ${codeBatch.length} códigos`);
        
        let query = supabase
          .from("BLUEBAY_ITEM")
          .select("*", { count: "exact", head: false })
          .eq("ativo", true) // Only fetch active items
          .in("ITEM_CODIGO", codeBatch)
          .throwOnError();
        
        if (groupFilter && groupFilter !== "all") {
          query = query.eq("GRU_CODIGO", groupFilter);
        }
        
        if (empresaFilter && empresaFilter !== "all") {
          query = query.eq("empresa", empresaFilter);
        }
        
        const { data: batchItems, error: batchError, count: batchCount } = await query;
        
        if (batchError) {
          console.error(`Erro ao buscar lote ${batchIndex + 1}:`, batchError);
          continue; // Continue para o próximo lote em caso de erro
        }
        
        console.log(`Lote ${batchIndex + 1}: Encontrados ${batchItems.length} de ${batchCount} itens possíveis`);
        
        // Filter items by active groups
        const validItems = batchItems.filter(item => 
          !item.GRU_CODIGO || activeGroups.includes(item.GRU_CODIGO)
        );
        
        allItems = [...allItems, ...validItems];
        
        console.log(`Progresso: ${allItems.length}/${uniqueItemCodes.length} itens (${Math.round((allItems.length / uniqueItemCodes.length) * 100)}%)`);
      }
      
      // Verificar itens duplicados
      console.log(`Verificando duplicatas no conjunto final de ${allItems.length} itens`);
      const uniqueItemsMap = new Map<string, any>();
      let duplicateCount = 0;
      
      allItems.forEach(item => {
        if (item && item.ITEM_CODIGO) {
          if (!uniqueItemsMap.has(item.ITEM_CODIGO)) {
            uniqueItemsMap.set(item.ITEM_CODIGO, item);
          } else {
            duplicateCount++;
          }
        }
      });
      
      if (duplicateCount > 0) {
        console.log(`Removidas ${duplicateCount} duplicatas na fase final`);
      }
      
      const finalItems = Array.from(uniqueItemsMap.values());
      console.log(`Total final: ${finalItems.length} itens únicos carregados com sucesso`);
      
      return finalItems;
    }
  } catch (error) {
    console.error("Erro ao buscar todos os itens:", error);
    throw error;
  }
};

/**
 * Gets item details with matriz and filial values
 */
export const getItemWithMatrizFilial = async (itemCode: string) => {
  try {
    console.log(`Fetching item with matriz/filial for item code: ${itemCode}`);
    const { data, error } = await supabase
      .from("BLUEBAY_ITEM")
      .select("*")
      .eq("ITEM_CODIGO", itemCode)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching item ${itemCode}:`, error);
      throw error;
    }

    if (!data) {
      console.log(`Item ${itemCode} not found`);
      return null;
    }

    console.log(`Item found: ${itemCode} with MATRIZ=${data.MATRIZ}, FILIAL=${data.FILIAL}`);
    return data;
  } catch (error) {
    console.error(`Error in getItemWithMatrizFilial for ${itemCode}:`, error);
    throw error;
  }
};

/**
 * Saves or updates an item in the database
 */
export const saveItem = async (itemData: any, isUpdate: boolean = false) => {
  try {
    console.log(`${isUpdate ? 'Updating' : 'Creating'} item:`, itemData);
    
    // Clean data for saving
    const cleanedData = {
      ...itemData,
      // Add any necessary data transformations here
    };
    
    let result;
    if (isUpdate) {
      const { data, error } = await supabase
        .from("BLUEBAY_ITEM")
        .update(cleanedData)
        .eq("ITEM_CODIGO", itemData.ITEM_CODIGO)
        .select();
        
      if (error) throw error;
      result = { data, message: "Item atualizado com sucesso" };
    } else {
      const { data, error } = await supabase
        .from("BLUEBAY_ITEM")
        .insert(cleanedData)
        .select();
        
      if (error) throw error;
      result = { data, message: "Item cadastrado com sucesso" };
    }
    
    console.log(`Item ${isUpdate ? 'updated' : 'created'} successfully:`, result);
    return result;
  } catch (error) {
    console.error(`Error ${isUpdate ? 'updating' : 'creating'} item:`, error);
    throw error;
  }
};

/**
 * Marks an item as inactive (soft delete)
 */
export const deleteItem = async (itemCode: string) => {
  try {
    console.log(`Deleting item with code: ${itemCode}`);
    
    // Mark as inactive instead of actually deleting
    const { data, error } = await supabase
      .from("BLUEBAY_ITEM")
      .update({ ativo: false })
      .eq("ITEM_CODIGO", itemCode)
      .select();
      
    if (error) throw error;
    
    console.log(`Item ${itemCode} marked as inactive`);
    return { data, message: "Item excluído com sucesso" };
  } catch (error) {
    console.error(`Error deleting item ${itemCode}:`, error);
    throw error;
  }
};
