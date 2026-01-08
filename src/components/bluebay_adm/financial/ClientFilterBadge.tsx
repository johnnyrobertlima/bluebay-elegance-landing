
import React from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ClientFilterBadgeProps {
  onReset: () => void;
}

export const ClientFilterBadge: React.FC<ClientFilterBadgeProps> = ({ onReset }) => {
  return (
    <div className="flex items-center mb-4">
      <p className="text-sm text-muted-foreground mr-2">
        Filtrando por cliente:
      </p>
      <Badge 
        variant="secondary"
        className="gap-1 cursor-pointer hover:bg-secondary/80"
        onClick={onReset}
      >
        Limpar filtro
        <X className="h-3 w-3" />
      </Badge>
    </div>
  );
};
