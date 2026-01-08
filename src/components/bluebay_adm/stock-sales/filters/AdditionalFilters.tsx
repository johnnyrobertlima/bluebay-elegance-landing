
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";

interface AdditionalFiltersProps {
  minCadastroYear: string;
  onMinCadastroYearChange: (value: string) => void;
  showZeroStock: boolean;
  onShowZeroStockChange: (value: boolean) => void;
}

export const AdditionalFilters: React.FC<AdditionalFiltersProps> = ({
  minCadastroYear,
  onMinCadastroYearChange,
  showZeroStock,
  onShowZeroStockChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-3 rounded-md">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <Select
          value={minCadastroYear}
          onValueChange={onMinCadastroYearChange}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Ano mínimo de cadastro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os anos</SelectItem>
            <SelectItem value="2022">A partir de 2022</SelectItem>
            <SelectItem value="2023">A partir de 2023</SelectItem>
            <SelectItem value="2024">A partir de 2024</SelectItem>
            <SelectItem value="2025">A partir de 2025</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center space-x-2">
          <Switch 
            id="show-zero-stock" 
            checked={showZeroStock}
            onCheckedChange={onShowZeroStockChange}
          />
          <Label htmlFor="show-zero-stock">Apresentar itens com estoque disponível = 0</Label>
        </div>
      </div>
    </div>
  );
};
