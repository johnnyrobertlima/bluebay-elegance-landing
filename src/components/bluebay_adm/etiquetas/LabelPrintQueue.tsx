import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchItems, getItemWithMatrizFilial } from '@/service/bluebay_adm/itemManagementService';
import { fetchActiveLayout, LabelLayout } from '@/service/bluebay_adm/labelLayoutService';
import { generateZPL } from '@/utils/zplGenerator';
import { toast } from 'sonner';
import { Printer, Search, Trash, Play, Plus, Settings, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getPrinterConfig, savePrinterConfig, sendZplToPrinter } from '@/service/bluebay_adm/printerService';
import { Label } from '@/components/ui/label';

interface QueueItem {
    id: string; // Unique ID for queue
    item: any;
    quantity: number;
}

export function LabelPrintQueue() {
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [activeLayout, setActiveLayout] = useState<LabelLayout | null>(null);
    const [zplOutput, setZplOutput] = useState<string>('');
    const [showZplDialog, setShowZplDialog] = useState(false);
    const [showConfigDialog, setShowConfigDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [printerConfig, setPrinterConfig] = useState(getPrinterConfig());

    useEffect(() => {
        loadActiveLayout();
    }, []);

    const loadActiveLayout = async () => {
        try {
            const layout = await fetchActiveLayout();
            setActiveLayout(layout);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearch = async () => {
        if (!search.trim()) return;
        setIsLoading(true);
        try {
            const { items } = await fetchItems(1, 20, [search]);
            setSearchResults(items);
        } catch (e) { toast.error("Erro na busca"); }
        setIsLoading(false);
    };

    const addToQueue = (item: any) => {
        setQueue(prev => [...prev, {
            id: Math.random().toString(36),
            item,
            quantity: 1
        }]);
        // Previously cleared search here. Now kept active per user request.
    };

    const handleClearSearch = () => {
        setSearchResults([]);
        setSearch('');
    };

    const removeFromQueue = (id: string) => {
        setQueue(prev => prev.filter(q => q.id !== id));
    };

    const updateQuantity = (id: string, qty: number) => {
        if (qty < 1) return;
        setQueue(prev => prev.map(q => q.id === id ? { ...q, quantity: qty } : q));
    };

    const handlePrint = async () => {
        if (!activeLayout) {
            toast.error("Nenhum layout ativo selecionado. Configure na aba Layout.");
            return;
        }

        if (queue.length === 0) {
            toast.error("Fila vazia.");
            return;
        }

        const itemsToPrint: any[] = [];
        queue.forEach(qItem => {
            for (let i = 0; i < qItem.quantity; i++) {
                itemsToPrint.push(qItem.item);
            }
        });

        const zpl = await generateZPL(activeLayout, itemsToPrint, {
            dpi: printerConfig.dpi || 203,
            offsetLeft: Number(printerConfig.offsetLeft) || 0,
            offsetTop: Number(printerConfig.offsetTop) || 0
        });

        try {
            await sendZplToPrinter(zpl);
        } catch (error) {
            // Fallback to viewing Code if error
            setZplOutput(zpl);
            setShowZplDialog(true);
        }
    };

    const handleSaveConfig = () => {
        savePrinterConfig(printerConfig);
        setShowConfigDialog(false);
        toast.success("Configuração salva");
    };

    const handleCalibrate = async () => {
        // Sends ~JC (Set Media Sensor Calibration) and ~TA (Tear-off) reset potentially? 
        // ~JC is standard for auto-measuring label length.
        // We wrap in common ZPL structure just in case.
        const zpl = "~JC^XA^JUS^XZ";

        try {
            await sendZplToPrinter(zpl);
            toast.success("Comando de Calibração Enviado. A impressora deve avançar algumas etiquetas.");
        } catch (e) {
            toast.error("Erro ao enviar comando de calibração.");
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(zplOutput);
        toast.success("Copiado para área de transferência");
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            {/* Search Panel */}
            <div className="md:col-span-1 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Adicionar Produtos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Buscar Produto (nome, código...)"
                                value={search} onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch} disabled={isLoading}>
                                <Search className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" onClick={handleClearSearch} title="Limpar Busca" disabled={!search && searchResults.length === 0}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="max-h-[500px] overflow-y-auto space-y-2">
                            {searchResults.map(item => (
                                <div key={item.ITEM_CODIGO} className="p-2 border rounded hover:bg-accent cursor-pointer flex justify-between items-center" onClick={() => addToQueue(item)}>
                                    <div>
                                        <div className="font-semibold">{item.ITEM_CODIGO}</div>
                                        <div className="text-sm line-clamp-1">{item.DESCRICAO}</div>
                                    </div>
                                    <Button size="sm" variant="ghost"><Plus className="h-4 w-4" /></Button>
                                </div>
                            ))}
                            {search && searchResults.length === 0 && !isLoading && (
                                <p className="text-center text-muted-foreground p-4">Nenhum resultado</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Queue Panel */}
            <div className="md:col-span-2 space-y-4">
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Fila de Impressão</CardTitle>
                        <div className="space-x-2 flex items-center">
                            <Button variant="outline" size="icon" onClick={() => setShowConfigDialog(true)} title="Configurar Impressora">
                                <Settings className="h-4 w-4" />
                            </Button>
                            <Badge variant={activeLayout ? 'default' : 'destructive'}>
                                Layout: {activeLayout ? activeLayout.name : 'Nenhum Ativo'}
                            </Badge>
                            <Button onClick={handlePrint} disabled={queue.length === 0}>
                                <Printer className="mr-2 h-4 w-4" /> Imprimir ({queue.reduce((acc, q) => acc + q.quantity, 0)})
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead className="w-[100px]">Qtd</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {queue.map(q => (
                                    <TableRow key={q.id}>
                                        <TableCell className="font-medium">{q.item.ITEM_CODIGO}</TableCell>
                                        <TableCell>{q.item.DESCRICAO}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={q.quantity}
                                                onChange={e => updateQuantity(q.id, Number(e.target.value))}
                                                className="h-8 w-20"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeFromQueue(q.id)}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {queue.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                            A fila está vazia. Adicione produtos.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Printer Config Dialog */}
            <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Configuração da Impressora</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tipo de Conexão</Label>
                            <Card className="p-4 border">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="local"
                                            name="connection"
                                            className="h-4 w-4"
                                            checked={printerConfig.useLocalService}
                                            onChange={() => setPrinterConfig({ ...printerConfig, useLocalService: true })}
                                        />
                                        <Label htmlFor="local" className="font-normal cursor-pointer">
                                            Serviço Local (Localhost:9100) <br />
                                            <span className="text-xs text-muted-foreground">Requer Zebra Browser Print ou Proxy Local</span>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="network"
                                            name="connection"
                                            className="h-4 w-4"
                                            checked={!printerConfig.useLocalService}
                                            onChange={() => setPrinterConfig({ ...printerConfig, useLocalService: false })}
                                        />
                                        <Label htmlFor="network" className="font-normal cursor-pointer">
                                            Impressora de Rede (IP Direto) <br />
                                            <span className="text-xs text-muted-foreground">Requer IP acessível da rede local</span>
                                        </Label>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2 space-y-2">
                                <Label>IP / Host</Label>
                                <Input value={printerConfig.ip} onChange={e => setPrinterConfig({ ...printerConfig, ip: e.target.value })} placeholder="localhost ou 192.168.x.x" />
                            </div>
                            <div className="space-y-2">
                                <Label>Porta</Label>
                                <Input value={printerConfig.port} onChange={e => setPrinterConfig({ ...printerConfig, port: e.target.value })} placeholder="9100" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Resolução (DPI)</Label>
                            <select
                                className="w-full p-2 border rounded text-sm bg-background"
                                value={printerConfig.dpi || 203}
                                onChange={e => setPrinterConfig({ ...printerConfig, dpi: Number(e.target.value) })}
                            >
                                <option value={203}>203 DPI (Padrão Zebra)</option>
                                <option value={300}>300 DPI (Alta Resolução)</option>
                                <option value={600}>600 DPI (Ultra Alta)</option>
                            </select>
                            <p className="text-xs text-muted-foreground">
                                Se a impressão sair muito pequena, aumente para 300 ou 600 DPI.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                            <div className="space-y-2">
                                <Label>Margem Superior (mm)</Label>
                                <Input
                                    type="number"
                                    value={printerConfig.offsetTop}
                                    onChange={e => setPrinterConfig({ ...printerConfig, offsetTop: Number(e.target.value) })}
                                    placeholder="0"
                                />
                                <p className="text-[10px] text-muted-foreground">Positivo = Desce / Negativo = Sobe</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Margem Esquerda (mm)</Label>
                                <Input
                                    type="number"
                                    value={printerConfig.offsetLeft}
                                    onChange={e => setPrinterConfig({ ...printerConfig, offsetLeft: Number(e.target.value) })}
                                    placeholder="0"
                                />
                                <p className="text-[10px] text-muted-foreground">Positivo = Direita / Negativo = Esq</p>
                            </div>
                        </div>



                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleCalibrate} className="w-1/3 border-orange-200 hover:bg-orange-50 text-orange-700" title="Executar Calibração de Mídia">
                                🛠️ Calibrar
                            </Button>
                            <Button onClick={handleSaveConfig} className="w-2/3">Salvar Configuração</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ZPL Fallback Dialog */}
            <Dialog open={showZplDialog} onOpenChange={setShowZplDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Código ZPL Gerado</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Card className="bg-yellow-50 border-yellow-200 p-4">
                            <p className="text-sm text-yellow-800">
                                <strong>Não foi possível enviar direto:</strong> Verifique se a impressora está ligada, se o IP está correto nas configurações ou se o serviço Zebra Browser Print está rodando.
                            </p>
                        </Card>
                        <p className="text-sm text-muted-foreground">Este código pode ser enviado manualmente ou salvo como arquivo .zpl</p>
                        <textarea className="w-full h-64 p-2 font-mono text-xs border rounded bg-slate-50" readOnly value={zplOutput} />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={copyToClipboard}>Copiar</Button>
                            <Button onClick={() => setShowZplDialog(false)}>Fechar</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
