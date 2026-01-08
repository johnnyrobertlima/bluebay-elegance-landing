
import { StockItem } from "./types";

/**
 * Generates sample stock data for testing and fallback scenarios
 */
export const generateSampleStockData = (): StockItem[] => {
  console.log("Gerando dados de exemplo para visualização");
  
  const sampleData: StockItem[] = [];
  const groups = ["Camisetas", "Calças", "Acessórios", "Calçados", "Bermudas"];
  
  // Gerar 50 itens de exemplo
  for (let i = 1; i <= 50; i++) {
    const group = groups[Math.floor(Math.random() * groups.length)];
    const fisico = Math.floor(Math.random() * 100) + 1;
    const vendido = Math.floor(Math.random() * 50);
    const valorUnitario = Math.floor(Math.random() * 200) + 50;
    const valorTotal = vendido * valorUnitario;
    const custoMedio = Math.floor(Math.random() * 150) + 30; // Generate sample cost data
    const valorTeste = Math.floor(Math.random() * 180) + 40; // Generate sample teste data
    
    sampleData.push({
      ITEM_CODIGO: `ITEM${i.toString().padStart(4, '0')}`,
      DESCRICAO: `Produto de Teste ${i}`,
      GRU_DESCRICAO: group,
      DATACADASTRO: i % 10 === 0 ? new Date().toISOString() : new Date(2022, 0, 1).toISOString(),
      FISICO: fisico,
      DISPONIVEL: fisico - Math.floor(Math.random() * 10),
      RESERVADO: Math.floor(Math.random() * 10),
      ENTROU: Math.floor(Math.random() * 20),
      LIMITE: 100,
      QTD_VENDIDA: vendido,
      VALOR_TOTAL_VENDIDO: valorTotal,
      PRECO_MEDIO: vendido > 0 ? valorTotal / vendido : 0,
      CUSTO_MEDIO: custoMedio, // Add the missing CUSTO_MEDIO field
      DATA_ULTIMA_VENDA: vendido > 0 ? new Date().toISOString() : null,
      GIRO_ESTOQUE: fisico > 0 ? vendido / fisico : 0,
      PERCENTUAL_ESTOQUE_VENDIDO: (vendido + fisico) > 0 ? (vendido / (vendido + fisico)) * 100 : 0,
      DIAS_COBERTURA: vendido > 0 ? fisico / (vendido / 30) : fisico > 0 ? 999 : 0,
      PRODUTO_NOVO: i % 10 === 0,
      RANKING: vendido > 0 ? Math.floor(Math.random() * 50) + 1 : null,
      teste: valorTeste // Add the missing teste field with sample data
    });
  }
  
  // Ordenar por descrição
  return sampleData.sort((a, b) => a.DESCRICAO.localeCompare(b.DESCRICAO));
};
