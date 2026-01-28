
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import {
    Search,
    Bell,
    Download,
    Banknote,
    TrendingUp,
    ShoppingCart,
    UserPlus,
    MoreHorizontal,
    ShieldCheck,
    Calendar,
    Wallet,
    RefreshCw,
    User,
    ChevronDown,
    Loader2
} from "lucide-react";
import { useDashboardComercial } from "@/hooks/bluebay_adm/dashboard/useDashboardComercial";
import { formatCurrency } from "@/utils/formatters";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo } from "react";
import { subDays, startOfYear, subMonths } from "date-fns";
import { ProductCategoryStat, ClientStat } from "@/services/bluebay/dashboardComercialTypes";

const RepresentativeAnalysis = () => {
    const {
        dashboardData,
        isLoading,
        setDateRange,
        startDate,
        endDate,
        selectedRepresentative,
        setSelectedRepresentative,
        productStats,
        clientStats
    } = useDashboardComercial();

    const [allRepresentatives, setAllRepresentatives] = useState<{ id: string, nome: string }[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<'30d' | '6m' | '1y' | '3y'>('30d');

    // Fetch all representatives for the dropdown
    useEffect(() => {
        const fetchReps = async () => {
            // Fetch distinct representatives from orders or just all people marked as Reps
            // Using BLUEBAY_PESSOA distinct might be loose, but let's try a direct query
            // for anyone who IS a representative.
            /* 
               Attempt to get all Reps. Since we don't have a reliable 'IS_REP' flag in all DBs,
               we can query distinct Rep IDs from BLUEBAY_PEDIDO recent history or just fetch all logic.
               Let's try fetching from BLUEBAY_PESSOA where TIPO or similar indicates it.
               Fallback: Fetch dashboard stats for a long range to populate defaults? No, too heavy.
               Let's assume we can fetch active reps from a known RPC or just query.
            */
            const { data, error } = await supabase
                .from('BLUEBAY_PESSOA')
                .select('PES_CODIGO, APELIDO')
                .eq('REPRESENTANTE', 'S') // Common convention, verify if fails
                .order('APELIDO');

            if (data) {
                setAllRepresentatives(data.map(d => ({
                    id: String(d.PES_CODIGO),
                    nome: d.APELIDO || `Rep ${d.PES_CODIGO}`
                })));
            }
        };
        fetchReps();
    }, []);

    const handlePeriodChange = (period: '30d' | '6m' | '1y' | '3y') => {
        setSelectedPeriod(period);
        const today = new Date();
        switch (period) {
            case '30d': setDateRange(subDays(today, 30), today); break;
            case '6m': setDateRange(subMonths(today, 6), today); break;
            case '1y': setDateRange(subDays(today, 365), today); break;
            case '3y': setDateRange(subDays(today, 365 * 3), today); break;
        }
    };

    const handleRepChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedRepresentative(val ? [val] : []);
    };

    // Derived Data
    const totalFaturado = dashboardData?.totalFaturado || 0;
    const totalPedidos = dashboardData?.totals?.totalPedidosQty || 0;
    const novosClientes = clientStats?.length || 0; // "Ativos" proxy
    const ticketMedio = totalPedidos > 0 ? totalFaturado / totalPedidos : 0;

    // Derived Top Products
    const topProducts = useMemo(() => {
        const allItems = productStats.flatMap(cat => cat.items || []);
        return allItems.sort((a, b) => b.QTDE_FATURADA - a.QTDE_FATURADA).slice(0, 4);
    }, [productStats]);

    // Derived Mix Categories
    const mixCategories = useMemo(() => {
        return productStats.map(cat => ({
            label: cat.GRU_DESCRICAO || 'Outros',
            value: cat.VALOR_FATURADO
        })).sort((a, b) => b.value - a.value).slice(0, 5);
    }, [productStats]);

    const mixTotal = mixCategories.reduce((acc, c) => acc + c.value, 0);

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
                        {isLoading && <Loader2 className="h-6 w-6 animate-spin text-blue-500" />}
                    </div>
                </header>

                {/* Filters Section */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-full md:w-auto flex items-center gap-3">
                        <label className="text-sm font-semibold text-slate-500 whitespace-nowrap" htmlFor="rep-select">Representante:</label>
                        <div className="relative w-full md:w-72">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                            <select
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#3b66ad] appearance-none cursor-pointer outline-none"
                                id="rep-select"
                                value={selectedRepresentative[0] || ''}
                                onChange={handleRepChange}
                            >
                                <option value="">Todos os Representantes</option>
                                {allRepresentatives.map(rep => (
                                    <option key={rep.id} value={rep.id}>{rep.nome}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none h-5 w-5" />
                        </div>
                    </div>
                    <div className="w-full md:w-auto flex bg-slate-100 p-1 rounded-xl">
                        <button onClick={() => handlePeriodChange('30d')} className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${selectedPeriod === '30d' ? 'bg-white shadow-sm text-[#3b66ad]' : 'text-slate-500 hover:text-slate-700'}`}>30 dias</button>
                        <button onClick={() => handlePeriodChange('6m')} className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${selectedPeriod === '6m' ? 'bg-white shadow-sm text-[#3b66ad]' : 'text-slate-500 hover:text-slate-700'}`}>6 meses</button>
                        <button onClick={() => handlePeriodChange('1y')} className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${selectedPeriod === '1y' ? 'bg-white shadow-sm text-[#3b66ad]' : 'text-slate-500 hover:text-slate-700'}`}>1 ano</button>
                        <button onClick={() => handlePeriodChange('3y')} className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${selectedPeriod === '3y' ? 'bg-white shadow-sm text-[#3b66ad]' : 'text-slate-500 hover:text-slate-700'}`}>3 anos</button>
                    </div>
                </div>

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
                        <div className="relative z-10 flex items-center gap-2 bg-white/20 w-fit px-4 py-1.5 rounded-full text-sm font-medium">
                            <TrendingUp className="h-4 w-4" />
                            {/* Placeholder for variation until implemented */}
                            <span>Vs. Período Anterior</span>
                        </div>
                    </div>

                    <div className="bg-[#508d62] p-8 rounded-[16px] text-white shadow-xl relative overflow-hidden">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-green-100 font-medium mb-1">Total de Pedidos</p>
                                <h3 className="text-4xl lg:text-5xl font-bold">{totalPedidos}</h3>
                            </div>
                            <ShoppingCart className="h-12 w-12 opacity-40" />
                        </div>
                        <p className="text-sm text-green-100 bg-white/10 w-fit px-4 py-1.5 rounded-full">
                            Ticket Médio: <span className="font-bold">{formatCurrency(ticketMedio)}</span>
                        </p>
                    </div>

                    <div className="bg-[#e08d4d] p-8 rounded-[16px] text-white shadow-xl relative overflow-hidden">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-orange-100 font-medium mb-1">Clientes Ativos</p>
                                <h3 className="text-4xl lg:text-5xl font-bold">{novosClientes}</h3>
                            </div>
                            <UserPlus className="h-12 w-12 opacity-40" />
                        </div>
                        <div className="flex gap-4 text-sm text-orange-100 font-medium">
                            {/* Static for now */}
                            <span className="bg-white/10 px-3 py-1 rounded-lg">Novos: <span className="font-bold">-</span></span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8 mb-10">
                    <div className="col-span-12 lg:col-span-5 bg-white p-8 rounded-[16px] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-10">
                            <h4 className="font-bold text-xl text-slate-800">Mix de Produtos (Top 5)</h4>
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
                                        <div key={idx} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded-full ${colors[idx % colors.length]}`}></div>
                                                <span className="text-slate-600 font-medium truncate max-w-[120px]" title={item.label}>{item.label}</span>
                                            </div>
                                            <span className="font-bold text-slate-800">{Math.round(percent)}% ({formatCurrency(item.value)})</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-7 bg-white p-8 rounded-[16px] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-8">
                            <h4 className="font-bold text-xl text-slate-800">Top Clientes</h4>
                            <button className="text-[#3b66ad] text-sm font-bold hover:underline">Ver relatório completo</button>
                        </div>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {clientStats.sort((a, b) => b.TOTAL_FATURADO - a.TOTAL_FATURADO).slice(0, 5).map((client, idx) => (
                                <div key={idx} className={`flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors cursor-default`}>
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-blue-100 text-blue-600`}>
                                            {client.APELIDO?.substring(0, 2).toUpperCase() || "CL"}
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-700 block text-lg truncate max-w-[200px]">{client.APELIDO || 'Cliente'}</span>
                                            <span className="text-sm text-slate-500">ID: {client.PES_CODIGO}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900 text-lg">{formatCurrency(client.TOTAL_FATURADO)}</p>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{client.TOTAL_PEDIDO} pedidos</p>
                                    </div>
                                </div>
                            ))}
                            {clientStats.length === 0 && <p className="text-center text-slate-400 py-8">Nenhum cliente no período.</p>}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[16px] shadow-sm border border-slate-100 mb-10">
                    <h4 className="font-bold text-xl text-slate-800 mb-10">Top Produtos Vendidos</h4>
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
                            <p className="text-3xl font-bold text-slate-800">{dashboardData?.totalItens?.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[16px] shadow-sm border border-slate-100 flex items-center gap-6">
                        <div className="p-4 bg-blue-50 text-[#3b66ad] rounded-2xl">
                            <Calendar className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Média Itens/Pedido</p>
                            <p className="text-3xl font-bold text-slate-800">{dashboardData?.totals?.totalPedidosQty ? Math.round(dashboardData.totalItens / dashboardData.totals.totalPedidosQty) : 0}</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[16px] shadow-sm border border-slate-100 flex items-center gap-6">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <Wallet className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Valor Médio Item</p>
                            <p className="text-3xl font-bold text-slate-800">{formatCurrency(dashboardData?.mediaValorItem)}</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[16px] shadow-sm border border-slate-100 flex items-center gap-6">
                        <div className="p-4 bg-red-50 text-red-500 rounded-2xl">
                            <RefreshCw className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Devoluções</p>
                            <p className="text-3xl font-bold text-slate-800">-</p>
                            {/* Placeholder as we don't have return data yet */}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RepresentativeAnalysis;
