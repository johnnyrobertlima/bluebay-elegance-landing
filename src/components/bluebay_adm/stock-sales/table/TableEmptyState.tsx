
import React from "react";
import { AlertTriangle } from "lucide-react";

export const TableEmptyState: React.FC = () => {
  return (
    <div className="py-12 text-center">
      <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
      <p className="text-xl text-gray-700 mb-2">
        Nenhum dado encontrado para os filtros aplicados.
      </p>
      <p className="text-md text-gray-600 max-w-xl mx-auto">
        Tente ajustar os filtros ou selecionar um período diferente.
      </p>
    </div>
  );
};
