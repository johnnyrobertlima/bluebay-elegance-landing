import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Search, Layout, ChevronRight, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SystemPage {
    id: string;
    name: string;
    path: string;
    icon: string | null;
    parent_id: string | null;
    is_active: boolean;
    created_at?: string;
}

const BluebayAdmGestaoPaginas = () => {
    const { toast } = useToast();
    const [pages, setPages] = useState<SystemPage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPage, setSelectedPage] = useState<SystemPage | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        path: "",
        icon: "",
        parent_id: "none",
        is_active: true,
    });

    useEffect(() => {
        loadPages();
    }, []);

    const loadPages = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await (supabase as any)
                .from("bluebay_system_page")
                .select("*")
                .order("name");

            if (error) throw error;
            setPages(data || []);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao carregar páginas",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = (page?: SystemPage) => {
        if (page) {
            setSelectedPage(page);
            setFormData({
                name: page.name,
                path: page.path,
                icon: page.icon || "",
                parent_id: page.parent_id || "none",
                is_active: page.is_active,
            });
        } else {
            setSelectedPage(null);
            setFormData({
                name: "",
                path: "",
                icon: "",
                parent_id: "none",
                is_active: true,
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.path) {
            toast({
                variant: "destructive",
                title: "Campos obrigatórios",
                description: "Nome e Caminho são necessários.",
            });
            return;
        }

        try {
            setIsSaving(true);
            const dataToSave = {
                name: formData.name,
                path: formData.path,
                icon: formData.icon || null,
                parent_id: formData.parent_id === "none" ? null : formData.parent_id,
                is_active: formData.is_active,
            };

            if (selectedPage) {
                const { error } = await (supabase as any)
                    .from("bluebay_system_page")
                    .update(dataToSave)
                    .eq("id", selectedPage.id);
                if (error) throw error;
                toast({ title: "Página atualizada com sucesso!" });
            } else {
                const { error } = await (supabase as any)
                    .from("bluebay_system_page")
                    .insert(dataToSave);
                if (error) throw error;
                toast({ title: "Página cadastrada com sucesso!" });
            }

            setIsDialogOpen(false);
            loadPages();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao salvar",
                description: error.message,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const filteredPages = pages.filter(
        (page) =>
            page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            page.path.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getParentName = (parentId: string | null) => {
        if (!parentId) return "-";
        const parent = pages.find((p) => p.id === parentId);
        return parent ? parent.name : "-";
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Layout className="h-8 w-8 text-primary" />
                        Gestão de Páginas
                    </h1>
                    <p className="text-muted-foreground">Registre todas as rotas e organize a hierarquia do menu</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Página
                </Button>
            </div>

            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou caminho..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Caminho (Path)</TableHead>
                                <TableHead>Item Pai</TableHead>
                                <TableHead className="w-[100px]">Status</TableHead>
                                <TableHead className="w-[100px] text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredPages.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        Nenhuma página encontrada.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPages.map((page) => (
                                    <TableRow key={page.id} className={!page.parent_id ? "bg-muted/30 font-semibold" : ""}>
                                        <TableCell className="flex items-center gap-2">
                                            {page.parent_id && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                                            <div className="flex items-center gap-2">
                                                {page.icon && <span className="text-muted-foreground text-xs">[{page.icon}]</span>}
                                                {page.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{page.path}</TableCell>
                                        <TableCell>{getParentName(page.parent_id)}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-[10px] ${page.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {page.is_active ? "Ativo" : "Inativo"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(page)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedPage ? "Editar Página" : "Nova Página"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome da Página</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Dashboard Comercial"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="path">Caminho (URL Path)</Label>
                            <Input
                                id="path"
                                value={formData.path}
                                onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                                placeholder="Ex: /client-area/bluebay_adm/dashboard"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="icon">Ícone (Nome Lucide)</Label>
                            <Input
                                id="icon"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                placeholder="Ex: BarChart, Users, Settings"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="parent">Item Pai (Para Menu)</Label>
                            <Select
                                value={formData.parent_id}
                                onValueChange={(v) => setFormData({ ...formData, parent_id: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o pai..." />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-950">
                                    <SelectItem value="none">Nenhum (Item Raiz)</SelectItem>
                                    {pages
                                        .filter((p) => !p.parent_id && p.id !== selectedPage?.id)
                                        .map((p) => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                            />
                            <Label htmlFor="is_active">Página Ativa</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BluebayAdmGestaoPaginas;
