
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileSpreadsheet, AlertCircle, Loader2, Check } from "lucide-react";
import { SYSTEM_FIELDS, useDataUpgrade } from "@/hooks/bluebay_adm/useDataUpgrade";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface DataUpgradeDialogProps {
    files?: FileList | null; // Optional if we want to pass file directly later
    onSuccess?: () => void;
}

export const DataUpgradeDialog = ({ onSuccess }: DataUpgradeDialogProps) => {
    const [open, setOpen] = useState(false);
    const {
        file,
        headers,
        mappings,
        isProcessing,
        progress,
        handleFileSelect,
        updateMapping,
        processUpgrade,
        reset
    } = useDataUpgrade(() => {
        setOpen(false);
        reset();
        if (onSuccess) onSuccess();
    });

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            reset();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upgrade de Dados (CSV)
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Atualização em Massa de Itens</DialogTitle>
                    <DialogDescription>
                        Faça upload de uma planilha para atualizar dados dos itens. O código do item será usado como chave.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-6 py-4">
                    {!file ? (
                        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
                            onClick={() => document.getElementById('upgrade-file-upload')?.click()}>
                            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium">Clique para selecionar um arquivo</p>
                            <p className="text-sm text-muted-foreground">Suporta .xlsx e .csv</p>
                            <input
                                id="upgrade-file-upload"
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                                }}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className="h-8 w-8 text-green-600" />
                                    <div>
                                        <p className="font-medium">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={reset}>Trocar arquivo</Button>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    Mapeamento de Colunas
                                    <Badge variant="outline" className="text-xs font-normal">
                                        Mapeie as colunas do seu arquivo para os campos do sistema
                                    </Badge>
                                </h3>

                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[200px]">Campo do Sistema</TableHead>
                                                <TableHead>Coluna no Arquivo</TableHead>
                                                <TableHead className="w-[50px]">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {SYSTEM_FIELDS.map((field) => (
                                                <TableRow key={field.key}>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{field.label}</span>
                                                            <span className="text-xs text-muted-foreground">{field.key}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={mappings[field.key] || "ignore"}
                                                            onValueChange={(value) => updateMapping(field.key, value)}
                                                        >
                                                            <SelectTrigger className={mappings[field.key] && mappings[field.key] !== 'ignore' ? "border-green-500 bg-green-50" : ""}>
                                                                <SelectValue placeholder="Ignorar" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="ignore">-- Ignorar (Não alterar) --</SelectItem>
                                                                {headers.map((header) => (
                                                                    <SelectItem key={header} value={header}>{header}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        {field.required && (!mappings[field.key] || mappings[field.key] === "ignore") ? (
                                                            <AlertCircle className="h-4 w-4 text-destructive" />
                                                        ) : mappings[field.key] && mappings[field.key] !== "ignore" ? (
                                                            <Check className="h-4 w-4 text-green-600" />
                                                        ) : null}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t mt-auto w-full">
                    {isProcessing && (
                        <div className="w-full space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Processando...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={isProcessing}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={processUpgrade}
                            disabled={!file || isProcessing}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                "Processar Atualização"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
