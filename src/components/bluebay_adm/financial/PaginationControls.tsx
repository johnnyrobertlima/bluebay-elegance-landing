
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { PaginationState } from "@/hooks/bluebay/hooks/usePagination";

interface PaginationControlsProps {
  pagination: PaginationState | undefined;
  itemCount: number;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  pagination,
  itemCount
}) => {
  if (!pagination) return null;

  return (
    <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-md shadow">
      <div className="text-sm text-muted-foreground">
        Mostrando {itemCount} registros de um total de {pagination.totalCount} 
        (Página {pagination.currentPage})
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={pagination.goToPreviousPage}
          disabled={!pagination.hasPreviousPage}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Anterior
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={pagination.goToNextPage}
          disabled={!pagination.hasNextPage}
        >
          Próxima <ArrowRightIcon className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
