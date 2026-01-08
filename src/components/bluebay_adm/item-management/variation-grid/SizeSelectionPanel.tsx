
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SizeSelectionPanelProps {
  sizes: any[];
  selectedSizes: string[];
  onToggleSize: (sizeId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export const SizeSelectionPanel = ({
  sizes,
  selectedSizes,
  onToggleSize,
  onSelectAll,
  onClearAll,
}: SizeSelectionPanelProps) => {
  // Sort sizes by order
  const sortedSizes = [...sizes].sort((a, b) => {
    return (a.ordem || 0) - (b.ordem || 0);
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold">Tamanhos</Label>
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
        {sortedSizes.map(size => (
          <div 
            key={size.id} 
            className="flex items-center space-x-2 hover:bg-muted p-2 rounded"
          >
            <Checkbox 
              id={`size-${size.id}`}
              checked={selectedSizes.includes(size.id)}
              onCheckedChange={() => onToggleSize(size.id)}
            />
            <Label 
              htmlFor={`size-${size.id}`} 
              className="cursor-pointer font-normal"
            >
              {size.nome}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
