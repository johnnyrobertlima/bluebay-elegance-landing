
import React from "react";

interface EmptyTitlesMessageProps {
  showCollected: boolean;
}

export const EmptyTitlesMessage: React.FC<EmptyTitlesMessageProps> = ({ showCollected }) => {
  return (
    <div className="bg-muted/40 py-8 text-center rounded-md">
      <p className="text-muted-foreground">
        {showCollected 
          ? "Nenhum título cobrado encontrado" 
          : "Nenhum título vencido encontrado"}
      </p>
      <p className="text-sm text-muted-foreground">
        {showCollected 
          ? "Não há títulos que foram cobrados" 
          : "Todos os títulos estão pagos, dentro do prazo ou já foram cobrados"}
      </p>
    </div>
  );
};
