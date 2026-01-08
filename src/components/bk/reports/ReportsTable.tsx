// Stub component for Reports Table
import React from "react";

interface ReportsTableProps {
  data?: any[];
  isLoading?: boolean;
}

export const ReportsTable: React.FC<ReportsTableProps> = ({ data = [], isLoading = false }) => {
  if (isLoading) {
    return <div className="p-4">Carregando...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="p-4 text-muted-foreground">Nenhum dado disponível.</div>;
  }

  return (
    <div className="p-4">
      <p>Tabela de relatórios - {data.length} registros</p>
    </div>
  );
};

export default ReportsTable;
