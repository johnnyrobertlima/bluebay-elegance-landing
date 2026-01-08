import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Search, Save, Tag, X, Edit, Trash } from "lucide-react";
import { ProductSizeGrid } from "./ProductSizeGrid";
import { supabase } from "@/integrations/supabase/client";

interface ProductVariationsManagerProps {
  initialSelectedProduct?: string | null;
}

export const ProductVariationsManager = ({ initialSelectedProduct }: ProductVariationsManagerProps) => {
  const [activeTab, setActiveTab] = useState<string>("cores");
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [newColor, setNewColor] = useState({ nome: "", codigo_hex: "#ffffff" });
  const [newSize, setNewSize] = useState({ nome: "", ordem: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(initialSelectedProduct || null);
  const [itemsToSelect, setItemsToSelect] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [existingVariations, setExistingVariations] = useState<any[]>([]);
  const [editItem, setEditItem] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchColors();
    fetchSizes();
    fetchItemsToSelect();
  }, []);

  useEffect(() => {
    if (initialSelectedProduct) {
      setSelectedItem(initialSelectedProduct);
      setActiveTab("grade");
      fetchExistingVariations(initialSelectedProduct);
    }
  }, [initialSelectedProduct]);

  const fetchColors = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("Cor")
        .select("*")
        .order("nome");

      if (error) throw error;
      setColors(data || []);
    } catch (error: any) {
      console.error("Error fetching colors:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSizes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("Tamanho")
        .select("*")
        .order("ordem");

      if (error) throw error;
      setSizes(data || []);
    } catch (error: any) {
      console.error("Error fetching sizes:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchItemsToSelect = async () => {
    try {
      const { data, error } = await supabase
        .from("BLUEBAY_ITEM")
        .select("codigo, descricao");

      if (error) throw error;
      setItemsToSelect(data || []);
    } catch (error: any) {
      console.error("Error fetching items:", error.message);
    }
  };

  const fetchExistingVariations = async (itemCode: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("BLUEBAY_ITEM_VARIACAO")
        .select("*")
        .eq("item_codigo", itemCode);

      if (error) throw error;
      setExistingVariations(data || []);
    } catch (error: any) {
      console.error("Error fetching existing variations:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveColor = async () => {
    if (!newColor.nome.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nome da cor é obrigatório",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("Cor")
        .insert([newColor])
        .select();

      if (error) throw error;

      setColors([...colors, data[0]]);
      setNewColor({ nome: "", codigo_hex: "#ffffff" });
      
      toast({
        title: "Cor adicionada",
        description: "A cor foi adicionada com sucesso",
      });
    } catch (error: any) {
      console.error("Error saving color:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao salvar cor",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSize = async () => {
    if (!newSize.nome.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nome do tamanho é obrigatório",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("Tamanho")
        .insert([newSize])
        .select();

      if (error) throw error;

      setSizes([...sizes, data[0]]);
      setNewSize({ nome: "", ordem: 0 });
      
      toast({
        title: "Tamanho adicionado",
        description: "O tamanho foi adicionado com sucesso",
      });
    } catch (error: any) {
      console.error("Error saving size:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao salvar tamanho",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditColor = async (color: any) => {
    setEditItem(color);
    setNewColor({ nome: color.nome, codigo_hex: color.codigo_hex });
  };

  const handleUpdateColor = async () => {
    if (!newColor.nome.trim() || !editItem) {
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("Cor")
        .update({ nome: newColor.nome, codigo_hex: newColor.codigo_hex })
        .eq("id", editItem.id);

      if (error) throw error;

      setColors(colors.map(c => c.id === editItem.id ? { ...c, nome: newColor.nome, codigo_hex: newColor.codigo_hex } : c));
      setNewColor({ nome: "", codigo_hex: "#ffffff" });
      setEditItem(null);
      
      toast({
        title: "Cor atualizada",
        description: "A cor foi atualizada com sucesso",
      });
    } catch (error: any) {
      console.error("Error updating color:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar cor",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSize = async (size: any) => {
    setEditItem(size);
    setNewSize({ nome: size.nome, ordem: size.ordem });
  };

  const handleUpdateSize = async () => {
    if (!newSize.nome.trim() || !editItem) {
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("Tamanho")
        .update({ nome: newSize.nome, ordem: newSize.ordem })
        .eq("id", editItem.id);

      if (error) throw error;

      setSizes(sizes.map(s => s.id === editItem.id ? { ...s, nome: newSize.nome, ordem: newSize.ordem } : s));
      setNewSize({ nome: "", ordem: 0 });
      setEditItem(null);
      
      toast({
        title: "Tamanho atualizado",
        description: "O tamanho foi atualizado com sucesso",
      });
    } catch (error: any) {
      console.error("Error updating size:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar tamanho",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (item: any, type: 'color' | 'size') => {
    setItemToDelete({ ...item, type });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      setIsLoading(true);
      const table = itemToDelete.type === 'color' ? 'Cor' : 'Tamanho';
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", itemToDelete.id);

      if (error) throw error;

      if (itemToDelete.type === 'color') {
        setColors(colors.filter(c => c.id !== itemToDelete.id));
      } else {
        setSizes(sizes.filter(s => s.id !== itemToDelete.id));
      }
      
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      
      toast({
        title: "Item excluído",
        description: `O item foi excluído com sucesso`,
      });
    } catch (error: any) {
      console.error("Error deleting item:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao excluir item",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditItem(null);
    setNewColor({ nome: "", codigo_hex: "#ffffff" });
    setNewSize({ nome: "", ordem: 0 });
  };

  const handleSelectItem = (code: string) => {
    setSelectedItem(code);
    fetchExistingVariations(code);
  };

  const filteredItems = itemsToSelect.filter(item => 
    item.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateVariations = async (variations: any[]) => {
    if (!variations.length) return;
    
    try {
      setIsLoading(true);
      
      const newVariations = variations.filter(v => 
        !existingVariations.some(
          ev => ev.id_cor === v.id_cor && ev.id_tamanho === v.id_tamanho
        )
      );
      
      if (newVariations.length === 0) {
        toast({
          variant: "default",
          title: "Nenhuma variação para adicionar",
          description: "Todas as variações selecionadas já existem",
        });
        return;
      }
      
      const completeVariations = newVariations.map(v => ({
        ...v,
        matriz: 1,
        filial: 1,
      }));
      
      const { error } = await supabase
        .from("BLUEBAY_ITEM_VARIACAO")
        .insert(completeVariations);

      if (error) throw error;
      
      fetchExistingVariations(String(selectedItem));
      
      toast({
        title: "Variações criadas",
        description: `${newVariations.length} variações foram criadas com sucesso`,
      });
    } catch (error: any) {
      console.error("Error creating variations:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao criar variações",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Variações</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="cores">Cores</TabsTrigger>
              <TabsTrigger value="tamanhos">Tamanhos</TabsTrigger>
              <TabsTrigger value="grade">Montar Grade</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cores">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md">
                  <div className="space-y-2">
                    <Label htmlFor="colorName">Nome da Cor</Label>
                    <Input 
                      id="colorName" 
                      value={newColor.nome} 
                      onChange={(e) => setNewColor({...newColor, nome: e.target.value})}
                      placeholder="Digite o nome da cor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="colorHex">Código Hexadecimal</Label>
                    <Input 
                      id="colorHex" 
                      type="color" 
                      value={newColor.codigo_hex} 
                      onChange={(e) => setNewColor({...newColor, codigo_hex: e.target.value})}
                    />
                  </div>
                  <div className="flex items-end">
                    {editItem ? (
                      <div className="flex space-x-2 w-full">
                        <Button 
                          className="flex-1" 
                          onClick={handleUpdateColor} 
                          disabled={isLoading}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Atualizar
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={cancelEdit}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={handleSaveColor} 
                        disabled={isLoading}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Cor
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cor</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {colors.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                            Nenhuma cor cadastrada
                          </TableCell>
                        </TableRow>
                      ) : (
                        colors.map(color => (
                          <TableRow key={color.id}>
                            <TableCell>
                              <div 
                                className="w-6 h-6 rounded-full border"
                                style={{ backgroundColor: color.codigo_hex }}
                              />
                            </TableCell>
                            <TableCell>{color.nome}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{color.codigo_hex}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleEditColor(color)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => confirmDelete(color, 'color')}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tamanhos">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md">
                  <div className="space-y-2">
                    <Label htmlFor="sizeName">Nome do Tamanho</Label>
                    <Input 
                      id="sizeName" 
                      value={newSize.nome} 
                      onChange={(e) => setNewSize({...newSize, nome: e.target.value})}
                      placeholder="Digite o nome do tamanho"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sizeOrder">Ordem</Label>
                    <Input 
                      id="sizeOrder" 
                      type="number" 
                      value={newSize.ordem} 
                      onChange={(e) => setNewSize({...newSize, ordem: parseInt(e.target.value) || 0})}
                      placeholder="Ordem de exibição"
                    />
                  </div>
                  <div className="flex items-end">
                    {editItem ? (
                      <div className="flex space-x-2 w-full">
                        <Button 
                          className="flex-1" 
                          onClick={handleUpdateSize} 
                          disabled={isLoading}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Atualizar
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={cancelEdit}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={handleSaveSize} 
                        disabled={isLoading}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Tamanho
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Ordem</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sizes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                            Nenhum tamanho cadastrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        sizes.map(size => (
                          <TableRow key={size.id}>
                            <TableCell>{size.nome}</TableCell>
                            <TableCell>{size.ordem}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleEditSize(size)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => confirmDelete(size, 'size')}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="grade">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium">Selecionar Produto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar produto por nome ou código"
                          className="pl-8"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setSearchTerm("")}
                      >
                        Limpar
                      </Button>
                    </div>

                    <div className="border rounded-md h-40 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead className="w-24">Ação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredItems.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                {searchTerm ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredItems.map(item => (
                              <TableRow key={item.codigo}>
                                <TableCell className="font-medium">{item.codigo}</TableCell>
                                <TableCell>{item.descricao}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSelectItem(item.codigo)}
                                    className={selectedItem === item.codigo ? "bg-primary/10" : ""}
                                  >
                                    <Tag className="h-4 w-4 mr-2" />
                                    Selecionar
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {selectedItem && (
                  <ProductSizeGrid 
                    colors={colors} 
                    sizes={sizes} 
                    selectedItem={selectedItem}
                    onSaveGrid={handleCreateVariations}
                    existingVariations={existingVariations}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
