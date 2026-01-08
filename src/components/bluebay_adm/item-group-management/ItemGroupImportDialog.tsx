
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Upload } from "lucide-react";
import * as XLSX from 'xlsx';

interface ItemGroupImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
}

export const ItemGroupImportDialog = ({
  isOpen,
  onClose,
  onImport
}: ItemGroupImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Selecione um arquivo Excel (.xlsx) para importar");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await readExcelFile(file);
      if (!validateData(data)) {
        setError("O arquivo importado não possui o formato esperado. Verifique o modelo.");
        setIsLoading(false);
        return;
      }

      await onImport(data);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onClose();
    } catch (err: any) {
      setError(`Erro ao importar: ${err.message || "Ocorreu um erro desconhecido"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(json);
        } catch (error) {
          reject(new Error("Falha ao ler o arquivo Excel"));
        }
      };
      reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
      reader.readAsBinaryString(file);
    });
  };

  const validateData = (data: any[]): boolean => {
    if (!data || data.length === 0) return false;
    
    // Check if the expected columns exist in the first row
    const firstRow = data[0];
    return (
      'GRU_CODIGO' in firstRow && 
      'GRU_DESCRICAO' in firstRow && 
      'empresa' in firstRow
    );
  };

  const downloadTemplate = () => {
    const template = [
      {
        GRU_CODIGO: 'CODIGO001',
        GRU_DESCRICAO: 'Exemplo de Descrição',
        empresa: 'Bluebay',
        ativo: true
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template_grupos.xlsx');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Grupos</DialogTitle>
          <DialogDescription>
            Selecione um arquivo Excel (.xlsx) para importar grupos.
            O arquivo deve conter as colunas: GRU_CODIGO, GRU_DESCRICAO, empresa e ativo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="file-upload" 
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Clique para selecionar</span> ou arraste o arquivo
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Excel (.xlsx)</p>
              </div>
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                accept=".xlsx" 
                onChange={handleFileChange} 
                ref={fileInputRef}
              />
            </label>
          </div>
          
          {file && (
            <div className="text-sm text-center">
              Arquivo selecionado: <span className="font-semibold">{file.name}</span>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="text-sm text-center">
            <Button variant="link" onClick={downloadTemplate} className="p-0">
              Baixar modelo de importação
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!file || isLoading}>
            {isLoading ? "Importando..." : "Importar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
