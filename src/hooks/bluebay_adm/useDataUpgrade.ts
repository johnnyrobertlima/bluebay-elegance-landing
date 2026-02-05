
import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { bulkUpdateItems } from "@/service/bluebay_adm/itemManagementService";

// Define System Fields mapping options
// Key: System Field Name
// Label: User Friendly Name
// Type: 'string' | 'number' | 'boolean'
export const SYSTEM_FIELDS = [
    { key: "ITEM_CODIGO", label: "Código do Item (Chave)", required: true },
    { key: "DESCRICAO", label: "Descrição", required: false },
    { key: "PRECO", label: "Preço", required: false },
    { key: "GRU_CODIGO", label: "Código do Grupo", required: false },
    { key: "CODIGOAUX", label: "Código Auxiliar", required: false },
    { key: "CODIGO_RFID", label: "Código RFID", required: false },
    { key: "DUN14", label: "DUN14", required: false },
    { key: "ncm", label: "NCM", required: false },
    { key: "FOTO_PRODUTO", label: "URL Foto", required: false },
    { key: "URL_CATALOGO", label: "URL Catálogo", required: false },
    { key: "GRADE", label: "Grade", required: false },
    { key: "CORES", label: "Cores", required: false },
    { key: "QTD_CAIXA", label: "Qtd. Caixa", required: false },
];

export interface ColumnMapping {
    systemField: string;
    csvHeader: string;
}

export const useDataUpgrade = (onSuccess?: () => void) => {
    const [file, setFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [mappings, setMappings] = useState<Record<string, string>>({}); // System Field -> CSV Header
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const { toast } = useToast();

    const handleFileSelect = useCallback((selectedFile: File) => {
        setFile(selectedFile);
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                if (jsonData.length > 0) {
                    const fileHeaders = jsonData[0] as string[];
                    setHeaders(fileHeaders);
                    // Preview first 5 rows
                    const rows = jsonData.slice(1, 6).map((row: any) => {
                        const rowData: any = {};
                        fileHeaders.forEach((header, index) => {
                            rowData[header] = row[index];
                        });
                        return rowData;
                    });
                    setPreviewData(rows);

                    // Auto-map if headers match system fields (case insensitive)
                    const newMappings: Record<string, string> = {};
                    SYSTEM_FIELDS.forEach(field => {
                        const match = fileHeaders.find(h => h.toLowerCase() === field.key.toLowerCase() || h.toLowerCase() === field.label.toLowerCase());
                        if (match) {
                            newMappings[field.key] = match;
                        }
                    });
                    setMappings(newMappings);
                }
            } catch (error) {
                console.error("Error parsing file:", error);
                toast({
                    title: "Erro ao ler arquivo",
                    description: "Não foi possível processar o arquivo. Verifique se é um CSV ou Excel válido.",
                    variant: "destructive"
                });
            }
        };

        reader.readAsBinaryString(selectedFile);
    }, [toast]);

    const updateMapping = (systemField: string, csvHeader: string) => {
        setMappings(prev => ({
            ...prev,
            [systemField]: csvHeader
        }));
    };

    const processUpgrade = async () => {
        if (!file) return;

        // Validate mandatory fields
        const mandatoryFields = SYSTEM_FIELDS.filter(f => f.required);
        const missingMandatory = mandatoryFields.filter(f => !mappings[f.key] || mappings[f.key] === "ignore");

        if (missingMandatory.length > 0) {
            toast({
                title: "Mapeamento Incompleto",
                description: `Os seguintes campos são obrigatórios: ${missingMandatory.map(f => f.label).join(", ")}`,
                variant: "destructive"
            });
            return;
        }

        setIsProcessing(true);
        setProgress(0);

        try {
            // Promisify file reading
            const jsonData = await new Promise<any[]>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = e.target?.result;
                        const workbook = XLSX.read(data, { type: "binary" });
                        const sheet = workbook.Sheets[workbook.SheetNames[0]];
                        const json = XLSX.utils.sheet_to_json(sheet);
                        resolve(json);
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.onerror = (err) => reject(err);
                reader.readAsBinaryString(file);
            });

            // Transform data based on mapping
            const itemsToUpdate = jsonData.map((row: any) => {
                const item: any = {};
                Object.entries(mappings).forEach(([systemKey, fileHeader]) => {
                    if (fileHeader && fileHeader !== "ignore" && row[fileHeader] !== undefined) {
                        item[systemKey] = row[fileHeader];
                    }
                });
                return item;
            });

            // Send to service with progress callback
            const result = await bulkUpdateItems(itemsToUpdate, (p) => setProgress(p));

            if (result.errors.length > 0) {
                toast({
                    title: "Upgrade concluído com avisos",
                    description: `${result.success} itens atualizados. ${result.errors.length} erros encontrados. Verifique o console.`,
                    variant: "default"
                });
                console.warn("Update errors:", result.errors);
            } else {
                toast({
                    title: "Sucesso",
                    description: `${result.success} itens atualizados com sucesso.`,
                });
            }

            if (onSuccess) onSuccess();

        } catch (error: any) {
            console.error("Error processing upgrade:", error);
            toast({
                title: "Erro no processamento",
                description: error.message || "Ocorreu um erro ao atualizar os itens.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    const reset = () => {
        setFile(null);
        setHeaders([]);
        setPreviewData([]);
        setMappings({});
        setProgress(0);
    };

    return {
        file,
        headers,
        previewData,
        mappings,
        isProcessing,
        progress,
        handleFileSelect,
        updateMapping,
        processUpgrade,
        reset
    };
};
