
/**
 * Utility functions to process sales data for stock analytics
 */

/**
 * Groups sales data by item code and calculates aggregate measures
 */
export const groupSalesByItem = (salesData: any[]) => {
  return salesData.reduce((acc, sale) => {
    const itemCode = sale["ITEM_CODIGO"];
    if (!itemCode) return acc;
    
    if (!acc[itemCode]) {
      acc[itemCode] = {
        QTD_VENDIDA: 0,
        VALOR_TOTAL_VENDIDO: 0,
        DATA_ULTIMA_VENDA: null,
        salesDates: [],
        // Arrays para armazenar quantidades e valores para cálculo da média ponderada
        quantidades: [],
        valores: []
      };
    }
    
    // Add sales quantity and value
    const quantidade = Number(sale["QUANTIDADE"]) || 0;
    const valorUnitario = Number(sale["VALOR_UNITARIO"]) || 0;
    
    acc[itemCode].QTD_VENDIDA += quantidade;
    acc[itemCode].VALOR_TOTAL_VENDIDO += quantidade * valorUnitario;
    
    // Armazena os valores para cálculo da média ponderada
    if (quantidade > 0 && valorUnitario > 0) {
      acc[itemCode].quantidades.push(quantidade);
      acc[itemCode].valores.push(valorUnitario);
    }
    
    // Track sales date for calculating the last sale date
    if (sale["DATA_EMISSAO"]) {
      const saleDate = new Date(sale["DATA_EMISSAO"]);
      acc[itemCode].salesDates.push(saleDate);
      
      // Update last sale date if this sale is more recent
      if (!acc[itemCode].DATA_ULTIMA_VENDA || saleDate > new Date(acc[itemCode].DATA_ULTIMA_VENDA)) {
        acc[itemCode].DATA_ULTIMA_VENDA = sale["DATA_EMISSAO"];
      }
    }
    
    return acc;
  }, {});
};
