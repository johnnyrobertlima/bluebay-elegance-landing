
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateVariations } from "@/services/bluebay_adm/variationGridService";
import { useToast } from "@/hooks/use-toast";

interface VariationEditGridProps {
  itemCode: string;
  variations: any[];
  onBack: () => void;
  onSaved: () => Promise<void>;
  itemDetails?: any;
}

export const VariationEditGrid = ({ 
  itemCode, 
  variations, 
  onBack, 
  onSaved,
  itemDetails
}: VariationEditGridProps) => {
  const [editableVariations, setEditableVariations] = useState(variations);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Handle EAN input change
  const handleEanChange = (id: string, value: string) => {
    setEditableVariations(prev => 
      prev.map(variation => 
        variation.id === id ? { ...variation, ean: value } : variation
      )
    );
  };

  // Handle quantity input change
  const handleQuantityChange = (id: string, value: string) => {
    const quantity = parseInt(value, 10) || 0;
    setEditableVariations(prev => 
      prev.map(variation => 
        variation.id === id ? { ...variation, quantidade: quantity } : variation
      )
    );
  };

  // Save all variations
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Map data to format expected by the API
      const dataToUpdate = editableVariations.map(variation => ({
        id: variation.id,
        ean: variation.ean,
        quantidade: variation.quantidade
      }));
      
      await updateVariations(dataToUpdate);
      await onSaved();
      
      toast({
        title: "Variações salvas",
        description: "As variações foram atualizadas com sucesso."
      });
    } catch (error: any) {
      console.error("Error saving variations:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar variações",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={onBack}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-sm font-medium">
            Editar Variações - {itemCode}
          </CardTitle>
        </div>
        <Button 
          size="sm" 
          onClick={handleSave}
          disabled={isLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
      </CardHeader>
      <CardContent>
        {itemDetails && (
          <div className="mb-4 text-sm">
            <p>Matriz: {itemDetails.MATRIZ}, Filial: {itemDetails.FILIAL}</p>
          </div>
        )}
        <div className="rounded-md border overflow-hidden">
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Cor</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead className="w-[200px]">EAN</TableHead>
                  <TableHead className="w-[120px]">Quantidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editableVariations.map((variation) => (
                  <TableRow key={variation.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {variation.color?.codigo_hex && (
                          <div 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ backgroundColor: variation.color.codigo_hex }}
                          />
                        )}
                        {variation.color?.nome}
                      </div>
                    </TableCell>
                    <TableCell>{variation.size?.nome}</TableCell>
                    <TableCell>
                      <Input
                        value={variation.ean || ''}
                        onChange={(e) => handleEanChange(variation.id, e.target.value)}
                        placeholder="EAN"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={variation.quantidade || ''}
                        onChange={(e) => handleQuantityChange(variation.id, e.target.value)}
                        placeholder="Qtd"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
