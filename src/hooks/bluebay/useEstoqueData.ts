// Stub hook for Estoque data
import { useState, useEffect } from "react";

interface EstoqueItem {
  ITEM_CODIGO: string;
  DESCRICAO: string;
  GRU_DESCRICAO: string;
  FISICO: number;
  DISPONIVEL: number;
  LOCAL: number;
}

interface GroupedEstoqueItem {
  grupo: string;
  items: EstoqueItem[];
}

export const useEstoqueData = () => {
  const [data, setData] = useState<EstoqueItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<EstoqueItem[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedEstoqueItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual data fetching
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
      const grupo = item.GRU_DESCRICAO || "Sem Grupo";
      if (!acc[grupo]) {
        acc[grupo] = [];
      }
      acc[grupo].push(item);
      return acc;
    }, {} as Record<string, EstoqueItem[]>);

    setGroupedItems(Object.entries(groups).map(([grupo, items]) => ({ grupo, items })));
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
