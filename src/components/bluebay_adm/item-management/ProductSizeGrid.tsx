
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Grid, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SizeGridProps {
  colors: any[];
  sizes: any[];
  selectedItem: string | null;
  onSaveGrid: (variations: any[]) => Promise<void>;
  existingVariations?: any[];
}

export const ProductSizeGrid = ({ 
  colors, 
  sizes, 
  selectedItem,
  onSaveGrid,
  existingVariations = []
}: SizeGridProps) => {
  const [gridData, setGridData] = useState<{[key: string]: {[key: string]: boolean}}>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize the grid based on colors and sizes
  useEffect(() => {
    if (colors.length && sizes.length) {
      const initialGrid: {[key: string]: {[key: string]: boolean}} = {};
      
      colors.forEach(color => {
        initialGrid[color.id] = {};
        
        sizes.forEach(size => {
          // Check if this variation already exists
          const exists = existingVariations.some(
            v => v.id_cor === color.id && v.id_tamanho === size.id
          );
          
          initialGrid[color.id][size.id] = exists;
        });
      });
      
      setGridData(initialGrid);
    }
  }, [colors, sizes, existingVariations]);

  const handleToggleCell = (colorId: string, sizeId: string) => {
    setGridData(prev => ({
      ...prev,
      [colorId]: {
        ...prev[colorId],
        [sizeId]: !prev[colorId][sizeId]
      }
    }));
  };

  const handleSelectAllForColor = (colorId: string, value: boolean) => {
    setGridData(prev => {
      const updatedColor = { ...prev[colorId] };
      
      sizes.forEach(size => {
        updatedColor[size.id] = value;
      });
      
      return {
        ...prev,
        [colorId]: updatedColor
      };
    });
  };

  const handleSelectAllForSize = (sizeId: string, value: boolean) => {
    setGridData(prev => {
      const updatedGrid = { ...prev };
      
      colors.forEach(color => {
        updatedGrid[color.id] = {
          ...updatedGrid[color.id],
          [sizeId]: value
        };
      });
      
      return updatedGrid;
    });
  };

  const handleSelectAll = (value: boolean) => {
    setGridData(prev => {
      const updatedGrid = { ...prev };
      
      colors.forEach(color => {
        updatedGrid[color.id] = updatedGrid[color.id] || {};
        
        sizes.forEach(size => {
          updatedGrid[color.id][size.id] = value;
        });
      });
      
      return updatedGrid;
    });
  };

  const handleSaveGrid = async () => {
    if (!selectedItem) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um item para criar variações",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Convert grid data to variations array
      const variations: any[] = [];
      
      colors.forEach(color => {
        sizes.forEach(size => {
          if (gridData[color.id]?.[size.id]) {
            variations.push({
              item_codigo: selectedItem,
              id_cor: color.id,
              id_tamanho: size.id,
              quantidade: 0,
              ean: ""
            });
          }
        });
      });
      
      if (variations.length === 0) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Selecione pelo menos uma combinação de cor e tamanho",
        });
        return;
      }
      
      await onSaveGrid(variations);
      
      toast({
        title: "Grade criada",
        description: `${variations.length} variações foram criadas com sucesso`,
      });
    } catch (error: any) {
      console.error("Error saving grid:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar grade",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sort sizes by order
  const sortedSizes = [...sizes].sort((a, b) => {
    return (a.ordem || 0) - (b.ordem || 0);
  });

  if (!colors.length || !sizes.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Grade de Variações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 text-muted-foreground">
            <Grid className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p>Não há cores ou tamanhos cadastrados</p>
            <p className="text-sm mt-2">Cadastre pelo menos uma cor e um tamanho para montar a grade</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Grade de Variações</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleSelectAll(true)}
          >
            Selecionar Todos
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleSelectAll(false)}
          >
            Limpar Todos
          </Button>
          <Button 
            size="sm" 
            onClick={handleSaveGrid} 
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            Criar Variações
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center font-medium w-24">Cor / Tamanho</TableHead>
                {sortedSizes.map(size => (
                  <TableHead key={size.id} className="text-center">
                    <div className="flex flex-col items-center">
                      <span>{size.nome}</span>
                      <Checkbox 
                        className="mt-1"
                        checked={colors.every(color => gridData[color.id]?.[size.id])}
                        onCheckedChange={(checked) => handleSelectAllForSize(size.id, !!checked)}
                      />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {colors.map(color => (
                <TableRow key={color.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {color.codigo_hex && (
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color.codigo_hex }}
                        />
                      )}
                      <span>{color.nome}</span>
                      <Checkbox 
                        checked={sortedSizes.every(size => gridData[color.id]?.[size.id])}
                        onCheckedChange={(checked) => handleSelectAllForColor(color.id, !!checked)}
                      />
                    </div>
                  </TableCell>
                  {sortedSizes.map(size => {
                    const isExisting = existingVariations.some(
                      v => v.id_cor === color.id && v.id_tamanho === size.id
                    );
                    
                    return (
                      <TableCell key={size.id} className="text-center">
                        <div className="flex flex-col items-center">
                          <Checkbox 
                            checked={gridData[color.id]?.[size.id] || false}
                            onCheckedChange={() => handleToggleCell(color.id, size.id)}
                          />
                          {isExisting && (
                            <Badge variant="secondary" className="mt-1 text-xs">Existe</Badge>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
