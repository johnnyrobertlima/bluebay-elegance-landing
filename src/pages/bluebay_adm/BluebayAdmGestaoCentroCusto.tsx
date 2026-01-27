import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Search, Wallet, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CostCenter {
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at?: string;
}

const BluebayAdmGestaoCentroCusto = () => {
    const { toast } = useToast();
    const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCC, setSelectedCC] = useState<CostCenter | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        is_active: true,
    });

    useEffect(() => {
        loadCostCenters();
    }, []);

    const loadCostCenters = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await (supabase as any)
                .from("bluebay_cost_center")
                .select("*")
                .order("name");

            if (error) throw error;
            setCostCenters(data || []);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao carregar centros de custo",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = (cc?: CostCenter) => {
        if (cc) {
            setSelectedCC(cc);
            setFormData({
                name: cc.name,
                description: cc.description || "",
                is_active: cc.is_active,
            });
        } else {
            setSelectedCC(null);
            setFormData({
                name: "",
                description: "",
                is_active: true,
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast({
                variant: "destructive",
                title: "Campo obrigatório",
                description: "O nome do centro de custo é necessário.",
            });
            return;
        }

        try {
            setIsSaving(true);
            const dataToSave = {
                name: formData.name,
                description: formData.description || null,
                is_active: formData.is_active,
            };

            if (selectedCC) {
                const { error } = await (supabase as any)
                    .from("bluebay_cost_center")
                    .update(dataToSave)
                    .eq("id", selectedCC.id);
                if (error) throw error;
                toast({ title: "Centro de custo atualizado com sucesso!" });
            } else {
                const { error } = await (supabase as any)
                    .from("bluebay_cost_center")
                    .insert(dataToSave);
                if (error) throw error;
                toast({ title: "Centro de custo cadastrado com sucesso!" });
            }

            setIsDialogOpen(false);
            loadCostCenters();
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

    const filteredCC = costCenters.filter(
        (cc) =>
            cc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cc.description && cc.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Wallet className="h-8 w-8 text-primary" />
                        Gestão de Centro de Custo
                    </h1>
                    <p className="text-muted-foreground">Cadastre e gerencie os centros de custo disponíveis no sistema</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Centro de Custo
                </Button>
            </div>

            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou descrição..."
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
                                <TableHead>Descrição</TableHead>
                                <TableHead className="w-[100px]">Status</TableHead>
                                <TableHead className="w-[100px] text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredCC.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                        Nenhum centro de custo encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCC.map((cc) => (
                                    <TableRow key={cc.id}>
                                        <TableCell className="font-semibold">{cc.name}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{cc.description || "-"}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-[10px] ${cc.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {cc.is_active ? "Ativo" : "Inativo"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(cc)}>
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
                        <DialogTitle>{selectedCC ? "Editar Centro de Custo" : "Novo Centro de Custo"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome do Centro de Custo</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: COMERCIAL, PRODUÇÃO, ADM"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Breve descrição do centro de custo..."
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                            />
                            <Label htmlFor="is_active">Centro de Custo Ativo</Label>
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

export default BluebayAdmGestaoCentroCusto;
