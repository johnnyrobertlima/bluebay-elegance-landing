
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileDown } from "lucide-react";

interface FinancialHeaderProps {
  title: string;
  onRefresh: () => void;
  onExport: () => void;
  isLoading: boolean;
  activeTab: string;
  hasData: {
    titles: boolean;
    clients: boolean;
    clientesVencidos: boolean;
    cobranca: boolean;
    origem?: boolean;
    cobrados?: boolean;
  };
}

export const FinancialHeader: React.FC<FinancialHeaderProps> = ({
  title,
  onRefresh,
  onExport,
  isLoading,
  activeTab,
  hasData
}) => {
  const canExport = () => {
    switch (activeTab) {
      case "titles":
        return hasData.titles;
      case "clients":
        return hasData.clients;
      case "clientesVencidos":
        return hasData.clientesVencidos;
      case "cobranca":
        return hasData.cobranca;
      case "origem":
        return hasData.origem || hasData.titles;
      case "cobrados":
        return hasData.cobrados;
      default:
        return false;
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar Dados
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={isLoading || !canExport()}
        >
          <FileDown className="h-4 w-4 mr-2" />
          Exportar para Excel
        </Button>
      </div>
    </div>
  );
};
