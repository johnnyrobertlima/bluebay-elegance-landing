
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
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
    fetchCatalogs,
    saveCatalog,
    deleteCatalog,
    CatalogItemData,
    uploadLandingImage
} from "@/services/bluebay_adm/landingPageService";
import { Loader2, Plus, Edit, Trash2, FileText, ExternalLink, Upload } from "lucide-react";

export const CatalogEditor = () => {
    const [items, setItems] = useState<CatalogItemData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<CatalogItemData | null>(null);
    const [isSavingItem, setIsSavingItem] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isUploadingPdf, setIsUploadingPdf] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const data = await fetchCatalogs();
        setItems(data);
        setIsLoading(false);
    };

    // --- Item Handlers ---
    const handleOpenDialog = (item?: CatalogItemData) => {
        if (item) {
            setCurrentItem(item);
        } else {
            setCurrentItem({
                title: "",
                description: "",
                cover_image_url: "",
                pdf_url: "",
                link_url: "",
                active: true,
                display_order: items.length + 1
            });
        }
        setIsDialogOpen(true);
    };

    const handleItemChange = (field: keyof CatalogItemData, value: any) => {
        if (!currentItem) return;
        setCurrentItem({ ...currentItem, [field]: value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        try {
            const url = await uploadLandingImage(file);
            handleItemChange("cover_image_url", url);
            toast({ title: "Capa enviada", description: "Imagem de capa atualizada." });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro", description: "Falha no upload da imagem." });
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Simple validation
        if (file.type !== 'application/pdf') {
            toast({ variant: "destructive", title: "Formato inválido", description: "Por favor envie um arquivo PDF." });
            return;
        }

        setIsUploadingPdf(true);
        try {
            const url = await uploadLandingImage(file); // Reusing generic upload for PDF
            handleItemChange("pdf_url", url);
            toast({ title: "PDF enviado", description: "Arquivo de catálogo atualizado." });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro", description: "Falha no upload do PDF." });
        } finally {
            setIsUploadingPdf(false);
        }
    };

    const handleSaveItem = async () => {
        if (!currentItem) return;

        setIsSavingItem(true);
        try {
            await saveCatalog(currentItem);
            toast({ title: "Catálogo salvo", description: "O catálogo foi atualizado." });
            setIsDialogOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar catálogo." });
        } finally {
            setIsSavingItem(false);
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este catálogo?")) return;

        try {
            await deleteCatalog(id);
            toast({ title: "Catálogo excluído", description: "O catálogo foi removido." });
            loadData();
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro", description: "Falha ao excluir catálogo." });
        }
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Gerenciamento de Catálogos</CardTitle>
                        <CardDescription>Cadastre os catálogos disponíveis para download (PDF).</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="mr-2 h-4 w-4" /> Novo Catálogo
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Ordem</TableHead>
                                <TableHead className="w-[100px]">Capa</TableHead>
                                <TableHead>Título</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Arquivo</TableHead>
                                <TableHead>Ativo</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center h-24">Nenhum catálogo cadastrado.</TableCell></TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.display_order}</TableCell>
                                        <TableCell>
                                            <div className="w-12 h-16 bg-muted rounded overflow-hidden">
                                                {item.cover_image_url && <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover" />}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{item.title}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">{item.description}</TableCell>
                                        <TableCell>
                                            {item.pdf_url ? (
                                                <a href={item.pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline text-sm">
                                                    <FileText className="h-4 w-4 mr-1" /> PDF
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {item.active ? <span className="text-green-600 font-bold">Sim</span> : <span className="text-muted-foreground">Não</span>}
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
                        <DialogTitle>{currentItem?.id ? "Editar Catálogo" : "Novo Catálogo"}</DialogTitle>
                    </DialogHeader>

                    {currentItem && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Capa do Catálogo</Label>
                                    <div className="relative w-full aspect-[3/4] bg-muted rounded-md overflow-hidden border">
                                        {currentItem.cover_image_url ? (
                                            <img src={currentItem.cover_image_url} alt="Capa" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Sem capa</div>
                                        )}
                                        <div className="absolute bottom-2 right-2 left-2">
                                            <Label htmlFor="cover-upload" className="cursor-pointer bg-white/90 hover:bg-white text-black text-xs py-1 px-2 rounded shadow block text-center">
                                                {isUploadingImage ? "Enviando..." : "Alterar Capa"}
                                            </Label>
                                            <Input
                                                id="cover-upload"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={isUploadingImage}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Título</Label>
                                        <Input value={currentItem.title || ""} onChange={(e) => handleItemChange("title", e.target.value)} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Descrição</Label>
                                        <Textarea
                                            value={currentItem.description || ""}
                                            onChange={(e) => handleItemChange("description", e.target.value)}
                                            rows={4}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Arquivo PDF</Label>
                                        <div className="flex gap-2">
                                            <Input value={currentItem.pdf_url || ""} onChange={(e) => handleItemChange("pdf_url", e.target.value)} placeholder="URL do PDF" />
                                            {currentItem.pdf_url && (
                                                <a href={currentItem.pdf_url} target="_blank" rel="noopener noreferrer">
                                                    <Button type="button" variant="outline" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                                                </a>
                                            )}
                                        </div>
                                        <div className="pt-1">
                                            <Label htmlFor="pdf-upload" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 w-full">
                                                <Upload className="h-4 w-4 mr-2" />
                                                {isUploadingPdf ? "Carregando PDF..." : "Fazer Upload do PDF"}
                                            </Label>
                                            <Input
                                                id="pdf-upload"
                                                type="file"
                                                className="hidden"
                                                accept="application/pdf"
                                                onChange={handlePdfUpload}
                                                disabled={isUploadingPdf}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Link Extra (Opcional)</Label>
                                    <Input value={currentItem.link_url || ""} onChange={(e) => handleItemChange("link_url", e.target.value)} placeholder="URL externa" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Ordem de Exibição</Label>
                                    <Input type="number" value={currentItem.display_order || 0} onChange={(e) => handleItemChange("display_order", parseInt(e.target.value))} />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <Switch id="active-mode" checked={currentItem.active} onCheckedChange={(checked) => handleItemChange("active", checked)} />
                                <Label htmlFor="active-mode">Catálogo Ativo</Label>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={handleSaveItem} disabled={isSavingItem || isUploadingImage || isUploadingPdf}>
                                    {isSavingItem ? "Salvando..." : "Salvar Catálogo"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
