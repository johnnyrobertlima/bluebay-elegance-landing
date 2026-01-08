
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ColorSelectionPanelProps {
  colors: any[];
  selectedColors: string[];
  onToggleColor: (colorId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export const ColorSelectionPanel = ({
  colors,
  selectedColors,
  onToggleColor,
  onSelectAll,
  onClearAll,
}: ColorSelectionPanelProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold">Cores</Label>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSelectAll}
          >
            Selecionar Todos
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearAll}
          >
            Limpar Todos
          </Button>
        </div>
      </div>
      <div className="border rounded-md p-4 grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
        {colors.map(color => (
          <div 
            key={color.id} 
            className="flex items-center space-x-2 hover:bg-muted p-2 rounded"
          >
            <Checkbox 
              id={`color-${color.id}`}
              checked={selectedColors.includes(color.id)}
              onCheckedChange={() => onToggleColor(color.id)}
            />
            <div className="flex items-center gap-2">
              {color.codigo_hex && (
                <div 
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: color.codigo_hex }}
                />
              )}
              <Label 
                htmlFor={`color-${color.id}`} 
                className="cursor-pointer font-normal flex-1"
              >
                {color.nome}
              </Label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
