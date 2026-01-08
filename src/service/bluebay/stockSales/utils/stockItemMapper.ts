
/**
 * Utility functions to map stock data to StockItem objects
 */

import { StockItem } from "../types";
import { logItemDiagnostics } from "./debugLogger";
import { CostDataRecord } from "./costData/costDataTypes";
import { getItemCost } from "./costDataProcessor";

/**
 * Creates a map of item details by item code
 */
export const createItemDetailsMap = (stockItems: any[]) => {
  return stockItems.reduce((map, item) => {
    const itemCode = item["ITEM_CODIGO"];
    if (!map.has(itemCode)) {
      map.set(itemCode, {
        DESCRICAO: item["DESCRICAO"] || "",
        GRU_DESCRICAO: item["GRU_DESCRICAO"] || "",
        DATACADASTRO: item["DATACADASTRO"] || null
      });
    }
    return map;
  }, new Map());
};

/**
 * Maps stock item data to final StockItem objects
 */
export const mapStockItems = (
  stockItems: any[], 
  salesByItem: Record<string, any>, 
  costRecords: CostDataRecord[], 
  itemDetailsMap: Map<string, any>,
  daysDiff: number,
  newProductDate: string,
  processedItemCodes: Set<string>
) => {
  return stockItems.reduce((acc, item) => {
    const itemCode = item["ITEM_CODIGO"];
    
    // Skip duplicate items
    if (processedItemCodes.has(itemCode)) {
      return acc;
    }
    
    processedItemCodes.add(itemCode);
    
    const fisico = Number(item["FISICO"]) || 0;
    const salesInfo = salesByItem[itemCode] || {
      QTD_VENDIDA: 0,
      VALOR_TOTAL_VENDIDO: 0,
      DATA_ULTIMA_VENDA: null,
      quantidades: [],
      valores: []
    };
    
    // Get cost data from the processed records
    const costInfo = getItemCost(itemCode, costRecords);
    
    // If we found cost data for this item, log it for debugging
    const isTargetItem = itemCode === 'MS-101/PB';
    
    if (isTargetItem) {
      if (costInfo) {
        logItemDiagnostics('MS-101/PB', `Dados de custo encontrados: CUSTO_MEDIO=${costInfo.CUSTO_MEDIO}, ENTROU=${costInfo.ENTROU}, teste=${costInfo.teste}`);
      } else {
        logItemDiagnostics('MS-101/PB', `Não foram encontrados dados de custo`);
      }
    }
    
    // Create default values if cost info is missing
    const costInfoToUse = costInfo || { 
      ITEM_CODIGO: itemCode,
      CUSTO_MEDIO: 0, 
      CUSTO_ATUAL: 0,
      CUSTO_REPOSICAO: 0,
      CUSTO_ULTIMA_ENTRADA: 0,
      ENTROU: 0, 
      teste: 0 
    };
    
    const qtdVendida = salesInfo.QTD_VENDIDA;
    const mediaVendasDiaria = qtdVendida / daysDiff;
    
    // Calcular preço médio ponderado
    let precoMedio = 0;
    if (qtdVendida > 0 && salesInfo.VALOR_TOTAL_VENDIDO > 0) {
      precoMedio = salesInfo.VALOR_TOTAL_VENDIDO / qtdVendida;
    }
    
    // Calculate indicators
    const giroEstoque = fisico > 0 ? qtdVendida / fisico : 0;
    const percentualEstoqueVendido = (qtdVendida + fisico) > 0 
      ? (qtdVendida / (qtdVendida + fisico)) * 100 
      : 0;
    const diasCobertura = mediaVendasDiaria > 0 
      ? fisico / mediaVendasDiaria 
      : fisico > 0 ? 999 : 0; // 999 days if there are no sales but stock exists, 0 if no stock
    
    // Get item details (description, group, cadastro date)
    const itemDetail = itemDetailsMap.get(itemCode) || {};
    const dataCadastro = itemDetail["DATACADASTRO"] || item["DATACADASTRO"];
    const produtoNovo = dataCadastro && new Date(dataCadastro) > new Date(newProductDate);
    
    const resultItem = {
      ITEM_CODIGO: itemCode,
      DESCRICAO: itemDetail["DESCRICAO"] || item["DESCRICAO"] || '',
      GRU_DESCRICAO: itemDetail["GRU_DESCRICAO"] || item["GRU_DESCRICAO"] || '',
      DATACADASTRO: dataCadastro,
      FISICO: fisico,
      DISPONIVEL: Number(item["DISPONIVEL"]) || 0,
      RESERVADO: Number(item["RESERVADO"]) || 0,
      ENTROU: costInfoToUse.ENTROU,
      LIMITE: Number(item["LIMITE"]) || 0,
      QTD_VENDIDA: qtdVendida,
      VALOR_TOTAL_VENDIDO: salesInfo.VALOR_TOTAL_VENDIDO,
      PRECO_MEDIO: precoMedio,
      CUSTO_MEDIO: costInfoToUse.CUSTO_MEDIO,
      DATA_ULTIMA_VENDA: salesInfo.DATA_ULTIMA_VENDA,
      GIRO_ESTOQUE: giroEstoque,
      PERCENTUAL_ESTOQUE_VENDIDO: percentualEstoqueVendido,
      DIAS_COBERTURA: diasCobertura,
      PRODUTO_NOVO: !!produtoNovo,
      RANKING: null, // Will be assigned later
      teste: costInfoToUse.teste // Nova coluna para valor de teste
    };
    
    if (isTargetItem) {
      logItemDiagnostics('MS-101/PB', "RESULTADO FINAL:", resultItem);
    }
    
    acc.push(resultItem);
    
    return acc;
  }, [] as StockItem[]);
};
