// Stub hook for Analise de Compra data
import { useState, useEffect } from "react";

interface AnaliseItem {
  ITEM_CODIGO: string;
  DESCRICAO: string;
  GRU_DESCRICAO: string;
  FISICO: number;
  DISPONIVEL: number;
}

interface GroupedItem {
  grupo: string;
  items: AnaliseItem[];
}

export const useAnaliseDeCompraData = () => {
  const [data, setData] = useState<AnaliseItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<AnaliseItem[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedItem[]>([]);
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
    }, {} as Record<string, AnaliseItem[]>);

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
