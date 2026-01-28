
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import {
    Search,
    Loader2,
    Banknote,
    TrendingUp,
    ShoppingCart,
    UserPlus,
    MoreHorizontal,
    ShieldCheck,
    Calendar,
    Wallet,
    RefreshCw,
    ArrowLeftRight,
    Users
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useState, useMemo, useEffect, useCallback } from "react";
import { subDays, subMonths } from "date-fns";
import { AsyncFilter } from "@/components/bluebay_adm/dashboard-comercial/AsyncFilter";
import {
    fetchDashboardStats,
    fetchProductStats,
    fetchClientStats
} from "@/services/bluebay/dashboardComercialService";
import { DashboardComercialData, ProductCategoryStat, ClientStat } from "@/services/bluebay/dashboardComercialTypes";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const RepresentativeAnalysis = () => {
    // --- State Management ---
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRepresentative, setSelectedRepresentative] = useState<string[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<'30d' | '6m' | '1y' | '3y'>('30d');
    const [clientDisplayMode, setClientDisplayMode] = useState<'apelido' | 'grupo'>('apelido');
    const [mixDisplayMode, setMixDisplayMode] = useState<'categoria' | 'produto'>('categoria');
    const [selectedMixItem, setSelectedMixItem] = useState<string | null>(null);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);

    // Date Range State
    const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
    const [endDate, setEndDate] = useState<Date>(new Date());

    // Data State
    const [dashboardData, setDashboardData] = useState<DashboardComercialData | null>(null);
    const [productStats, setProductStats] = useState<ProductCategoryStat[]>([]);
    const [clientStats, setClientStats] = useState<ClientStat[]>([]);
    const [clientMetrics, setClientMetrics] = useState({ active_clients: 0, portfolio_clients: 0, new_clients: 0 }); // Added

    // --- Handlers ---
    const handlePeriodChange = (period: '30d' | '6m' | '1y' | '3y') => {
        setSelectedPeriod(period);
        setSelectedMixItem(null); // Reset filter on period change
        const today = new Date();
        let start = subDays(today, 30);

        switch (period) {
            case '30d': start = subDays(today, 30); break;
            case '6m': start = subMonths(today, 6); break;
            case '1y': start = subDays(today, 365); break;
            case '3y': start = subDays(today, 365 * 3); break;
        }
        setStartDate(start);
        setEndDate(today);
    };

    const handleRepChange = (val: string | null) => {
        setSelectedRepresentative(val ? [val] : []);
        setSelectedMixItem(null); // Reset filter on representative change
    };

    // --- Data Fetching ---
    const fetchData = useCallback(async () => {
        if (selectedRepresentative.length === 0) {
            setDashboardData(null);
            setProductStats([]);
            setClientStats([]);
            setClientMetrics({ active_clients: 0, portfolio_clients: 0, new_clients: 0 });
            return;
        }

        setIsLoading(true);

        try {
            const controller = new AbortController();
            const signal = controller.signal;
            const repId = parseInt(selectedRepresentative[0]);

            const { fetchRepresentativeClientMetrics } = await import("@/services/bluebay/dashboardComercialService");

            // Parallel Request
            const [mainStats, prodStats, cliStats, cliMetrics] = await Promise.all([
                fetchDashboardStats(
                    startDate,
                    endDate,
                    null,
                    selectedRepresentative,
                    [],
                    [],
                    signal
                ),
                fetchProductStats(startDate, endDate, null, selectedRepresentative, [], []),
                fetchClientStats(startDate, endDate, null, selectedRepresentative, [], []),
                fetchRepresentativeClientMetrics(repId, startDate, endDate)
            ]);

            const formattedData: DashboardComercialData = {
                dailyFaturamento: mainStats.dailyFaturamento || [],
                monthlyFaturamento: mainStats.monthlyFaturamento || [],
                totalFaturado: mainStats.totalFaturado || 0,
                totalItens: mainStats.totalItens || 0,
                mediaValorItem: mainStats.mediaValorItem || 0,
                faturamentoItems: [],
                pedidoItems: [],
                costCenterStats: mainStats.costCenterStats || [],
                representativeStats: mainStats.representativeStats || [],
                dataRangeInfo: mainStats.dataRangeInfo || {
                    startDateRequested: '', endDateRequested: '', startDateActual: null, endDateActual: null, hasCompleteData: false
                },
                totals: mainStats.totals
            };

            setDashboardData(formattedData);
            setProductStats(prodStats);
            setClientStats(cliStats);
            setClientMetrics(cliMetrics);

        } catch (error) {
            console.error('[REP_ANALYSIS] Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate, selectedRepresentative]);

    // Effect to trigger fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Derived UI Values ---
    const totalPedidosValue = dashboardData?.totals?.totalPedidosValue || 0;
    const totalPedidosQty = dashboardData?.totals?.totalPedidosCount ?? dashboardData?.totals?.totalPedidosQty ?? 0;
    const totalFaturado = dashboardData?.totalFaturado || 0;

    // Client Metrics from RPC
    const distinctClients = clientMetrics.active_clients;
    const novosClientes = clientMetrics.new_clients;
    const carteiraTotal = clientMetrics.portfolio_clients;

    // Client Consolidation Logic
    const displayClients = useMemo(() => {
        if (clientDisplayMode === 'apelido') {
            return clientStats.map(c => ({
                id: c.PES_CODIGO,
                name: c.APELIDO,
                subtitle: `ID: ${c.PES_CODIGO}`,
                faturamento: c.TOTAL_FATURADO,
                pedidos: c.TOTAL_PEDIDO, // Note: Using total value as consolidation base
                itens: c.ITENS_PEDIDOS
            })).sort((a, b) => b.faturamento - a.faturamento);
        } else {
            // Consolidate by NOME_CATEGORIA (Grupo Econômico)
            const map = new Map<string, any>();
            clientStats.forEach(c => {
                const grp = c.NOME_CATEGORIA || 'Sem Grupo';
                if (!map.has(grp)) {
                    map.set(grp, {
                        id: grp,
                        name: grp,
                        subtitle: 'Grupo Econômico',
                        faturamento: 0,
                        pedidos: 0,
                        itens: 0,
                        count: 0
                    });
                }
                const existing = map.get(grp);
                existing.faturamento += c.TOTAL_FATURADO;
                existing.pedidos += c.TOTAL_PEDIDO;
                existing.itens += c.ITENS_PEDIDOS;
                existing.count += 1;
            });
            return Array.from(map.values()).sort((a, b) => b.faturamento - a.faturamento);
        }
    }, [clientStats, clientDisplayMode]);

    // Derived Top Products
    const topProducts = useMemo(() => {
        if (selectedMixItem) {
            if (mixDisplayMode === 'categoria') {
                const category = productStats.find(cat => cat.GRU_DESCRICAO === selectedMixItem);
                return [...(category?.items || [])].sort((a, b) => b.QTDE_FATURADA - a.QTDE_FATURADA).slice(0, 4);
            } else {
                const allItems = productStats.flatMap(cat => cat.items || []);
                return allItems.filter(item => item.ITEM_CODIGO === selectedMixItem).slice(0, 4);
            }
        }
        const allItems = productStats.flatMap(cat => cat.items || []);
        return allItems.sort((a, b) => b.QTDE_FATURADA - a.QTDE_FATURADA).slice(0, 4);
    }, [productStats, selectedMixItem, mixDisplayMode]);

    // Derived Mix Categories
    const mixCategories = useMemo(() => {
        if (mixDisplayMode === 'categoria') {
            return productStats.map(cat => ({
                label: cat.GRU_DESCRICAO || 'Outros',
                value: cat.QTDE_ITENS || cat.QTDE_FATURADA || 0 // Preference for order quantity
            })).sort((a, b) => b.value - a.value).slice(0, 5);
        } else {
            const allItems = productStats.flatMap(cat => cat.items || []);
            const map = new Map<string, any>();
            allItems.forEach(item => {
                const label = item.ITEM_CODIGO || 'N/A';
                if (!map.has(label)) {
                    map.set(label, { label: label, value: 0 });
                }
                map.get(label).value += (item.QTDE_ITENS || item.QTDE_FATURADA || 0);
            });
            return Array.from(map.values()).sort((a, b) => b.value - a.value).slice(0, 5);
        }
    }, [productStats, mixDisplayMode]);

    const mixTotal = mixCategories.reduce((acc, c) => acc + c.value, 0);

    const hasSelection = selectedRepresentative.length > 0;

    return (
        <div className="min-h-screen bg-[#F3F4F6] text-slate-800 font-sans">
            <BluebayAdmMenu />

            <main className="max-w-[1440px] mx-auto p-8 lg:p-12">
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Análise do Representante</h2>
                        <p className="text-slate-500 mt-1">Acompanhamento de performance em tempo real</p>
                    </div>
                    <div className="flex gap-4">
                        {isLoading && hasSelection && <Loader2 className="h-6 w-6 animate-spin text-blue-500" />}
                    </div>
                </header>

                {/* Filters Section */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-full md:w-auto flex items-center gap-3">
                        <label className="text-sm font-semibold text-slate-500 whitespace-nowrap">Representante:</label>
                        <div className="relative w-full md:w-72">
                            <AsyncFilter
                                label="Selecione o Representante"
                                value={selectedRepresentative[0] || null}
                                onChange={handleRepChange}
                                fetchOptions={async (q) => {
                                    const { fetchActiveRepresentativesRPC } = await import("@/services/bluebay/dashboardComercialService");
                                    const all = await fetchActiveRepresentativesRPC(24);
                                    if (!q) return all;
                                    return all.filter(r => r.label.toLowerCase().includes(q.toLowerCase()));
                                }}
                                width="w-full"
                                placeholder="Buscar..."
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-auto flex bg-slate-100 p-1 rounded-xl">
                        <button onClick={() => handlePeriodChange('30d')} className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${selectedPeriod === '30d' ? 'bg-white shadow-sm text-[#3b66ad]' : 'text-slate-500 hover:text-slate-700'}`}>30 dias</button>
                        <button onClick={() => handlePeriodChange('6m')} className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${selectedPeriod === '6m' ? 'bg-white shadow-sm text-[#3b66ad]' : 'text-slate-500 hover:text-slate-700'}`}>6 meses</button>
                        <button onClick={() => handlePeriodChange('1y')} className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${selectedPeriod === '1y' ? 'bg-white shadow-sm text-[#3b66ad]' : 'text-slate-500 hover:text-slate-700'}`}>1 ano</button>
                        <button onClick={() => handlePeriodChange('3y')} className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${selectedPeriod === '3y' ? 'bg-white shadow-sm text-[#3b66ad]' : 'text-slate-500 hover:text-slate-700'}`}>3 anos</button>
                    </div>
                </div>

                {!hasSelection ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[16px] shadow-sm border border-slate-100 my-10">
                        <div className="bg-blue-50 p-6 rounded-full mb-6">
                            <Search className="h-10 w-10 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Selecione um Representante</h3>
                        <p className="text-slate-500 max-w-md">Utilize o filtro acima para selecionar um representante e visualizar sua análise de performance detalhada.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                            <div className="bg-[#3b66ad] p-8 rounded-[16px] text-white shadow-xl relative overflow-hidden">
                                <div className="relative z-10 flex justify-between items-start mb-8">
                                    <div>
                                        <p className="text-blue-100 font-medium mb-1">Faturamento Total</p>
                                        <h3 className="text-4xl lg:text-5xl font-bold">
                                            {new Intl.NumberFormat('pt-BR', { notation: "compact", maximumFractionDigits: 1, style: 'currency', currency: 'BRL' }).format(totalFaturado)}
                                        </h3>
                                    </div>
                                    <Banknote className="h-12 w-12 opacity-40" />
                                </div>
                            </div>

                            <div className="bg-[#508d62] p-8 rounded-[16px] text-white shadow-xl relative overflow-hidden">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <p className="text-green-100 font-medium mb-1">Total de Pedidos</p>
                                        <h3 className="text-4xl lg:text-5xl font-bold">
                                            {new Intl.NumberFormat('pt-BR', { notation: "compact", maximumFractionDigits: 1, style: 'currency', currency: 'BRL' }).format(totalPedidosValue)}
                                        </h3>
                                    </div>
                                    <ShoppingCart className="h-12 w-12 opacity-40" />
                                </div>
                                <p className="text-sm text-green-100 bg-white/10 w-fit px-4 py-1.5 rounded-full">
                                    Pedidos: <span className="font-bold">{totalPedidosQty}</span>
                                </p>
                            </div>

                            <div className="bg-[#e08d4d] p-8 rounded-[16px] text-white shadow-xl relative overflow-hidden">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <p className="text-orange-100 font-medium mb-1">Clientes Ativos</p>
                                        <h3 className="text-4xl lg:text-5xl font-bold">{distinctClients}</h3>
                                    </div>
                                    <UserPlus className="h-12 w-12 opacity-40" />
                                </div>
                                <div className="flex gap-4 text-sm text-orange-100 font-medium">
                                    <span className="bg-white/10 px-3 py-1 rounded-lg">Novos: <span className="font-bold">{novosClientes}</span></span>
                                    <span className="bg-white/10 px-3 py-1 rounded-lg">Carteira (3 anos): <span className="font-bold">{carteiraTotal}</span></span>
                                </div>
                            </div>
                        </div >

                        <div className="grid grid-cols-12 gap-8 mb-10">
                            <div className="col-span-12 lg:col-span-5 bg-white p-8 rounded-[16px] shadow-sm border border-slate-100">
                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex items-center gap-4">
                                        <h4 className="font-bold text-xl text-slate-800">Mix de Produtos (Top 5)</h4>
                                        <button
                                            onClick={() => {
                                                setMixDisplayMode(prev => prev === 'categoria' ? 'produto' : 'categoria');
                                                setSelectedMixItem(null);
                                            }}
                                            className={`p-2 rounded-lg transition-colors ${mixDisplayMode === 'produto' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                                            title={mixDisplayMode === 'produto' ? 'Visualizar por Categoria' : 'Ver por Código de Produto'}
                                        >
                                            <ArrowLeftRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <MoreHorizontal className="h-6 w-6 text-slate-400 cursor-pointer" />
                                </div>
                                <div className="flex flex-col xl:flex-row items-center gap-10">
                                    <div className="relative w-[180px] h-[180px] rounded-full shrink-0"
                                        style={{
                                            background: 'conic-gradient(#3b66ad 0% 40%, #508d62 40% 70%, #e08d4d 70% 85%, #94a3b8 85% 95%, #f59e0b 95% 100%)' // TODO: Dynamic Gradient
                                        }}>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110px] h-[110px] bg-white rounded-full"></div>
                                    </div>

                                    <div className="flex-1 w-full space-y-5">
                                        {mixCategories.map((item, idx) => {
                                            const percent = mixTotal > 0 ? (item.value / mixTotal) * 100 : 0;
                                            const colors = ["bg-[#3b66ad]", "bg-[#508d62]", "bg-[#e08d4d]", "bg-slate-400", "bg-yellow-500"];
                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => setSelectedMixItem(selectedMixItem === item.label ? null : item.label)}
                                                    className={`flex items-center justify-between cursor-pointer p-2 rounded-xl transition-all ${selectedMixItem === item.label ? 'bg-blue-50 border border-blue-100 scale-[1.02]' : 'hover:bg-slate-50 border border-transparent'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-4 h-4 rounded-full ${colors[idx % colors.length]}`}></div>
                                                        <span className={`font-medium truncate max-w-[120px] ${selectedMixItem === item.label ? 'text-blue-700' : 'text-slate-600'}`} title={item.label}>{item.label}</span>
                                                    </div>
                                                    <span className={`font-bold ${selectedMixItem === item.label ? 'text-blue-800' : 'text-slate-800'}`}>{Math.round(percent)}% ({item.value} unid.)</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-7 bg-white p-8 rounded-[16px] shadow-sm border border-slate-100">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-4">
                                        <h4 className="font-bold text-xl text-slate-800">Top Clientes</h4>
                                        <button
                                            onClick={() => setClientDisplayMode(prev => prev === 'apelido' ? 'grupo' : 'apelido')}
                                            className={`p-2 rounded-lg transition-colors ${clientDisplayMode === 'grupo' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                                            title={clientDisplayMode === 'grupo' ? 'Visualizar por Cliente' : 'Consolidar por Grupo Econômico'}
                                        >
                                            <ArrowLeftRight className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
                                        <DialogTrigger asChild>
                                            <button className="text-[#3b66ad] text-sm font-bold hover:underline">Ver relatório completo</button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                                            <DialogHeader className="flex flex-row items-center justify-between pr-8">
                                                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                                    <Users className="h-6 w-6 text-blue-500" />
                                                    Relatório de Clientes / Grupos
                                                </DialogTitle>
                                            </DialogHeader>

                                            <div className="mt-4 flex-1 overflow-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>{clientDisplayMode === 'grupo' ? 'Grupo Econômico' : 'Cliente'}</TableHead>
                                                            <TableHead className="text-right">Faturamento</TableHead>
                                                            <TableHead className="text-right">Valor Pedidos</TableHead>
                                                            <TableHead className="text-right">Itens</TableHead>
                                                            {clientDisplayMode === 'grupo' && <TableHead className="text-right">Qtd Clientes</TableHead>}
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {displayClients.map((c) => (
                                                            <TableRow key={c.id}>
                                                                <TableCell className="font-semibold text-slate-700">
                                                                    {c.name}
                                                                    <div className="text-xs text-slate-400 font-normal">{c.subtitle}</div>
                                                                </TableCell>
                                                                <TableCell className="text-right font-bold text-slate-900">{formatCurrency(c.faturamento)}</TableCell>
                                                                <TableCell className="text-right text-slate-600">{formatCurrency(c.pedidos)}</TableCell>
                                                                <TableCell className="text-right text-slate-500">{c.itens}</TableCell>
                                                                {clientDisplayMode === 'grupo' && <TableCell className="text-right">{c.count}</TableCell>}
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {displayClients.slice(0, 5).map((client, idx) => (
                                        <div key={idx} className={`flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors cursor-default`}>
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${clientDisplayMode === 'grupo' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {client.name?.substring(0, 2).toUpperCase() || "CL"}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-700 block text-lg truncate max-w-[200px]" title={client.name}>{client.name}</span>
                                                    <span className="text-sm text-slate-500">{client.subtitle}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-900 text-lg">{formatCurrency(client.faturamento)}</p>
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{formatCurrency(client.pedidos)}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {displayClients.length === 0 && <p className="text-center text-slate-400 py-8">Nenhum dado no período.</p>}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[16px] shadow-sm border border-slate-100 mb-10">
                            <div className="flex justify-between items-center mb-10">
                                <h4 className="font-bold text-xl text-slate-800 flex items-center gap-4">
                                    Top Produtos Vendidos
                                    {selectedMixItem && (
                                        <span className="text-sm font-normal text-blue-500 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-2">
                                            Filtrado por: <b>{selectedMixItem}</b>
                                            <button onClick={() => setSelectedMixItem(null)} className="hover:text-blue-700 font-bold ml-1">✕</button>
                                        </span>
                                    )}
                                </h4>
                                {selectedMixItem && (
                                    <button
                                        onClick={() => setSelectedMixItem(null)}
                                        className="text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors"
                                    >
                                        Limpar Filtro
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                {topProducts.map((prod, idx) => {
                                    const max = topProducts[0]?.QTDE_FATURADA || 1;
                                    const pct = (prod.QTDE_FATURADA / max) * 100;
                                    return (
                                        <div key={idx}>
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="font-semibold text-slate-700">{prod.DESCRICAO} <span className="text-xs text-gray-400 ml-2">Ref: {prod.ITEM_CODIGO}</span></span>
                                                <span className="text-slate-500 font-bold">{prod.QTDE_FATURADA} unid.</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-3">
                                                <div className="bg-[#3b66ad] h-3 rounded-full" style={{ width: `${pct}%` }}></div>
                                            </div>
                                        </div>
                                    )
                                })}
                                {topProducts.length === 0 && <p className="text-slate-400">Sem dados de produtos.</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="bg-white p-8 rounded-[16px] shadow-sm border border-slate-100 flex items-center gap-6">
                                <div className="p-4 bg-green-50 text-[#508d62] rounded-2xl">
                                    <ShieldCheck className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Itens</p>
                                    <p className="text-3xl font-bold text-slate-800">{(dashboardData?.totalItens || 0).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[16px] shadow-sm border border-slate-100 flex items-center gap-6">
                                <div className="p-4 bg-blue-50 text-[#3b66ad] rounded-2xl">
                                    <Calendar className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Média Itens/Pedido</p>
                                    <p className="text-3xl font-bold text-slate-800">
                                        {dashboardData?.totals?.totalPedidosQty ? Math.round((dashboardData.totalItens || 0) / dashboardData.totals.totalPedidosQty) : 0}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[16px] shadow-sm border border-slate-100 flex items-center gap-6">
                                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                                    <Wallet className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Valor Médio Item</p>
                                    <p className="text-3xl font-bold text-slate-800">{formatCurrency(dashboardData?.mediaValorItem || 0)}</p>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[16px] shadow-sm border border-slate-100 flex items-center gap-6">
                                <div className="p-4 bg-red-50 text-red-500 rounded-2xl">
                                    <RefreshCw className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Devoluções</p>
                                    <p className="text-3xl font-bold text-slate-800">-</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main >
        </div >
    );
};

export default RepresentativeAnalysis;
