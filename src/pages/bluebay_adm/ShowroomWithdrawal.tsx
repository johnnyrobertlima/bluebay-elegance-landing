import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash2, ScanBarcode, User, Printer, CheckCircle, PackageSearch } from 'lucide-react';
import { getItemByRFID, createWithdrawal, ShowroomItem } from '@/service/bluebay_adm/showroomService';
import { fetchActiveRepresentativesRPC } from '@/service/bluebay/dashboardComercialService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BluebayAdmMenu } from '@/components/bluebay_adm/BluebayAdmMenu';

interface CartItem extends ShowroomItem {
    scannedAt: Date;
}

export const ShowroomWithdrawal = () => {
    // State
    const [rfidInput, setRfidInput] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [representatives, setRepresentatives] = useState<any[]>([]);
    const [selectedRep, setSelectedRep] = useState<string>('internal'); // 'internal' or ID
    const [isLoading, setIsLoading] = useState(false);
    const [lastScanned, setLastScanned] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    // Initial Load & Focus Management
    useEffect(() => {
        loadReps();

        // Initial focus
        const timer = setTimeout(() => inputRef.current?.focus(), 100);

        // Keep focus listener
        const handleFocus = (e: MouseEvent) => {
            // Only re-focus if the click wasn't on a button or input
            const target = e.target as HTMLElement;
            if (target.tagName !== 'BUTTON' && target.tagName !== 'INPUT' && target.tagName !== 'SELECT' && !target.closest('.no-autofocus')) {
                inputRef.current?.focus();
            }
        };
        window.addEventListener('click', handleFocus);
        return () => {
            window.removeEventListener('click', handleFocus);
            clearTimeout(timer);
        };
    }, []);

    const loadReps = async () => {
        try {
            const reps = await fetchActiveRepresentativesRPC();
            setRepresentatives(reps.map((r: any) => ({
                id: Number(r.value),
                nome: r.label
            })));
        } catch (e) {
            console.error("Error loading reps", e);
        }
    };

    // RFID Handling
    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = rfidInput.trim();

        if (!code) return;
        if (isProcessing) return; // Prevent double submission if already processing

        setIsProcessing(true); // Lock

        // Prevent immediate duplicate scan (same item back to back instantaneously)
        // User asked: "só pode ler o codigo novamente quando sair do leitor e voltar novamente"
        // This implies we ignore continuous stream.
        // Also, business logic: Can we add the same unique RFID twice?
        // RFID tags are unique per item instance. So physically, no.
        // We should check if this specific RFID is ALREADY in the cart.

        if (cart.some(item => item.rfid === code)) {
            toast.warning(`Item já está na lista! (${code})`);
            setRfidInput('');
            setIsProcessing(false);
            return;
        }

        setIsLoading(true);
        try {
            const item = await getItemByRFID(code);
            if (item) {
                setCart(prev => [{ ...item, scannedAt: new Date() }, ...prev]);
                setLastScanned(item.item_code);
                toast.success(`Adicionado: ${item.description}`);
            } else {
                toast.error(`Produto não encontrado para RFID: ${code}`);
            }
        } catch (err) {
            toast.error("Erro ao buscar produto.");
        }
        setIsLoading(false);
        setRfidInput('');

        // Unlock after a small delay to prevent scanner "bounce" or rapid-fire of same code
        setTimeout(() => {
            setIsProcessing(false);
            inputRef.current?.focus();
        }, 500);
    };

    const removeFromCart = (rfid: string) => {
        setCart(prev => prev.filter(i => i.rfid !== rfid));
        inputRef.current?.focus();
    };

    const handleFinalize = async () => {
        if (cart.length === 0) {
            toast.error("Carrinho vazio!");
            return;
        }

        const repId = selectedRep === 'internal' ? null : Number(selectedRep);
        const repName = selectedRep === 'internal'
            ? 'Retirada Interna / Showroom'
            : representatives.find(r => String(r.id) === selectedRep)?.nome || 'Representante';

        try {
            await createWithdrawal({
                representative_id: repId,
                representative_name: repName,
                items: cart
            });
            toast.success("Retirada finalizada com sucesso!");

            if (selectedRep !== 'internal') {
                printReceipt(repName, cart);
            }

            setCart([]);
            setLastScanned(null);
            setSelectedRep('internal');

        } catch (e) {
            toast.error("Erro ao finalizar retirada.");
        }
    };

    const printReceipt = (repName: string, items: CartItem[]) => {
        // Simple printable window
        const win = window.open('', '', 'width=800,height=600');
        if (win) {
            win.document.write(`
                <html>
                    <head>
                        <title>Recibo de Retirada - Showroom</title>
                        <style>
                            body { font-family: monospace; padding: 20px; }
                            .receipt { margin-bottom: 40px; }
                            h2 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin: 0; }
                            .header { margin-bottom: 10px; margin-top: 10px; }
                            table { width: 100%; border-collapse: collapse; font-size: 12px; }
                            th, td { text-align: left; padding: 4px; border-bottom: 1px solid #ccc; }
                            .total { margin-top: 10px; font-weight: bold; text-align: right; font-size: 14px; }
                            .footer { margin-top: 30px; text-align: center; font-size: 12px; }
                            .cut-line { 
                                border-top: 2px dashed #000; 
                                margin: 40px 0; 
                                position: relative; 
                                text-align: center; 
                            }
                            .cut-line:before {
                                content: '✂ QUARDE ESTA VIA';
                                background: #fff;
                                padding: 0 10px;
                                position: relative;
                                top: -10px;
                                font-size: 10px;
                            }
                            @media print {
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        ${[1, 2].map(copy => `
                            <div class="receipt">
                                <h2>BLUEBAY - RECIBO DE RETIRADA (${copy === 1 ? 'Bluebay' : 'Via Representante'})</h2>
                                <div class="header">
                                    <p><strong>Representante:</strong> ${repName}</p>
                                    <p><strong>Data:</strong> ${format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</p>
                                </div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Ref</th>
                                            <th>Descrição</th>
                                            <th>Cor/Tam</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${items.map(i => `
                                            <tr>
                                                <td>${i.item_code}</td>
                                                <td>${i.description}</td>
                                                <td>${i.color || '-'} / ${i.size || '-'}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                                <div class="total">Total de Itens: ${items.length}</div>
                                <div class="footer">
                                    <p>__________________________________________</p>
                                    <p>Assinatura do Recebedor</p>
                                    <br/>
                                    <p>Este documento comprova a retirada de produtos do Showroom.</p>
                                </div>
                            </div>
                            ${copy === 1 ? '<div class="cut-line"></div>' : ''}
                        `).join('')}
                        <script>window.print(); window.close();</script>
                    </body>
                </html>
            `);
            win.document.close();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <BluebayAdmMenu />

            <div className="flex-1 flex gap-6 p-4 h-[calc(100vh-80px)]">
                {/* Left Panel: Controls */}
                <div className="w-1/3 flex flex-col gap-6">
                    {/* 1. Representative Selector */}
                    <Card className="border-l-4 border-l-blue-600 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-600" /> Responsável
                            </CardTitle>
                            <CardDescription>Quem está retirando os produtos?</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedRep} onValueChange={setSelectedRep}>
                                <SelectTrigger className="h-12 text-lg">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="internal" className="font-semibold text-orange-600">📍 SOMENTE RETIRAR (Interno)</SelectItem>
                                    {representatives.map(rep => (
                                        <SelectItem key={rep.id} value={String(rep.id)}>{rep.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* 2. Scan Area */}
                    <Card className="flex-1 flex flex-col border-l-4 border-l-orange-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ScanBarcode className="h-5 w-5 text-orange-500" /> Leitor RFID
                            </CardTitle>
                            <CardDescription>Passe os produtos no leitor</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col gap-4">
                            <form onSubmit={handleScan} className="flex gap-2">
                                <Input
                                    ref={inputRef}
                                    value={rfidInput}
                                    onChange={e => setRfidInput(e.target.value)}
                                    onBlur={() => {
                                        // Auto re-focus if not clicking elsewhere (simple heuristic handled by global listener mostly, but good to have here)
                                        // setTimeout(() => inputRef.current?.focus(), 200);   
                                    }}
                                    disabled={isProcessing}
                                    placeholder={isProcessing ? "Processando..." : "Aguardando leitura..."}
                                    className={`h-14 text-2xl font-mono text-center border-2 transition-colors ${isProcessing ? 'bg-orange-100 border-orange-300' : 'bg-white border-orange-200 focus:border-orange-500'
                                        }`}
                                    autoFocus
                                />
                                {/* Hidden submit just to catch Enter logic from scanner */}
                                <button type="submit" className="hidden" />
                            </form>

                            <div className="flex-1 flex items-center justify-center bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 p-8 text-center text-slate-400">
                                <div className="space-y-2">
                                    <PackageSearch className="h-12 w-12 mx-auto opacity-50" />
                                    <p>Posicione o produto sobre o PAD</p>
                                    <p className="text-xs">O campo acima deve estar focado</p>
                                </div>
                            </div>

                            {lastScanned && (
                                <div className="bg-green-100 border border-green-200 p-4 rounded-lg flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                    <div>
                                        <div className="text-xs text-green-700 font-bold uppercase">Último Scaneado</div>
                                        <div className="text-lg font-bold">{lastScanned}</div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel: List */}
                <div className="w-2/3 flex flex-col gap-4">
                    <Card className="flex-1 flex flex-col shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                            <div>
                                <CardTitle>Produtos na Cesta</CardTitle>
                                <CardDescription>{cart.length} itens adicionados</CardDescription>
                            </div>
                            <Button
                                size="lg"
                                onClick={handleFinalize}
                                disabled={cart.length === 0}
                                className="bg-green-600 hover:bg-green-700 text-lg px-8 shadow-md"
                            >
                                {selectedRep !== 'internal' ? (
                                    <><Printer className="mr-2 h-5 w-5" /> Finalizar e Imprimir</>
                                ) : (
                                    <><CheckCircle className="mr-2 h-5 w-5" /> Finalizar Retirada</>
                                )}
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto p-0">
                            <Table>
                                <TableHeader className="bg-slate-50 sticky top-0 z-10">
                                    <TableRow>
                                        <TableHead className="w-[80px]">Foto</TableHead>
                                        <TableHead>Produto</TableHead>
                                        <TableHead>Cor / Grade</TableHead>
                                        <TableHead className="font-mono text-xs">RFID</TableHead>
                                        <TableHead className="text-right">Ação</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cart.map((item, idx) => (
                                        <TableRow key={`${item.rfid}-${idx}`}>
                                            <TableCell>
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt="Prod" className="h-12 w-12 object-cover rounded border" />
                                                ) : (
                                                    <div className="h-12 w-12 bg-slate-100 rounded border flex items-center justify-center text-xs text-slate-400">Sem Foto</div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-base">{item.item_code}</div>
                                                <div className="text-sm text-muted-foreground line-clamp-1">{item.description}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{item.color || '-'}</div>
                                                <Badge variant="secondary" className="mt-1">{item.size || '-'}</Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-slate-500">
                                                {item.rfid}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-red-50" onClick={() => removeFromCart(item.rfid)}>
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {cart.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-64 text-center text-slate-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <ScanBarcode className="h-12 w-12 opacity-20" />
                                                    <p>Nenhum produto scaneado ainda.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
