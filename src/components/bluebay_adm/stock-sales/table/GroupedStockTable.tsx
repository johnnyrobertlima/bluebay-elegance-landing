
import React, { useState, useEffect } from "react";
import { StockItem } from "@/services/bluebay/stockSales/types";
import { TableLoadingState } from "./TableLoadingState";
import { TableEmptyState } from "./TableEmptyState";
import { useStockGrouping } from "@/hooks/bluebay_adm/stock-sales/useStockGrouping";
import { GroupedTableActions } from "./GroupedTableActions";
import { GroupedTableContent } from "./GroupedTableContent";
import { ColumnManager } from "./ColumnManager";

interface GroupedStockTableProps {
  items: StockItem[];
  isLoading: boolean;
  sortConfig: {
    key: keyof StockItem;
    direction: 'asc' | 'desc';
  };
  onSort: (key: keyof StockItem) => void;
}

// Column definitions for our table
const COLUMN_OPTIONS = [
  { id: "FISICO", label: "Estoque Físico" },
  { id: "DISPONIVEL", label: "Disponível" },
  { id: "RESERVADO", label: "Reservado" },
  { id: "ENTROU", label: "Entrou" },
  { id: "QTD_VENDIDA", label: "Qtd. Vendida" },
  { id: "VALOR_TOTAL_VENDIDO", label: "Valor Vendido" },
  { id: "PRECO_MEDIO", label: "Preço Médio" },
  { id: "CUSTO_MEDIO", label: "Custo Médio" }, // Nova coluna de custo médio
  { id: "teste", label: "Teste (media_valor)" }, // Nova coluna de teste
  { id: "GIRO_ESTOQUE", label: "Giro Estoque" },
  { id: "PERCENTUAL_ESTOQUE_VENDIDO", label: "% Vendido" },
  { id: "DIAS_COBERTURA", label: "Dias Cobertura" },
  { id: "DATA_ULTIMA_VENDA", label: "Última Venda" },
  { id: "RANKING", label: "Ranking" },
];

export const GroupedStockTable: React.FC<GroupedStockTableProps> = ({
  items,
  isLoading,
  sortConfig,
  onSort,
}) => {
  const {
    groupedData,
    toggleGroup,
    expandAllGroups,
    collapseAllGroups
  } = useStockGrouping(items);

  // State for visible columns
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    FISICO: true,
    DISPONIVEL: true,
    RESERVADO: true,
    ENTROU: true,
    QTD_VENDIDA: true,
    VALOR_TOTAL_VENDIDO: true,
    PRECO_MEDIO: true,
    CUSTO_MEDIO: true,
    teste: true, // Nova coluna de teste
    GIRO_ESTOQUE: true,
    PERCENTUAL_ESTOQUE_VENDIDO: true,
    DIAS_COBERTURA: true,
    DATA_ULTIMA_VENDA: true,
    RANKING: true,
  });

  // Handle column visibility toggle
  const handleColumnToggle = (columnId: string, isVisible: boolean) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnId]: isVisible
    }));
  };

  if (isLoading) {
    return <TableLoadingState />;
  }

  if (items.length === 0) {
    return <TableEmptyState />;
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <GroupedTableActions 
          groupCount={groupedData.length}
          totalItems={items.length}
          expandAllGroups={expandAllGroups}
          collapseAllGroups={collapseAllGroups}
        />
        
        <ColumnManager 
          columns={COLUMN_OPTIONS}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
        />
      </div>
      
      <GroupedTableContent 
        groupedData={groupedData}
        toggleGroup={toggleGroup}
        sortConfig={sortConfig}
        onSort={onSort}
        visibleColumns={visibleColumns}
      />
    </div>
  );
};
