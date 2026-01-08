
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { PaginationState } from "@/hooks/bluebay/hooks/usePagination";

interface PaginationControlsProps {
  pagination: PaginationState | { paginationState: PaginationState } | any;
  itemCount: number;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  pagination,
  itemCount
}) => {
  if (!pagination) return null;

  // Handle both direct PaginationState and wrapper object with paginationState
  const paginationState: PaginationState = pagination.paginationState || pagination;

  return (
    <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-md shadow">
      <div className="text-sm text-muted-foreground">
        Mostrando {itemCount} registros de um total de {paginationState.totalCount || 0} 
        (Página {paginationState.currentPage || 1})
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={paginationState.goToPreviousPage}
          disabled={!paginationState.hasPreviousPage}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Anterior
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={paginationState.goToNextPage}
          disabled={!paginationState.hasNextPage}
        >
          Próxima <ArrowRightIcon className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
