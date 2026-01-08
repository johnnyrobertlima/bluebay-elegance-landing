// Hook for Analise de Compra data
import { useState, useEffect } from "react";
import { GroupedEstoque, EstoqueItem } from "@/types/bk/estoque";

export const useAnaliseDeCompraData = () => {
  const [data, setData] = useState<EstoqueItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<EstoqueItem[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedEstoque[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      setData([]);
      setFilteredItems([]);
      setGroupedItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredItems(data);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredItems(data.filter(item => 
        item.ITEM_CODIGO?.toLowerCase().includes(term) ||
        item.DESCRICAO?.toLowerCase().includes(term) ||
        item.GRU_DESCRICAO?.toLowerCase().includes(term)
      ));
    }
  }, [data, searchTerm]);

  useEffect(() => {
    const groups = filteredItems.reduce((acc, item) => {
      const groupName = item.GRU_DESCRICAO || "Sem Grupo";
      if (!acc[groupName]) {
        acc[groupName] = {
          groupName,
          groupCode: item.GRU_CODIGO,
          items: [],
          totalItems: 0,
          totalFisico: 0,
          totalDisponivel: 0,
          totalReservado: 0
        };
      }
      acc[groupName].items.push(item);
      acc[groupName].totalItems += 1;
      acc[groupName].totalFisico += item.FISICO || 0;
      acc[groupName].totalDisponivel += item.DISPONIVEL || 0;
      acc[groupName].totalReservado += item.RESERVADO || 0;
      return acc;
    }, {} as Record<string, GroupedEstoque>);

    setGroupedItems(Object.values(groups));
  }, [filteredItems]);

  return {
    data,
    filteredItems,
    groupedItems,
    isLoading,
    searchTerm,
    setSearchTerm,
    refreshData: loadData
  };
};
