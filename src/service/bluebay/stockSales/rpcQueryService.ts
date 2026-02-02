
import { supabase } from "@/integrations/supabase/client";
import { StockItem } from "./types";
import { format, subDays } from "date-fns";
import { fallbackToDirectQueries } from "./directQueriesService";
import { handleApiError, logDataValidationError } from "./errorHandlingService";

/**
 * Fetches stock sales analytics data using the RPC function
 * with pagination to retrieve all records
 */
export const fetchStockSalesViaRpc = async (
  startDate: string,
  endDate: string,
  searchTerms?: string[],
  groupFilter?: string,
  companyFilter?: string,
  minYear?: number,
  showZeroStock: boolean = true,
  showLowStock: boolean = false,
  showNewProducts: boolean = false
): Promise<StockItem[]> => {
  try {
    console.log("Buscando dados via RPC para análise:", {
      startDate,
      endDate,
      searchTerms,
      groupFilter,
      companyFilter,
      minYear,
      showZeroStock,
      showLowStock,
      showNewProducts
    });

    // Calculate the date 60 days ago for identifying new products
    const sixtyDaysAgo = calculateNewProductCutoffDate();

    // Execute RPC query once with a large page size (2000) for better performance
    // This avoids the multiple requests loop that causes timeouts
    const pageSize = 2000;
    const result = await executeRpcQuery(
      startDate,
      endDate,
      sixtyDaysAgo,
      0, // Always offset 0 for main fetch
      pageSize,
      searchTerms,
      groupFilter,
      companyFilter,
      minYear,
      showZeroStock,
      showLowStock,
      showNewProducts
    );

    if (result.error) {
      console.error(`Erro na consulta RPC:`, result.error);
      throw new Error(`RPC Error: ${result.error.message}`);
    }

    const allData = result.data || [];
    console.log(`Recebidos ${allData.length} registros via RPC`);

    return processRpcResult(allData);
  } catch (error) {
    handleApiError("Erro ao carregar dados via RPC", error);
    return fallbackToDirectQueries(startDate, endDate);
  }
};

/**
 * Calculates the cutoff date for identifying new products
 */
const calculateNewProductCutoffDate = (): string => {
  return format(subDays(new Date(), 60), 'yyyy-MM-dd');
};

/**
 * Executes the RPC query with pagination parameters
 */
const executeRpcQuery = async (
  startDate: string,
  endDate: string,
  newProductDate: string,
  offset: number = 0,
  limit: number = 1000,
  searchTerms?: string[],
  groupFilter?: string,
  companyFilter?: string,
  minYear?: number,
  showZeroStock: boolean = true,
  showLowStock: boolean = false,
  showNewProducts: boolean = false
) => {
  // As seen in the types diff, the RPC function can be called with two different parameter sets
  // Use a type cast to inform TypeScript that we're using the paginated version
  const params: any = {
    p_start_date: startDate,
    p_end_date: endDate,
    p_new_product_date: newProductDate,
    p_limit: limit,
    p_offset: offset,
    p_search_terms: searchTerms || null,
    p_group_filter: groupFilter === 'all' ? null : groupFilter,
    p_company_filter: companyFilter === 'all' ? null : companyFilter,
    p_min_year: minYear || null,
    p_show_zero_stock: showZeroStock,
    p_show_low_stock: showLowStock,
    p_show_new_products: showNewProducts
  };

  return await (supabase as any)
    .rpc('get_stock_sales_analytics', params, {
      head: false,
      count: 'exact'
    });
};

/**
 * Processes and validates the RPC query result
 */
const processRpcResult = (data: any): StockItem[] => {
  if (!data || !Array.isArray(data)) {
    logDataValidationError(data, "Dados retornados não são um array");
    throw new Error("Dados retornados não são um array");
  }

  if (data.length === 0) {
    console.info("Nenhum dado de análise de estoque e vendas encontrado para o período");
    return [];
  }

  console.info(`Processando ${data.length} registros de análise de estoque e vendas`);

  // Transform the data from lowercase properties to uppercase to match our StockItem type
  return transformDataToStockItems(data);
};

/**
 * Transforms raw data into StockItem objects
 */
const transformDataToStockItems = (data: any[]): StockItem[] => {
  // We're no longer skipping items with the same ITEM_CODIGO
  // Just transform each item directly without filtering duplicates
  return data.map(item => {
    // Determine the keys based on what's available (Postgres usually lowercases unless quoted)
    const itemCode = item.item_codigo || item.ITEM_CODIGO;
    const qtdVendida = Number(item.qtd_vendida || item.QTD_VENDIDA) || 0;
    const valorTotalVendido = Number(item.valor_total_vendido || item.VALOR_TOTAL_VENDIDO) || 0;

    return {
      ITEM_CODIGO: itemCode,
      DESCRICAO: item.descricao || item.DESCRICAO || '',
      GRU_DESCRICAO: item.gru_descricao || item.GRU_DESCRICAO || item.gru_codigo || item.GRU_CODIGO || '',
      EMPRESA_NOME: item.empresa_nome || item.EMPRESA_NOME || '',
      DATACADASTRO: item.datacadastro || item.DATACADASTRO || null,
      FISICO: Number(item.fisico || item.FISICO) || 0,
      DISPONIVEL: Number(item.disponivel || item.DISPONIVEL) || 0,
      RESERVADO: Number(item.reservado || item.RESERVADO) || 0,
      ENTROU: Number(item.entrou || item.ENTROU) || 0,
      LIMITE: Number(item.limite || item.LIMITE) || 0,
      QTD_VENDIDA: qtdVendida,
      VALOR_TOTAL_VENDIDO: valorTotalVendido,
      PRECO_MEDIO: valorTotalVendido > 0 && qtdVendida > 0 ? valorTotalVendido / qtdVendida : 0,
      CUSTO_MEDIO: Number(item.custo_medio || item.CUSTO_MEDIO) || 0,
      DATA_ULTIMA_VENDA: item.data_ultima_venda || item.DATA_ULTIMA_VENDA || null,
      GIRO_ESTOQUE: Number(item.giro_estoque || item.GIRO_ESTOQUE) || 0,
      PERCENTUAL_ESTOQUE_VENDIDO: Number(item.percentual_estoque_vendido || item.PERCENTUAL_ESTOQUE_VENDIDO) || 0,
      DIAS_COBERTURA: Number(item.dias_cobertura || item.DIAS_COBERTURA) || 0,
      PRODUTO_NOVO: !!(item.produto_novo || item.PRODUTO_NOVO),
      RANKING: item.ranking || item.RANKING,
      teste: Number(item.teste || item.TESTE) || 0
    };
  });
};
