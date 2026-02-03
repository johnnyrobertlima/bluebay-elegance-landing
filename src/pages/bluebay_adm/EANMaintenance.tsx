import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eanService } from "@/service/bluebay_adm/eanService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText, Search, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EANMaintenance() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [page, setPage] = useState(1);
    const [pageSize] = useState(50);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [previewEans, setPreviewEans] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Fetch eans
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["eans", page, statusFilter, search],
        queryFn: () => eanService.fetchEans(page, pageSize, statusFilter, search),
        keepPreviousData: true
    });

    // Upload mutation
    const uploadMutation = useMutation({
        mutationFn: (eans: string[]) => eanService.uploadEans(eans),
        onSuccess: (result) => {
            toast({
                title: "Importação concluída",
                description: `${result.successCount} EANs processados.`,
                variant: result.errors.length > 0 ? "destructive" : "default"
            });
            setIsUploadOpen(false);
            setUploadFile(null);
            setPreviewEans([]);
            queryClient.invalidateQueries({ queryKey: ["eans"] });
        },
        onError: (error: any) => {
            console.error("Upload error:", error);
            toast({
                variant: "destructive",
                title: "Erro na importação",
                description: error.message || "Falha ao enviar os dados."
            });
        },
        onSettled: () => {
            setIsUploading(false);
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== "text/plain") {
                toast({
                    variant: "destructive",
                    title: "Arquivo inválido",
                    description: "Por favor, selecione um arquivo .txt"
                });
                return;
            }
            setUploadFile(file);

            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                // Split by new lines, trim, filter empty and non-numeric (simple check)
                const lines = text.split(/\r?\n/)
                    .map(line => line.trim())
                    .filter(line => line.length > 0 && /^\d+$/.test(line));

                // Basic EAN-13 validation (13 digits)
                const validEans = lines.filter(line => line.length === 13);

                setPreviewEans(validEans);

                if (lines.length !== validEans.length) {
                    toast({
                        variant: "warning",
                        title: "Aviso",
                        description: `${lines.length - validEans.length} linhas ignoradas (formato inválido). Apenas 13 dígitos numéricos.`
                    });
                }
            };
            reader.readAsText(file);
        }
    };

    const handleUploadConfirm = () => {
        if (previewEans.length === 0) return;
        setIsUploading(true);
        uploadMutation.mutate(previewEans);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Manutenção de EAN13</h1>
                    <p className="text-muted-foreground">
                        Gerencie e importe códigos de barras EAN-13 para uso nos produtos.
                    </p>
                </div>
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Upload className="mr-2 h-4 w-4" />
                            Importar EANs (.txt)
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Importar Arquivo de EANs</DialogTitle>
                            <DialogDescription>
                                Selecione um arquivo de texto (.txt) contendo um código EAN por linha.
                                Códigos duplicados serão ignorados.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div
                                className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                                {uploadFile ? (
                                    <div className="text-center">
                                        <p className="font-medium">{uploadFile.name}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {previewEans.length} códigos válidos encontrados
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        <p>Clique para selecionar o arquivo</p>
                                        <p className="text-xs mt-1">Apenas arquivos .txt</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".txt"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancelar</Button>
                            <Button onClick={handleUploadConfirm} disabled={!uploadFile || previewEans.length === 0 || isUploading}>
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Importando...
                                    </>
                                ) : (
                                    "Confirmar Importação"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
                <div className="flex gap-2 items-center flex-1 w-full">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar EAN ou Código do Item..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Status</SelectItem>
                            <SelectItem value="DISPONIVEL">Disponível</SelectItem>
                            <SelectItem value="EM_USO">Em Uso</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => queryClient.invalidateQueries({ queryKey: ["eans"] })}>
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                    Total: {data?.count || 0} registros
                </div>
            </div>

            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>EAN</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Produto Vinculado</TableHead>
                            <TableHead>Data Cadastro</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : data?.data && data.data.length > 0 ? (
                            data.data.map((ean) => (
                                <TableRow key={ean.EAN}>
                                    <TableCell className="font-medium font-mono">{ean.EAN}</TableCell>
                                    <TableCell>
                                        <Badge variant={ean.STATUS === "DISPONIVEL" ? "secondary" : "default"}>
                                            {ean.STATUS}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {ean.ITEM_CODIGO ? (
                                            <div className="flex flex-col">
                                                <span className="font-medium">{ean.ITEM_CODIGO}</span>
                                                <span className="text-xs text-muted-foreground line-clamp-1">
                                                    {ean.BLUEBAY_ITEM?.DESCRICAO || "Descrição indisponível"}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(ean.DATA_CADASTRO).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    Nenhum registro encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Simple Pagination Controls */}
            <div className="flex justify-end gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                >
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={!data?.count || page * pageSize >= data.count}
                >
                    Próxima
                </Button>
            </div>
        </div>
    );
}
