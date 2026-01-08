
import { useCallback, useMemo } from "react";
import { FaturamentoItem, PedidoItem } from "@/services/bluebay/dashboardComercialTypes";

interface FilteredData {
  filteredFaturamentoItems: FaturamentoItem[];
  filteredPedidoItems: PedidoItem[];
  calculatedTotals: {
    totalFaturado: number;
    totalItens: number;
    mediaValorItem: number;
  };
  naoIdentificados: FaturamentoItem[];
  hasFilteredData: boolean;
}

export const useDataFiltering = (
  dashboardData: { 
    faturamentoItems: FaturamentoItem[]; 
    pedidoItems: PedidoItem[];
  } | null,
  selectedCentroCusto: string | null,
  isLoading: boolean
): FilteredData => {
  
  // Função para filtrar por Centro de Custo
  const filterByCentroCusto = useCallback((item: any) => {
    if (!selectedCentroCusto) return true;
    
    // Caso especial para "Não identificado" - só precisa verificar no frontend
    // já que no backend já fizemos a filtragem apropriada
    if (selectedCentroCusto === "Não identificado") return true;
    
    // Check multiple possible field names for centro de custo
    // Including data from related tables that might be nested
    return (
      (item.CENTROCUSTO && item.CENTROCUSTO === selectedCentroCusto) || 
      (item.CENTRO_CUSTO && item.CENTRO_CUSTO === selectedCentroCusto) ||
      (item.pedido?.CENTROCUSTO && item.pedido?.CENTROCUSTO === selectedCentroCusto)
    );
  }, [selectedCentroCusto]);
  
  // Uso de useMemo para evitar recálculos desnecessários
  const filteredData = useMemo(() => {
    if (!dashboardData || isLoading) {
      return {
        filteredFaturamentoItems: [],
        filteredPedidoItems: [],
        calculatedTotals: {
          totalFaturado: 0,
          totalItens: 0,
          mediaValorItem: 0
        },
        naoIdentificados: [],
        hasFilteredData: false
      };
    }

    // Filtrar itens de faturamento conforme seleção de Centro de Custo
    const filteredFaturamentoItems = dashboardData.faturamentoItems.filter(filterByCentroCusto);
    
    // Filtrar itens de pedido conforme seleção de Centro de Custo
    const filteredPedidoItems = dashboardData.pedidoItems.filter(filterByCentroCusto);
    
    // Identificar itens sem Centro de Custo definido
    let naoIdentificados: FaturamentoItem[] = [];
    if (!selectedCentroCusto) {
      naoIdentificados = dashboardData.faturamentoItems.filter(item => 
        !item.CENTROCUSTO && 
        !item.CENTRO_CUSTO && 
        !(item.pedido?.CENTROCUSTO)
      );
    }
    
    // Calcular totais baseados nos itens filtrados
    const totalFaturado = filteredFaturamentoItems.reduce((acc, item) => {
      // Garantir que estamos usando valores numéricos
      const quantidade = Number(item.QUANTIDADE) || 0;
      const valorUnitario = Number(item.VALOR_UNITARIO) || 0;
      return acc + (quantidade * valorUnitario);
    }, 0);
    
    const totalItens = filteredFaturamentoItems.reduce((acc, item) => {
      return acc + (Number(item.QUANTIDADE) || 0);
    }, 0);
    
    const mediaValorItem = totalItens > 0 ? totalFaturado / totalItens : 0;
    
    // Verificar se há dados após a filtragem
    const hasFilteredData = filteredFaturamentoItems.length > 0 || filteredPedidoItems.length > 0;
    
    return {
      filteredFaturamentoItems,
      filteredPedidoItems,
      calculatedTotals: {
        totalFaturado,
        totalItens,
        mediaValorItem
      },
      naoIdentificados,
      hasFilteredData
    };
  }, [dashboardData, selectedCentroCusto, isLoading, filterByCentroCusto]);

  return filteredData;
};
