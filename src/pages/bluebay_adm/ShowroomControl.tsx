
import { useState, useEffect } from 'react';
import { BluebayAdmMenu } from '@/components/bluebay_adm/BluebayAdmMenu';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight, ArrowLeft, Package, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { fetchShowroomControlItems, toggleShowroomStatus, ShowroomControlItem } from '@/service/bluebay_adm/showroomService';
import { toast } from 'sonner';

export const ShowroomControl = () => {
    const [activeTab, setActiveTab] = useState<'remove' | 'add' | 'list'>('remove');
    const [items, setItems] = useState<ShowroomControlItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await fetchShowroomControlItems(activeTab, searchTerm);
            setItems(data);
        } catch (error) {
            toast.error("Erro ao carregar itens");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const handleToggle = async (item: ShowroomControlItem) => {
        const newStatus = !item.in_showroom;
        const success = await toggleShowroomStatus(item.item_code, newStatus);

        if (success) {
            toast.success(`Item ${newStatus ? 'adicionado ao' : 'removido do'} Showroom!`);
            // Refresh list (optimistic update would be better but refresh ensures consistency with tab logic)
            loadData();
        } else {
            toast.error("Erro ao atualizar status");
        }
    };

    // Server-side filtered now
    const filteredItems = items;

    return (
        <div className="min-h-screen bg-slate-50">
            <BluebayAdmMenu />
            <div className="max-w-[1440px] mx-auto p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Controle de Showroom</h1>
                    <p className="text-slate-500">Gerencie os itens expostos e recomendações de movimentação (Empresa Blue Bay)</p>
                </header>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
                    <TabsList className="bg-white p-1 border rounded-xl h-auto gap-2 shadow-sm">
                        <TabsTrigger value="remove" className="px-6 py-2.5 data-[state=active]:bg-red-50 data-[state=active]:text-red-600 rounded-lg flex gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Retirar do Showroom
                        </TabsTrigger>
                        <TabsTrigger value="add" className="px-6 py-2.5 data-[state=active]:bg-green-50 data-[state=active]:text-green-600 rounded-lg flex gap-2">
                            <Package className="w-4 h-4" />
                            Colocar no Showroom
                        </TabsTrigger>
                        <TabsTrigger value="list" className="px-6 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-lg flex gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Itens Expostos
                        </TabsTrigger>
                    </TabsList>

                    <Card className="border-slate-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-6 gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Buscar por código ou descrição..."
                                        className="pl-10 bg-slate-50 border-slate-200"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') loadData();
                                        }}
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Badge variant="outline" className="bg-slate-50">
                                        {filteredItems.length} itens encontrados
                                    </Badge>
                                    <Button size="icon" variant="ghost" onClick={loadData} disabled={isLoading}>
                                        <Search className="w-4 h-4" /> {/* Changed icon to Search to imply action */}
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="w-[80px]">Imagem</TableHead>
                                            <TableHead>Produto</TableHead>
                                            <TableHead>Cores / Grade</TableHead>
                                            <TableHead className="text-right">Estoque Disp.</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                            <TableHead className="text-right">Ação</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center">
                                                    Carregando itens...
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredItems.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                    Nenhum item encontrado nesta categoria.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredItems.map((item) => (
                                                <TableRow key={item.item_code} className="hover:bg-slate-50/50">
                                                    <TableCell>
                                                        {item.image_url ? (
                                                            <img
                                                                src={item.image_url}
                                                                alt={item.item_code}
                                                                className="w-12 h-12 object-cover rounded-md border"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-slate-100 rounded-md border flex items-center justify-center text-slate-300">
                                                                <Package className="w-6 h-6" />
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-semibold text-slate-900">{item.item_code}</div>
                                                        <div className="text-sm text-slate-500 truncate max-w-[300px]">{item.description}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-xs text-slate-600">
                                                            <div>{item.colors || '-'}</div>
                                                            <div className="text-slate-400">{item.sizes || '-'}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant={item.stock_available < 24 ? "destructive" : "default"} className={item.stock_available > 100 ? "bg-green-600 hover:bg-green-700" : ""}>
                                                            {item.stock_available}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant={item.in_showroom ? "default" : "secondary"}>
                                                            {item.in_showroom ? "No Showroom" : "Fora"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {(!item.in_showroom) ? (
                                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-2" onClick={() => handleToggle(item)}>
                                                                <ArrowRight className="w-4 h-4" /> Adicionar
                                                            </Button>
                                                        ) : (
                                                            <Button size="sm" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200 border gap-2" onClick={() => handleToggle(item)}>
                                                                <ArrowLeft className="w-4 h-4" /> Remover
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-4 p-4 bg-blue-50 text-blue-800 text-sm rounded-lg flex gap-3">
                        <div className="font-bold whitespace-nowrap">Regras:</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                            <div><strong>Retirar:</strong> Itens no Showroom com Estoque &lt; 24 peças.</div>
                            <div><strong>Colocar:</strong> Itens fora do Showroom com Estoque &gt; 24 peças.</div>
                            <div><strong>Expostos:</strong> Todo item marcado como "No Showroom".</div>
                        </div>
                    </div>
                </Tabs>
            </div>
        </div>
    );
};
