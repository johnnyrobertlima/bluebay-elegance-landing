
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";

interface ActionButtonsProps {
  onRefresh: () => void;
  onClearFilters: () => void;
  isLoading: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onRefresh,
  onClearFilters,
  isLoading,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        disabled={isLoading}
        title="Atualizar dados"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onClearFilters}
        className="flex items-center gap-1"
        title="Limpar filtros"
      >
        <X className="h-4 w-4" />
        Limpar filtros
      </Button>
    </div>
  );
};
