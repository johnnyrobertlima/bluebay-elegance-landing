
import React from "react";
import { Badge } from "@/components/ui/badge";

interface ItemBadgesProps {
  isNew: boolean;
  isLowStock: boolean;
  isTop: boolean;
}

export const ItemBadges: React.FC<ItemBadgesProps> = ({ 
  isNew, 
  isLowStock, 
  isTop 
}) => {
  return (
    <div className="flex gap-1 ml-2">
      {isNew && (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs">
          Novo
        </Badge>
      )}
      
      {isLowStock && (
        <Badge variant="outline" className="border-red-500 text-red-500 hover:bg-red-50 text-xs">
          Baixo
        </Badge>
      )}
      
      {isTop && (
        <Badge variant="outline" className="border-green-500 text-green-500 hover:bg-green-50 text-xs">
          Top 10
        </Badge>
      )}
    </div>
  );
};
