import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ItemVariationsGrid } from "./ItemVariationsGrid";

interface ItemFormProps {
  item: any | null;
  onSave: (item: any) => Promise<void>;
  groups: any[];
  subcategories: any[];
  brands: any[];
  addSubcategory?: (name: string) => Promise<any>;
  addBrand?: (name: string) => Promise<any>;
}

export const ItemForm = ({ 
  item, 
  onSave, 
  groups, 
  subcategories = [],
  brands = [],
  addSubcategory,
  addBrand
}: ItemFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    ITEM_CODIGO: "",
    DESCRICAO: "",
    GRU_CODIGO: "",
    GRU_DESCRICAO: "",
    CODIGOAUX: "",
    id_subcategoria: "",
    id_marca: "",
    empresa: "",
    estacao: "",
    genero: "",
    faixa_etaria: "",
    ativo: true,
    ncm: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [newBrandName, setNewBrandName] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [showNewSubcategory, setShowNewSubcategory] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        ITEM_CODIGO: item.ITEM_CODIGO || "",
        DESCRICAO: item.DESCRICAO || "",
        GRU_CODIGO: item.GRU_CODIGO || "",
        GRU_DESCRICAO: item.GRU_DESCRICAO || "",
        CODIGOAUX: item.CODIGOAUX || "",
        id_subcategoria: item.id_subcategoria || "",
        id_marca: item.id_marca || "",
        empresa: item.empresa || "",
        estacao: item.estacao || "",
        genero: item.genero || "",
        faixa_etaria: item.faixa_etaria || "",
        ativo: item.ativo !== false,
        ncm: item.ncm || "",
      });
      
      if (activeTab === "basic" && !item.ITEM_CODIGO) {
        setActiveTab("variations");
      }
    } else {
      setFormData({
        ITEM_CODIGO: "",
        DESCRICAO: "",
        GRU_CODIGO: "",
        GRU_DESCRICAO: "",
        CODIGOAUX: "",
        id_subcategoria: "",
        id_marca: "",
        empresa: "",
        estacao: "",
        genero: "",
        faixa_etaria: "",
        ativo: true,
        ncm: "",
      });
      
      setActiveTab("basic");
    }
  }, [item, activeTab]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const handleSelectChange = (field: string, value: string) => {
    if (field === "GRU_CODIGO") {
      const selectedGroup = groups.find((g) => g.GRU_CODIGO === value);
      if (selectedGroup) {
        setFormData((prev) => ({
          ...prev,
          GRU_CODIGO: value,
          GRU_DESCRICAO: selectedGroup.GRU_DESCRICAO,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          GRU_CODIGO: value,
          GRU_DESCRICAO: "",
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(formData);
      
      if (activeTab === "basic" && !item) {
        setActiveTab("variations");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNewBrand = async () => {
    if (!newBrandName.trim() || !addBrand) {
      toast({
        variant: "destructive",
        title: "Nome inválido",
        description: "Digite um nome válido para a marca"
      });
      return;
    }

    try {
      const brand = await addBrand(newBrandName);
      setFormData(prev => ({ ...prev, id_marca: brand.id }));
      setNewBrandName("");
      setShowNewBrand(false);
      toast({
        title: "Marca adicionada",
        description: "Nova marca cadastrada com sucesso"
      });
    } catch (error) {
      console.error("Erro ao adicionar marca:", error);
    }
  };

  const handleAddNewSubcategory = async () => {
    if (!newSubcategoryName.trim() || !addSubcategory) {
      toast({
        variant: "destructive",
        title: "Nome inválido",
        description: "Digite um nome válido para a subcategoria"
      });
      return;
    }

    try {
      const subcategory = await addSubcategory(newSubcategoryName);
      setFormData(prev => ({ ...prev, id_subcategoria: subcategory.id }));
      setNewSubcategoryName("");
      setShowNewSubcategory(false);
      toast({
        title: "Subcategoria adicionada",
        description: "Nova subcategoria cadastrada com sucesso"
      });
    } catch (error) {
      console.error("Erro ao adicionar subcategoria:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs 
        defaultValue="basic" 
        className="w-full" 
        value={activeTab} 
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
          <TabsTrigger value="additional">Detalhes Adicionais</TabsTrigger>
          <TabsTrigger value="variations" disabled={!formData.ITEM_CODIGO}>
            Grade de Varia��ões
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="ITEM_CODIGO">Código do Item</Label>
              <Input
                id="ITEM_CODIGO"
                name="ITEM_CODIGO"
                value={formData.ITEM_CODIGO}
                onChange={handleChange}
                placeholder="Código do item"
                required
                readOnly={!!item}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="CODIGOAUX">Código Auxiliar</Label>
              <Input
                id="CODIGOAUX"
                name="CODIGOAUX"
                value={formData.CODIGOAUX}
                onChange={handleChange}
                placeholder="Código auxiliar (opcional)"
              />
            </div>
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="DESCRICAO">Descrição</Label>
            <Input
              id="DESCRICAO"
              name="DESCRICAO"
              value={formData.DESCRICAO}
              onChange={handleChange}
              placeholder="Descrição do item"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="GRU_CODIGO">Grupo</Label>
              <Select 
                value={formData.GRU_CODIGO} 
                onValueChange={(value) => handleSelectChange("GRU_CODIGO", value)}
              >
                <SelectTrigger id="GRU_CODIGO">
                  <SelectValue placeholder="Selecione um grupo" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.GRU_CODIGO} value={group.GRU_CODIGO}>
                      {group.GRU_DESCRICAO}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="id_subcategoria">Subcategoria</Label>
              {!showNewSubcategory ? (
                <div className="flex gap-2">
                  <Select 
                    value={formData.id_subcategoria} 
                    onValueChange={(value) => handleSelectChange("id_subcategoria", value)}
                  >
                    <SelectTrigger id="id_subcategoria">
                      <SelectValue placeholder="Selecione uma subcategoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((subcat) => (
                        <SelectItem key={subcat.id} value={subcat.id}>
                          {subcat.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowNewSubcategory(true)}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    placeholder="Nome da nova subcategoria"
                  />
                  <Button 
                    type="button" 
                    variant="default"
                    onClick={handleAddNewSubcategory}
                  >
                    Adicionar
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowNewSubcategory(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="id_marca">Marca</Label>
              {!showNewBrand ? (
                <div className="flex gap-2">
                  <Select 
                    value={formData.id_marca} 
                    onValueChange={(value) => handleSelectChange("id_marca", value)}
                  >
                    <SelectTrigger id="id_marca">
                      <SelectValue placeholder="Selecione uma marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowNewBrand(true)}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="Nome da nova marca"
                  />
                  <Button 
                    type="button" 
                    variant="default"
                    onClick={handleAddNewBrand}
                  >
                    Adicionar
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowNewBrand(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="empresa">Empresa</Label>
              <Select 
                value={formData.empresa} 
                onValueChange={(value) => handleSelectChange("empresa", value)}
              >
                <SelectTrigger id="empresa">
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bluebay">Bluebay</SelectItem>
                  <SelectItem value="JAB">JAB</SelectItem>
                  <SelectItem value="BK">BK</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="additional" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="genero">Gênero</Label>
              <Select 
                value={formData.genero} 
                onValueChange={(value) => handleSelectChange("genero", value)}
              >
                <SelectTrigger id="genero">
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                  <SelectItem value="Unissex">Unissex</SelectItem>
                  <SelectItem value="Infantil">Infantil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="faixa_etaria">Faixa Etária</Label>
              <Select 
                value={formData.faixa_etaria} 
                onValueChange={(value) => handleSelectChange("faixa_etaria", value)}
              >
                <SelectTrigger id="faixa_etaria">
                  <SelectValue placeholder="Selecione a faixa etária" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adulto">Adulto</SelectItem>
                  <SelectItem value="Infantil">Infantil</SelectItem>
                  <SelectItem value="Juvenil">Juvenil</SelectItem>
                  <SelectItem value="Bebê">Bebê</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="estacao">Estação</Label>
              <Select 
                value={formData.estacao} 
                onValueChange={(value) => handleSelectChange("estacao", value)}
              >
                <SelectTrigger id="estacao">
                  <SelectValue placeholder="Selecione a estação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primavera / Verão">Primavera / Verão</SelectItem>
                  <SelectItem value="Outono / Inverno">Outono / Inverno</SelectItem>
                  <SelectItem value="Todas">Todas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="ncm">NCM</Label>
              <Input
                id="ncm"
                name="ncm"
                value={formData.ncm}
                onChange={handleChange}
                placeholder="Código NCM"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox 
              id="ativo" 
              checked={formData.ativo}
              onCheckedChange={(checked) => 
                handleCheckboxChange("ativo", checked as boolean)
              }
            />
            <Label htmlFor="ativo" className="cursor-pointer">Item ativo</Label>
          </div>
        </TabsContent>
        
        <TabsContent value="variations" className="space-y-4 mt-4">
          {formData.ITEM_CODIGO ? (
            <ItemVariationsGrid itemCode={formData.ITEM_CODIGO} />
          ) : (
            <div className="text-center p-6 text-muted-foreground">
              <p>Salve o produto primeiro para gerenciar variações</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <DialogFooter className="mt-6">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </form>
  );
};
