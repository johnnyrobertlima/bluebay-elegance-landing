
import { supabase } from "@/integrations/supabase/client";
import { StockItem } from "../types";
import { handleApiError } from "../errorHandlingService";
import { processStockAndSalesData } from "../processors/stockSalesProcessor";
import { format, subDays } from "date-fns";
import { fetchCostDataFromView } from "../utils/costData";

/**
 * Fetches stock and sales data directly from tables
 * This is a fallback method when RPC fails
 */
export const fetchStockSalesWithDirectQueries = async (
  startDate: string,
  endDate: string,
  searchTerms?: string[],
  groupFilter?: string,
  companyFilter?: string
): Promise<StockItem[]> => {
  try {
    console.log("Buscando dados de estoque e vendas via consultas diretas", { searchTerms, groupFilter, companyFilter });

    // Calculate the date 60 days ago for identifying new products
    const newProductDate = format(subDays(new Date(), 60), 'yyyy-MM-dd');

    let targetItemCodes: string[] = [];
    let hasItemFilter = false;

    // 1. If we have search terms or filters, we must first find the matching ITEM_CODIGOs from BLUEBAY_ITEM
    if ((searchTerms && searchTerms.length > 0) || (groupFilter && groupFilter !== 'all') || (companyFilter && companyFilter !== 'all')) {
      hasItemFilter = true;
      console.log("Aplicando filtros de busca/grupo/empresa...");

      let itemQuery = supabase
        .from('BLUEBAY_ITEM')
        .select('ITEM_CODIGO');

      if (searchTerms && searchTerms.length > 0) {
        // For multiple search terms, we usually want OR logic broadly, or AND logic?
        // Typically search bar is one string split by space. Let's assume OR for flexibility or just use the first term if it's the main one.
        // Implementing simple ILIKE for the joined term or first term.
        // If we have an array, let's try to match ANY of them or the whole string.
        // Simplest effective approach: Match ANY of the terms against code OR description.

        // Construct an OR filter for each term
        const orConditions = searchTerms.map(term =>
          `ITEM_CODIGO.ilike.%${term}%,DESCRICAO.ilike.%${term}%`
        ).join(',');

        itemQuery = itemQuery.or(orConditions);
      }

      if (groupFilter && groupFilter !== 'all') {
        itemQuery = itemQuery.eq('GRU_CODIGO', groupFilter);
      }

      if (companyFilter && companyFilter !== 'all') {
        // Assuming 'empresa' column or using a join. BLUEBAY_ITEM has 'empresa' (text) or ID?
        // Checking schema, BLUEBAY_ITEM has 'empresa' column (string).
        // But companyFilter might be an ID. If it's a name, use eq.
        // Let's assume it matches the column content.
        itemQuery = itemQuery.eq('empresa', companyFilter);
      }

      // Limit to prevent massive intermediate lists
      itemQuery = itemQuery.limit(1000); // 1000 items max for search fallback

      const { data: foundItems, error: itemError } = await itemQuery;

      if (itemError) {
        throw new Error(`Erro ao buscar itens filtrados: ${itemError.message}`);
      }

      if (!foundItems || foundItems.length === 0) {
        console.log("Nenhum item encontrado com os filtros fornecidos.");
        return [];
      }

      targetItemCodes = foundItems.map(i => i.ITEM_CODIGO).filter(Boolean);
      console.log(`Encontrados ${targetItemCodes.length} itens correspondentes aos filtros.`);
    }

    // 2. Fetch stock data
    console.log("Buscando dados de estoque...");
    let stockQuery = supabase
      .from('BLUEBAY_ESTOQUE')
      .select('*');

    if (hasItemFilter) {
      if (targetItemCodes.length > 0) {
        stockQuery = stockQuery.in('ITEM_CODIGO', targetItemCodes);
      } else {
        // Filter active but no items found -> return empty
        return [];
      }
    } else {
      // No filter, default limit
      stockQuery = stockQuery.limit(1000);
    }

    const stockResult = await stockQuery;

    if (stockResult.error) {
      throw new Error(`Erro ao buscar dados de estoque: ${stockResult.error.message}`);
    }

    const stockItems = stockResult.data || [];
    console.log(`Obtidos ${stockItems.length} registros de estoque`);

    if (stockItems.length === 0) {
      return [];
    }

    // Update target codes to only those actually in stock (optimization)
    const stockItemCodes = Array.from(new Set(stockItems.map(si => si.ITEM_CODIGO)));

    // 3. Fetch sales data for the specified date range from BLUEBAY_PEDIDO
    console.log(`Buscando dados de vendas para o período ${startDate} a ${endDate}...`);
    let salesQuery = supabase
      .from('BLUEBAY_PEDIDO')
      .select('*')
      .neq('STATUS', '4') // Excluir cancelados
      .gte('DATA_PEDIDO', startDate)
      .lte('DATA_PEDIDO', endDate);

    if (hasItemFilter || stockItemCodes.length > 0) {
      // Filter sales by the items we have stock for (or filtered items)
      // Using stockItemCodes ensures we only get sales for items we are displaying
      salesQuery = salesQuery.in('ITEM_CODIGO', stockItemCodes);
    }

    const salesResult = await salesQuery;

    if (salesResult.error) {
      throw new Error(`Erro ao buscar dados de vendas: ${salesResult.error.message}`);
    }

    const salesData = salesResult.data || [];
    console.log(`Obtidos ${salesData.length} registros de vendas`);

    // 4. Collect unique item codes for details fetching
    // Use the codes we already found or from stock
    // Reuse uniqueItemCodes logic but prioritized
    const uniqueItemCodes = Array.from(new Set([
      ...stockItems.map(si => (si.ITEM_CODIGO || si.item_codigo)?.toString().trim()),
      ...salesData.map(s => (s.ITEM_CODIGO || s.item_codigo)?.toString().trim())
    ])).filter(Boolean);

    // 5. Fetch item details (Description, Group, etc) from BLUEBAY_ITEM
    console.log(`Buscando detalhes para ${uniqueItemCodes.length} itens específicos em BLUEBAY_ITEM...`);

    let itemsDetails: any[] = [];
    const chunkSize = 500;
    for (let i = 0; i < uniqueItemCodes.length; i += chunkSize) {
      const chunk = uniqueItemCodes.slice(i, i + chunkSize);
      const { data, error } = await supabase
        .from('BLUEBAY_ITEM')
        .select('ITEM_CODIGO, DESCRICAO, GRU_CODIGO, GRU_DESCRICAO, DATACADASTRO, empresa')
        .in('ITEM_CODIGO', chunk);

      if (error) {
        console.warn("Aviso: Erro ao buscar detalhes de BLUEBAY_ITEM chunk.", error);
      } else if (data) {
        itemsDetails = [...itemsDetails, ...data];
      }
    }

    console.log(`Obtidos ${itemsDetails.length} detalhes de itens`);

    // 6. Fetch cost data from the view
    console.log("Buscando dados de custo médio...");
    // We can optimize this to filter by item codes too if the view supports it, 
    // but fetchCostDataFromView likely takes options. checking usage...
    const costData = await fetchCostDataFromView({ filter: uniqueItemCodes.length > 0 ? { itemCodes: uniqueItemCodes } : undefined });
    console.log(`Obtidos ${costData.length} registros de custo médio`);

    // 7. Process the data
    console.log("Processando dados de estoque e vendas...");
    const processedData = processStockAndSalesData(
      stockItems,
      salesData,
      costData,
      itemsDetails, // Pass item details to the processor
      newProductDate,
      startDate,
      endDate
    );

    console.log(`Processamento concluído. ${processedData.length} itens processados.`);
    return processedData;
  } catch (error) {
    handleApiError("Erro ao buscar dados via consultas diretas", error);
    throw error;
  }
};
