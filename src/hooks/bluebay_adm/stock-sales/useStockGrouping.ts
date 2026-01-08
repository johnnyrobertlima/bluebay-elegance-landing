
import { useState, useMemo } from "react";
import { StockItem } from "@/services/bluebay/stockSales/types";

export interface GroupedStockData {
  groupName: string;
  items: StockItem[];
  totalItems: number;
  totalFisico: number;
  totalDisponivel: number;
  totalReservado: number;
  totalEntrou: number;
  totalVendido: number;
  totalValorVendido: number;
  giroEstoqueGrupo: number;
  percentualVendidoGrupo: number;
  diasCoberturaGrupo: number;
  isExpanded: boolean;
}

export const useStockGrouping = (items: StockItem[]) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  // Group items by GRU_DESCRICAO
  const groupedData = useMemo(() => {
    const groups: Record<string, StockItem[]> = {};
    
    // Group items by GRU_DESCRICAO
    items.forEach(item => {
      const groupName = item.GRU_DESCRICAO || 'Sem Grupo';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(item);
    });
    
    // Create formatted grouped data with calculations
    return Object.entries(groups).map(([groupName, groupItems]) => {
      // Calculate group totals
      const totalFisico = groupItems.reduce((sum, item) => sum + (item.FISICO || 0), 0);
      const totalDisponivel = groupItems.reduce((sum, item) => sum + (item.DISPONIVEL || 0), 0);
      const totalReservado = groupItems.reduce((sum, item) => sum + (item.RESERVADO || 0), 0);
      const totalEntrou = groupItems.reduce((sum, item) => sum + (item.ENTROU || 0), 0);
      const totalVendido = groupItems.reduce((sum, item) => sum + (item.QTD_VENDIDA || 0), 0);
      const totalValorVendido = groupItems.reduce((sum, item) => sum + (item.VALOR_TOTAL_VENDIDO || 0), 0);
      
      // Calculate derived metrics for the group
      const giroEstoqueGrupo = totalFisico > 0 ? totalVendido / totalFisico : 0;
      const percentualVendidoGrupo = (totalFisico + totalVendido) > 0 
        ? (totalVendido / (totalFisico + totalVendido)) * 100 
        : 0;
      const diasCoberturaGrupo = totalVendido > 0 
        ? (totalFisico / (totalVendido / 30)) 
        : (totalFisico > 0 ? 999 : 0);
      
      return {
        groupName,
        items: groupItems,
        totalItems: groupItems.length,
        totalFisico,
        totalDisponivel,
        totalReservado,
        totalEntrou,
        totalVendido,
        totalValorVendido,
        giroEstoqueGrupo,
        percentualVendidoGrupo,
        diasCoberturaGrupo,
        isExpanded: !!expandedGroups[groupName]
      };
    }).sort((a, b) => a.groupName.localeCompare(b.groupName));
  }, [items, expandedGroups]);
  
  // Toggle a group's expanded state
  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };
  
  // Expand all groups
  const expandAllGroups = () => {
    const newExpandedGroups: Record<string, boolean> = {};
    groupedData.forEach(group => {
      newExpandedGroups[group.groupName] = true;
    });
    setExpandedGroups(newExpandedGroups);
  };
  
  // Collapse all groups
  const collapseAllGroups = () => {
    setExpandedGroups({});
  };
  
  return {
    groupedData,
    toggleGroup,
    expandAllGroups,
    collapseAllGroups
  };
};
