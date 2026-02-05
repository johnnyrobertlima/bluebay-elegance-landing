import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Link, Upload, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ItemVariationsGrid } from "./ItemVariationsGrid";
import { uploadProductImage } from "@/service/bluebay_adm/itemManagementService";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    ITEM_CODIGO: "",
    DESCRICAO: "",
    PRECO: "",
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
    // New fields
    FOTO_PRODUTO: "",
    URL_CATALOGO: "",
    LOOKBOOK: false,
    SHOWROOM: false,
    CORES: "",
    GRADE: "",
    QTD_CAIXA: "",
    ENDERECO_CD: "",
    CODIGO_RFID: "",
    DUN14: "",
    // Hidden keys for update identification
    MATRIZ: 1,
    FILIAL: 1
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [newBrandName, setNewBrandName] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [showNewSubcategory, setShowNewSubcategory] = useState(false);
  const [isCompanyFromGroup, setIsCompanyFromGroup] = useState(false);
  const [isStationFromGroup, setIsStationFromGroup] = useState(false);

  useEffect(() => {
    if (item) {
      let initialEmpresa = item.empresa || "";
      let initialEstacao = item.estacao || "";
      let isFromGroup = false;
      let isStationFromGroupFlag = false;

      // Check if we should auto-select company and station based on group
      if (item.GRU_CODIGO && groups.length > 0) {
        const selectedGroup = groups.find(g => g.gru_codigo === item.GRU_CODIGO);
        if (selectedGroup) {
          // Company logic
          if (selectedGroup.empresa_nome && (!initialEmpresa || initialEmpresa === selectedGroup.empresa_nome)) {
            initialEmpresa = selectedGroup.empresa_nome;
            isFromGroup = true;
          }

          // Station logic
          if (selectedGroup.estacao && (!initialEstacao || initialEstacao === selectedGroup.estacao)) {
            initialEstacao = selectedGroup.estacao;
            isStationFromGroupFlag = true;
          }
        }
      }

      setFormData({
        ITEM_CODIGO: item.ITEM_CODIGO || "",
        DESCRICAO: item.DESCRICAO || item.descricao || "",
        PRECO: item.PRECO || "",
        GRU_CODIGO: item.GRU_CODIGO || "",
        GRU_DESCRICAO: item.GRU_DESCRICAO || "",
        CODIGOAUX: item.CODIGOAUX || "",
        id_subcategoria: item.id_subcategoria || "",
        id_marca: item.id_marca || "",
        empresa: initialEmpresa,
        estacao: initialEstacao,
        genero: item.genero || "",
        faixa_etaria: item.faixa_etaria || "",
        ativo: item.ativo !== false,
        ncm: item.ncm || "",
        // New fields mapping
        FOTO_PRODUTO: item.FOTO_PRODUTO || "",
        URL_CATALOGO: item.URL_CATALOGO || "",
        LOOKBOOK: item.LOOKBOOK || false,
        SHOWROOM: item.SHOWROOM || false,
        CORES: item.CORES || "",
        GRADE: item.GRADE || "",
        QTD_CAIXA: item.QTD_CAIXA || "",
        ENDERECO_CD: item.ENDERECO_CD || "",
        CODIGO_RFID: item.CODIGO_RFID || "",
        DUN14: item.DUN14 || "",
        MATRIZ: item.MATRIZ !== undefined ? item.MATRIZ : 1,
        FILIAL: item.FILIAL !== undefined ? item.FILIAL : 1
      });

      setIsCompanyFromGroup(isFromGroup);
      setIsStationFromGroup(isStationFromGroupFlag);

      if (activeTab === "basic" && !item.ITEM_CODIGO) {
        setActiveTab("variations");
      }
    } else {
      setFormData({
        ITEM_CODIGO: "",
        DESCRICAO: "",
        PRECO: "",
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
        // New fields reset
        FOTO_PRODUTO: "",
        URL_CATALOGO: "",
        LOOKBOOK: false,
        SHOWROOM: false,
        CORES: "",
        GRADE: "",
        QTD_CAIXA: "",
        ENDERECO_CD: "",
        CODIGO_RFID: "",
        DUN14: "",
        MATRIZ: 1,
        FILIAL: 1
      });
      setIsCompanyFromGroup(false);
      setIsStationFromGroup(false);

      setActiveTab("basic");
    }
  }, [item, activeTab, groups]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const handleSelectChange = (field: string, value: string) => {
    if (field === "GRU_CODIGO") {
      const selectedGroup = groups.find((g) => g.gru_codigo === value);
      if (selectedGroup) {
        setFormData((prev) => ({
          ...prev,
          GRU_CODIGO: value,
          GRU_DESCRICAO: selectedGroup.gru_descricao,
          ...(selectedGroup.empresa_nome ? { empresa: selectedGroup.empresa_nome } : {}),
          ...(selectedGroup.estacao ? { estacao: selectedGroup.estacao } : {})
        }));

        setIsCompanyFromGroup(!!selectedGroup.empresa_nome);
        setIsStationFromGroup(!!selectedGroup.estacao);
      } else {
        setFormData((prev) => ({
          ...prev,
          GRU_CODIGO: value,
          GRU_DESCRICAO: "",
        }));
        setIsCompanyFromGroup(false);
        setIsStationFromGroup(false);
      }
    } else if (field === "empresa") {
      setIsCompanyFromGroup(false);
      setFormData((prev) => ({ ...prev, [field]: value }));
    } else if (field === "estacao") {
      setIsStationFromGroup(false);
      setFormData((prev) => ({ ...prev, [field]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const publicUrl = await uploadProductImage(file);
      if (publicUrl) {
        setFormData(prev => ({ ...prev, FOTO_PRODUTO: publicUrl }));
        toast({
          title: "Sucesso",
          description: "Imagem enviada com sucesso!",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao enviar imagem. Tente novamente.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Cast fields that need to be numbers
      const dataToSave = {
        ...formData,
        QTD_CAIXA: formData.QTD_CAIXA ? Number(formData.QTD_CAIXA) : null,
        PRECO: formData.PRECO ? Number(formData.PRECO) : null
      };

      await onSave(dataToSave);

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

  const generateRFID = () => {
    // Generate 24 random hex characters
    const hex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
    setFormData(prev => ({ ...prev, CODIGO_RFID: hex }));
    toast({
      title: "RFID Gerado",
      description: "Novo código RFID gerado com sucesso."
    });
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
            Grade de Variaões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="flex gap-6">
            {/* Photo Upload Section */}
            <div className="w-1/4 flex flex-col gap-2">
              <Label>Foto do Produto</Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-accent/50 transition-colors relative"
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.FOTO_PRODUTO ? (
                  <img
                    src={formData.FOTO_PRODUTO}
                    alt="Produto"
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm">Clique para enviar</span>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <span className="text-sm font-medium">Enviando...</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            {/* Main Info Fields */}
            <div className="flex-1 space-y-4">
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
                  <Label htmlFor="PRECO">Preço (R$)</Label>
                  <Input
                    id="PRECO"
                    name="PRECO"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.PRECO}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="URL_CATALOGO">URL do Catálogo</Label>
                  <Input
                    id="URL_CATALOGO"
                    name="URL_CATALOGO"
                    value={formData.URL_CATALOGO}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
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
                    <SelectItem key={group.gru_codigo || group.id} value={group.gru_codigo || `group-${group.id}`}>
                      {group.gru_descricao}
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
              <Label htmlFor="empresa" className="flex items-center gap-2">
                Empresa
                {isCompanyFromGroup && (
                  <span title="Empresa sugerida conforme o cadastro do Grupo">
                    <Link
                      size={14}
                      className="text-blue-500"
                    />
                  </span>
                )}
              </Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="CORES">Cores</Label>
              <Input
                id="CORES"
                name="CORES"
                value={formData.CORES}
                onChange={handleChange}
                placeholder="Descrição das cores"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="GRADE">Grade</Label>
              <Input
                id="GRADE"
                name="GRADE"
                value={formData.GRADE}
                onChange={handleChange}
                placeholder="Grade de tamanhos"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="QTD_CAIXA">Qtd. por Caixa</Label>
              <Input
                id="QTD_CAIXA"
                name="QTD_CAIXA"
                type="number"
                value={formData.QTD_CAIXA}
                onChange={handleChange}
                placeholder="Quantidade de itens por caixa"
              />
            </div>

            <div className="flex gap-6 items-end">
              <div className="flex items-center space-x-2">
                <Switch
                  id="LOOKBOOK"
                  checked={formData.LOOKBOOK}
                  onCheckedChange={(checked) => handleCheckboxChange("LOOKBOOK", checked)}
                />
                <Label htmlFor="LOOKBOOK">Está no Lookbook?</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="SHOWROOM"
                  checked={formData.SHOWROOM}
                  onCheckedChange={(checked) => handleCheckboxChange("SHOWROOM", checked)}
                />
                <Label htmlFor="SHOWROOM">Está no Showroom?</Label>
              </div>
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
              <Label htmlFor="estacao" className="flex items-center gap-2">
                Estação
                {isStationFromGroup && (
                  <span title="Estação sugerida conforme o cadastro do Grupo">
                    <Link
                      size={14}
                      className="text-blue-500"
                    />
                  </span>
                )}
              </Label>
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

          {/* New Additional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="ENDERECO_CD">Endereço no CD</Label>
              <Input
                id="ENDERECO_CD"
                name="ENDERECO_CD"
                value={formData.ENDERECO_CD}
                onChange={handleChange}
                maxLength={10}
                placeholder="Ex: A-01-02-03"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="DUN14">DUN-14</Label>
              <Input
                id="DUN14"
                name="DUN14"
                value={formData.DUN14}
                onChange={handleChange}
                maxLength={14}
                placeholder="Código DUN-14"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="CODIGO_RFID">Código RFID (24 caracteres Hex)</Label>
            <div className="flex gap-2">
              <Input
                id="CODIGO_RFID"
                name="CODIGO_RFID"
                value={formData.CODIGO_RFID}
                onChange={handleChange}
                placeholder="Código RFID"
                className="font-mono"
                maxLength={24}
              />
              <Button type="button" variant="outline" onClick={generateRFID} title="Gerar código aleatório único">
                Gerar RFID
              </Button>
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



      {
        activeTab !== "variations" && (
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        )
      }
    </form >
  );
};
