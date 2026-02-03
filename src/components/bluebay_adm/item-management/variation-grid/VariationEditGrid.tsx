
import { useState, useEffect } from "react";
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
  colors?: any[];
  sizes?: any[];
}

export const VariationEditGrid = ({
  itemCode,
  variations,
  onBack,
  onSaved,
  itemDetails,
  colors = [],
  sizes = []
}: VariationEditGridProps) => {
  const [editableVariations, setEditableVariations] = useState(variations);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Sync state when props change
  useEffect(() => {
    setEditableVariations(variations);
  }, [variations]);

  // DEBUG LOGGING
  console.log("DEBUG: VariationEditGrid Data (JSON):", JSON.stringify({
    firstVariation: variations[0],
    firstColor: colors[0],
    firstSize: sizes[0],
    variationIdCor: variations[0]?.id_cor,
    variationColorObj: variations[0]?.color
  }, null, 2));

  // Handle EAN input change
  const handleEanChange = (id: string, value: string) => {
    setEditableVariations(prev =>
      prev.map(variation =>
        variation.id === id ? { ...variation, ean: value } : variation
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

      console.log("DEBUG: Calling updateVariations with data:", JSON.stringify(dataToUpdate, null, 2));
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

  const getColorName = (variation: any) => {
    if (variation.color && variation.color.nome) return variation.color.nome;
    // Use loose equality (==) to handle potential string/number mismatches
    const found = colors.find((c: any) => c.id == variation.id_cor);
    return found ? found.nome : 'N/A';
  };

  const getColorHex = (variation: any) => {
    if (variation.color && variation.color.codigo_hex) return variation.color.codigo_hex;
    const found = colors.find((c: any) => c.id == variation.id_cor);
    return found ? found.codigo_hex : null;
  };

  const getSizeName = (variation: any) => {
    if (variation.size && variation.size.nome) return variation.size.nome;
    const found = sizes.find((s: any) => s.id == variation.id_tamanho);
    return found ? found.nome : 'N/A';
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center">
          <Button
            type="button"
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
          type="button"
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {editableVariations.map((variation) => (
                  <TableRow key={variation.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {getColorHex(variation) && (
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: getColorHex(variation) }}
                          />
                        )}
                        {getColorName(variation)}
                      </div>
                    </TableCell>
                    <TableCell>{getSizeName(variation)}</TableCell>
                    <TableCell>
                      <Input
                        value={variation.ean || ''}
                        onChange={(e) => handleEanChange(variation.id, e.target.value)}
                        placeholder="EAN"
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
