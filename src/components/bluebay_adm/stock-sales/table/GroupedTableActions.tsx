
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface GroupedTableActionsProps {
  groupCount: number;
  totalItems: number;
  expandAllGroups: () => void;
  collapseAllGroups: () => void;
}

export const GroupedTableActions: React.FC<GroupedTableActionsProps> = ({
  groupCount,
  totalItems,
  expandAllGroups,
  collapseAllGroups
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="text-sm text-gray-500">
        {groupCount} grupos, {totalItems} itens no total
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={expandAllGroups}
          className="flex items-center gap-1"
        >
          <ChevronDown className="h-4 w-4" />
          Expandir Todos
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={collapseAllGroups}
          className="flex items-center gap-1"
        >
          <ChevronUp className="h-4 w-4" />
          Colapsar Todos
        </Button>
      </div>
    </div>
  );
};
