import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { toast } from "sonner";
import { Printer, Eye } from "lucide-react";

// Constantes de dimensão da etiqueta (em mm)
const LABEL_WIDTH_MM = 100;
const LABEL_HEIGHT_MM = 50;

interface EtiquetaData {
  nomeProduto: string;
  referencia: string;
  quantidade: number;
  codigo: string;
}

export default function BluebayAdmEtiquetas() {
  const [etiquetaData, setEtiquetaData] = useState<EtiquetaData>({
    nomeProduto: '',
    referencia: '',
    quantidade: 1,
    codigo: ''
  });
  
  const [zplString, setZplString] = useState('');
  const [previewReady, setPreviewReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const gerarZpl = () => {
    const { nomeProduto, referencia, quantidade, codigo } = etiquetaData;
    
    if (!nomeProduto || !referencia) {
      toast.error("Preencha pelo menos o nome do produto e a referência");
      return;
    }

    // Converter mm para dots (8 dots per mm é comum para impressoras Zebra)
    const widthDots = LABEL_WIDTH_MM * 8;
    const heightDots = LABEL_HEIGHT_MM * 8;

    const zpl = `^XA
^PW${widthDots}
^LL${heightDots}
^FO20,20^A0N,30,30^FD${nomeProduto}^FS
^FO20,60^A0N,25,25^FDRef: ${referencia}^FS
${codigo ? `^FO20,100^BCN,50,Y,N,N^FD${codigo}^FS` : ''}
^PQ${quantidade}
^XZ`;

    setZplString(zpl);
    setPreviewReady(true);
    toast.success("ZPL gerado com sucesso!");
  };

  const imprimir = async () => {
    if (!zplString) {
      toast.error("Gere o ZPL primeiro antes de imprimir");
      return;
    }

    setIsLoading(true);
    
    try {
      // Importação dinâmica da biblioteca
      const ZebraBrowserPrintWrapper = (await import('zebra-browser-print-wrapper')).default;
      const zebra = new ZebraBrowserPrintWrapper();
      
      // Obter impressora padrão
      const printer = await zebra.getDefaultPrinter();
      
      if (!printer) {
        toast.error("Nenhuma impressora Zebra encontrada. Verifique se o Zebra Browser Print está instalado e rodando.");
        return;
      }
      
      zebra.setPrinter(printer);
      
      // Verificar status da impressora
      const status = await zebra.checkPrinterStatus();
      
      if (status.isReadyToPrint) {
        await zebra.print(zplString);
        toast.success("Etiqueta enviada para impressão com sucesso!");
      } else {
        const errors = Array.isArray(status.errors) ? status.errors : [status.errors || "Status desconhecido"];
        toast.error(`Erro na impressora: ${errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Erro na impressão:', error);
      toast.error("Erro ao conectar com a impressora. Verifique se o Zebra Browser Print está instalado e rodando.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof EtiquetaData, value: string | number) => {
    setEtiquetaData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <BluebayAdmMenu />
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Etiquetas do Produto</h1>
        <div className="text-sm text-muted-foreground">
          Dimensões: {LABEL_WIDTH_MM}mm x {LABEL_HEIGHT_MM}mm
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de configuração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Configuração da Etiqueta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeProduto">Nome do Produto *</Label>
              <Input
                id="nomeProduto"
                value={etiquetaData.nomeProduto}
                onChange={(e) => updateField('nomeProduto', e.target.value)}
                placeholder="Digite o nome do produto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referencia">Referência *</Label>
              <Input
                id="referencia"
                value={etiquetaData.referencia}
                onChange={(e) => updateField('referencia', e.target.value)}
                placeholder="Digite a referência do produto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo">Código de Barras/QR (opcional)</Label>
              <Input
                id="codigo"
                value={etiquetaData.codigo}
                onChange={(e) => updateField('codigo', e.target.value)}
                placeholder="Digite o código para o código de barras"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade de Etiquetas</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={etiquetaData.quantidade}
                onChange={(e) => updateField('quantidade', parseInt(e.target.value) || 1)}
              />
            </div>

            <Button 
              onClick={gerarZpl} 
              className="w-full"
              variant="outline"
            >
              <Eye className="h-4 w-4 mr-2" />
              Gerar ZPL & Pré-visualizar
            </Button>
          </CardContent>
        </Card>

        {/* Pré-visualização e impressão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Pré-visualização ZPL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {previewReady ? (
              <>
                <div className="space-y-2">
                  <Label>Código ZPL Gerado:</Label>
                  <Textarea
                    value={zplString}
                    readOnly
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pré-visualização da Etiqueta:</Label>
                  <div 
                    className="border border-dashed border-muted-foreground p-4 bg-muted/20 rounded-md"
                    style={{
                      width: `${LABEL_WIDTH_MM * 2}px`,
                      height: `${LABEL_HEIGHT_MM * 2}px`,
                      maxWidth: '100%'
                    }}
                  >
                    <div className="text-sm font-semibold">{etiquetaData.nomeProduto}</div>
                    <div className="text-xs mt-1">Ref: {etiquetaData.referencia}</div>
                    {etiquetaData.codigo && (
                      <div className="text-xs mt-2 font-mono bg-black text-white px-1 inline-block">
                        ||||| {etiquetaData.codigo} |||||
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={imprimir}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {isLoading ? "Imprimindo..." : "Imprimir Etiqueta"}
                </Button>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Configure os dados da etiqueta e clique em "Gerar ZPL" para visualizar
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instruções</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Certifique-se de que o Zebra Browser Print está instalado e rodando</p>
          <p>• A impressora deve estar conectada e configurada como padrão</p>
          <p>• As dimensões da etiqueta são: {LABEL_WIDTH_MM}mm x {LABEL_HEIGHT_MM}mm</p>
          <p>• O código de barras é opcional e será gerado automaticamente se preenchido</p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}