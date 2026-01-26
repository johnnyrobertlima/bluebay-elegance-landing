
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    fetchCollectionConfig,
    updateCollectionConfig,
    fetchCollectionItems,
    saveCollectionItem,
    deleteCollectionItem,
    CollectionConfigData,
    CollectionItemData,
    uploadLandingImage
} from "@/services/bluebay_adm/landingPageService";
import { Loader2, Plus, Edit, Trash2, Upload } from "lucide-react";

export const CollectionEditor = () => {
    const [configData, setConfigData] = useState<CollectionConfigData | null>(null);
    const [items, setItems] = useState<CollectionItemData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingConfig, setIsSavingConfig] = useState(false);

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<CollectionItemData | null>(null);
    const [isSavingItem, setIsSavingItem] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const [config, collectionItems] = await Promise.all([
            fetchCollectionConfig(),
            fetchCollectionItems()
        ]);

        if (config) {
            setConfigData(config);
        } else {
            setConfigData({
                section_title: "",
                section_subtitle: "",
                description: "",
                collection_name: "",
                collection_cta_text: "",
                collection_cta_link: ""
            });
        }

        setItems(collectionItems);
        setIsLoading(false);
    };

    // --- Config Handlers ---
    const handleConfigChange = (field: keyof CollectionConfigData, value: string) => {
        if (!configData) return;
        setConfigData({ ...configData, [field]: value });
    };

    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!configData) return;

        setIsSavingConfig(true);
        try {
            await updateCollectionConfig(configData);
            toast({ title: "Configuração salva", description: "Cabeçalho da seção atualizado." });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar configuração." });
        } finally {
            setIsSavingConfig(false);
        }
    };

    // --- Item Handlers ---
    const handleOpenDialog = (item?: CollectionItemData) => {
        if (item) {
            setCurrentItem(item);
        } else {
            setCurrentItem({
                title: "",
                category: "Masculino",
                image_url: "",
                product_reference: "",
                public: true,
                display_order: items.length + 1
            });
        }
        setIsDialogOpen(true);
    };

    const handleItemChange = (field: keyof CollectionItemData, value: any) => {
        if (!currentItem) return;
        setCurrentItem({ ...currentItem, [field]: value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadLandingImage(file);
            handleItemChange("image_url", url);
            toast({ title: "Upload concluído", description: "Imagem carregada com sucesso." });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro", description: "Falha no upload." });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveItem = async () => {
        if (!currentItem) return;

        setIsSavingItem(true);
        try {
            await saveCollectionItem(currentItem);
            toast({ title: "Item salvo", description: "O item foi atualizado na coleção." });
            setIsDialogOpen(false);
            loadData(); // Reload items
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar item." });
        } finally {
            setIsSavingItem(false);
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este item?")) return;

        try {
            await deleteCollectionItem(id);
            toast({ title: "Item excluído", description: "O item foi removido da coleção." });
            loadData();
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro", description: "Falha ao excluir item." });
        }
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (!configData) return <div>Erro ao carregar dados.</div>;

    return (
        <div className="space-y-8">
            {/* Config Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Configuração da Seção</CardTitle>
                    <CardDescription>Defina os títulos e textos da seção de coleção.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSaveConfig} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Título da Seção (Badge)</Label>
                                <Input value={configData.section_title || ""} onChange={(e) => handleConfigChange("section_title", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Nome da Coleção (Destaque)</Label>
                                <Input value={configData.section_subtitle || ""} onChange={(e) => handleConfigChange("section_subtitle", e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Nome Interno / Extra</Label>
                            <Input value={configData.collection_name || ""} onChange={(e) => handleConfigChange("collection_name", e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Textarea value={configData.description || ""} onChange={(e) => handleConfigChange("description", e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Texto do Botão (CTA)</Label>
                                <Input value={configData.collection_cta_text || ""} onChange={(e) => handleConfigChange("collection_cta_text", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Link do Botão</Label>
                                <Input value={configData.collection_cta_link || ""} onChange={(e) => handleConfigChange("collection_cta_link", e.target.value)} />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSavingConfig}>
                                {isSavingConfig ? "Salvando..." : "Salvar Configuração"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Items Grid */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Itens da Coleção</CardTitle>
                        <CardDescription>Gerencie os destaques exibidos na grade.</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="mr-2 h-4 w-4" /> Novo Item
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Ordem</TableHead>
                                <TableHead className="w-[100px]">Imagem</TableHead>
                                <TableHead>Título</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Referência</TableHead>
                                <TableHead>Visível</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center h-24">Nenhum item cadastrado.</TableCell></TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.display_order}</TableCell>
                                        <TableCell>
                                            <div className="w-12 h-16 bg-muted rounded overflow-hidden">
                                                {item.image_url && <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{item.title}</TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell>{item.product_reference || "-"}</TableCell>
                                        <TableCell>
                                            {item.public ? <span className="text-green-600 font-bold">Sim</span> : <span className="text-muted-foreground">Não</span>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(item)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => item.id && handleDeleteItem(item.id)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Item Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{currentItem?.id ? "Editar Item" : "Novo Item"}</DialogTitle>
                    </DialogHeader>

                    {currentItem && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Imagem</Label>
                                <div className="flex gap-4 items-start">
                                    <div className="relative w-32 h-40 bg-muted rounded-md overflow-hidden border shrink-0">
                                        {currentItem.image_url ? (
                                            <img src={currentItem.image_url} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Sem imagem</div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Input value={currentItem.image_url || ""} onChange={(e) => handleItemChange("image_url", e.target.value)} placeholder="URL da imagem" />
                                        <div className="flex flex-col gap-1">
                                            <Label className="text-xs text-muted-foreground">Ou faça upload do computador</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id="item-image-upload"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    disabled={isUploading}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => document.getElementById('item-image-upload')?.click()}
                                                    disabled={isUploading}
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    {isUploading ? 'Enviando...' : 'Selecionar Imagem'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Título</Label>
                                    <Input value={currentItem.title || ""} onChange={(e) => handleItemChange("title", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Categoria</Label>
                                    <Select value={currentItem.category} onValueChange={(val) => handleItemChange("category", val)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Masculino">Masculino</SelectItem>
                                            <SelectItem value="Feminino">Feminino</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Referência do Produto</Label>
                                    <Input value={currentItem.product_reference || ""} onChange={(e) => handleItemChange("product_reference", e.target.value)} placeholder="Ex: CAS-001" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Ordem de Exibição</Label>
                                    <Input type="number" value={currentItem.display_order || 0} onChange={(e) => handleItemChange("display_order", parseInt(e.target.value))} />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <Switch id="public-mode" checked={currentItem.public} onCheckedChange={(checked) => handleItemChange("public", checked)} />
                                <Label htmlFor="public-mode">Disponível Publicamente</Label>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={handleSaveItem} disabled={isSavingItem || isUploading}>
                                    {isSavingItem ? "Salvando..." : "Salvar Item"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
