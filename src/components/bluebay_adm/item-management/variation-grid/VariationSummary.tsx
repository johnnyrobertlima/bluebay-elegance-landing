
import { Button } from "@/components/ui/button";
import { Save, Edit } from "lucide-react";

interface VariationSummaryProps {
  selectedColorsCount: number;
  selectedSizesCount: number;
  combinationsCount: number;
  existingVariationsCount: number;
  onSave: () => void;
  onViewExisting: () => void;
  isLoading: boolean;
  isValid: boolean;
}

export const VariationSummary = ({
  selectedColorsCount,
  selectedSizesCount,
  combinationsCount,
  existingVariationsCount,
  onSave,
  onViewExisting,
  isLoading,
  isValid
}: VariationSummaryProps) => {
  return (
    <div className="mt-6 pt-4 border-t">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">Combinações a serem geradas: {combinationsCount}</p>
          <p className="text-xs text-muted-foreground">Variações existentes: {existingVariationsCount}</p>
        </div>
        <div className="flex space-x-2">
          {existingVariationsCount > 0 && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onViewExisting}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Variações Existentes
            </Button>
          )}
          <Button 
            size="sm" 
            onClick={onSave} 
            disabled={isLoading || !isValid}
          >
            <Save className="h-4 w-4 mr-2" />
            Gerar Grade
          </Button>
        </div>
      </div>
    </div>
  );
};
