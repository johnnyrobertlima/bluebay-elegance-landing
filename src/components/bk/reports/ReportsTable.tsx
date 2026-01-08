// Stub component for Reports Table
import React from "react";

interface ReportsTableProps {
  data?: any[];
  items?: any[];
  isLoading?: boolean;
  onItemClick?: (itemCode: string) => void;
  selectedItemDetails?: any[];
  isLoadingDetails?: boolean;
}

export const ReportsTable: React.FC<ReportsTableProps> = ({ 
  data = [], 
  items = [],
  isLoading = false,
  onItemClick,
  selectedItemDetails,
  isLoadingDetails 
}) => {
  const displayData = items.length > 0 ? items : data;

  if (isLoading) {
    return <div className="p-4">Carregando...</div>;
  }

  if (!displayData || displayData.length === 0) {
    return <div className="p-4 text-muted-foreground">Nenhum dado disponível.</div>;
  }

  return (
    <div className="p-4">
      <p>Tabela de relatórios - {displayData.length} registros</p>
    </div>
  );
};

export default ReportsTable;
