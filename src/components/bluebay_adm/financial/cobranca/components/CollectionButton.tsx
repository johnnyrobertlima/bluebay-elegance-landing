
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail } from "lucide-react";

interface CollectionButtonProps {
  isCollected: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

export const CollectionButton: React.FC<CollectionButtonProps> = ({
  isCollected,
  onClick,
  className = ""
}) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onClick}
      className={`${isCollected ? "bg-green-50" : ""} ${className}`}
    >
      {isCollected ? (
        <>
          <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
          Cobrado
        </>
      ) : (
        <>
          <Mail className="h-4 w-4 mr-1" />
          Enviar Cobrança
        </>
      )}
    </Button>
  );
};
