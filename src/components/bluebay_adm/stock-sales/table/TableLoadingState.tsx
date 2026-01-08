
import React from "react";

export const TableLoadingState: React.FC = () => {
  return (
    <div className="py-12 text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-blue-600"></div>
      <p className="mt-6 text-gray-600 text-lg font-medium">Carregando dados...</p>
      <p className="text-gray-500 text-sm mt-2">
        Isso pode levar alguns instantes para grandes volumes de dados.
      </p>
      <p className="text-gray-500 text-sm mt-1">
        Estamos processando todos os registros disponíveis sem limitação.
      </p>
      <div className="mt-6 max-w-lg mx-auto">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
