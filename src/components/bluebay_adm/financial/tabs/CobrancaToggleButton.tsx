
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface CobrancaToggleButtonProps {
  showCollectedOnly: boolean;
  onToggle: () => void;
  className?: string;
}

export const CobrancaToggleButton: React.FC<CobrancaToggleButtonProps> = ({
  showCollectedOnly,
  onToggle,
  className = ""
}) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onToggle}
      className={className}
    >
      {showCollectedOnly ? (
        <>
          <EyeOff className="h-4 w-4 mr-1" />
          Ver Pendentes
        </>
      ) : (
        <>
          <Eye className="h-4 w-4 mr-1" />
          Ver Cobrados
        </>
      )}
    </Button>
  );
};
