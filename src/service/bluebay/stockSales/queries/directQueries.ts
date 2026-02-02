
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
  endDate: string
): Promise<StockItem[]> => {
  try {
    console.log("Buscando dados de estoque e vendas via consultas diretas");

    // Calculate the date 60 days ago for identifying new products
    const newProductDate = format(subDays(new Date(), 60), 'yyyy-MM-dd');

    // Fetch stock data
    console.log("Buscando dados de estoque...");
    const stockResult = await supabase
      .from('BLUEBAY_ESTOQUE')
      .select('*');

    if (stockResult.error) {
      throw new Error(`Erro ao buscar dados de estoque: ${stockResult.error.message}`);
    }

    const stockItems = stockResult.data || [];
    console.log(`Obtidos ${stockItems.length} registros de estoque`);

    // Fetch sales data for the specified date range from BLUEBAY_PEDIDO
    console.log(`Buscando dados de vendas para o período ${startDate} a ${endDate}...`);
    const salesResult = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('*')
      .neq('STATUS', '4') // Excluir cancelados
      .gte('DATA_PEDIDO', startDate)
      .lte('DATA_PEDIDO', endDate);

    if (salesResult.error) {
      throw new Error(`Erro ao buscar dados de vendas: ${salesResult.error.message}`);
    }

    const salesData = salesResult.data || [];
    console.log(`Obtidos ${salesData.length} registros de vendas`);

    // Collect unique item codes from stock items to fetch specific details
    const uniqueItemCodes = Array.from(new Set(
      stockItems.map(si => (si.ITEM_CODIGO || si.item_codigo)?.toString().trim())
    )).filter(Boolean);

    // Fetch item details (Description, Group, etc) from BLUEBAY_ITEM for these specific codes
    console.log(`Buscando detalhes para ${uniqueItemCodes.length} itens específicos em BLUEBAY_ITEM...`);

    // Split into chunks if there are many codes (Postgres IN clause limit)
    let itemsDetails: any[] = [];
    const chunkSize = 500;
    for (let i = 0; i < uniqueItemCodes.length; i += chunkSize) {
      const chunk = uniqueItemCodes.slice(i, i + chunkSize);
      const { data, error } = await supabase
        .from('BLUEBAY_ITEM')
        .select('ITEM_CODIGO, DESCRICAO, GRU_CODIGO, GRU_DESCRICAO, DATACADASTRO')
        .in('ITEM_CODIGO', chunk);

      if (error) {
        console.warn("Aviso: Erro ao buscar detalhes de BLUEBAY_ITEM chunk.", error);
      } else if (data) {
        itemsDetails = [...itemsDetails, ...data];
      }
    }

    console.log(`Obtidos ${itemsDetails.length} detalhes de itens`);

    // Fetch cost data from the view
    console.log("Buscando dados de custo médio...");
    const costData = await fetchCostDataFromView();
    console.log(`Obtidos ${costData.length} registros de custo médio`);

    // Process the data
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
