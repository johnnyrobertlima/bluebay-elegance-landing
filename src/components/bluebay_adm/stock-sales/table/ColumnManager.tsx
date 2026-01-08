
import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Columns } from "lucide-react";

interface ColumnOption {
  id: string;
  label: string;
}

interface ColumnManagerProps {
  columns: ColumnOption[];
  visibleColumns: Record<string, boolean>;
  onColumnToggle: (columnId: string, isVisible: boolean) => void;
}

export const ColumnManager: React.FC<ColumnManagerProps> = ({
  columns,
  visibleColumns,
  onColumnToggle
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2 flex items-center gap-1">
          <Columns className="h-4 w-4" />
          <span>Colunas</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 bg-white" align="end">
        <div className="space-y-1">
          <h4 className="font-medium text-sm mb-3">Gerenciar Colunas</h4>
          <div className="grid grid-cols-1 gap-3">
            {columns.map((column) => (
              <div key={column.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`column-${column.id}`} 
                  checked={visibleColumns[column.id]} 
                  onCheckedChange={(checked) => {
                    onColumnToggle(column.id, checked === true);
                  }}
                />
                <Label htmlFor={`column-${column.id}`} className="text-sm font-normal cursor-pointer">
                  {column.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
