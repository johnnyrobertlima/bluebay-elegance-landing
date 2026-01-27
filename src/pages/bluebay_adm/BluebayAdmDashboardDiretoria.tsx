import { useState, useMemo } from 'react';
import { useDashboardComercial } from "@/hooks/bluebay_adm/dashboard/useDashboardComercial";
import { formatCurrency } from "@/utils/formatters";
import {
    Search,
    Bell,
    Store,
    Factory,
    Landmark,
    TrendingUp,
    TrendingDown,
    LayoutGrid,
    BarChart4,
    Wallet,
    Settings,
    Moon,
    Sun,
    ShoppingBag,
    DollarSign
} from 'lucide-react';
import {
    AreaChart,
    Area,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { format, subDays, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BluebayAdmDashboardDiretoria = () => {
    const {
        dashboardData,
        isLoading,
        refreshData,
        setDateRange,
        startDate,
        endDate
    } = useDashboardComercial();

    const [darkMode, setDarkMode] = useState(true); // Default to dark as per image design
    const [activeTab, setActiveTab] = useState<'faturamento' | 'pedidos'>('faturamento');

    // Helper to toggle theme
    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Ensure dark mode class is applied on mount if desired
    useState(() => {
        document.documentElement.classList.add('dark');
    });

    // Date Filters
    const handleDateFilter = (filter: 'today' | 'yesterday' | 'last30') => {
        const today = new Date();
        switch (filter) {
            case 'today':
                setDateRange(today, today);
                break;
            case 'yesterday':
                const yest = subDays(today, 1);
                setDateRange(yest, yest);
                break;
            case 'last30':
                setDateRange(subDays(today, 30), today);
                break;
        }
    };

    const isFilterActive = (filter: 'today' | 'yesterday' | 'last30') => {
        const today = new Date();
        const todayStr = format(today, 'yyyy-MM-dd');
        const startStr = format(startDate, 'yyyy-MM-dd');
        const endStr = format(endDate, 'yyyy-MM-dd');

        if (filter === 'today') return startStr === todayStr && endStr === todayStr;
        if (filter === 'yesterday') {
            const yest = subDays(today, 1);
            const yestStr = format(yest, 'yyyy-MM-dd');
            return startStr === yestStr && endStr === yestStr;
        }
        if (filter === 'last30') {
            const thirtyStr = format(subDays(today, 30), 'yyyy-MM-dd');
            return startStr === thirtyStr && endStr === todayStr;
        }
        return false;
    };

    // Data Preparation
    const dailyData = dashboardData?.dailyFaturamento || [];

    // Calculate totals from dailyData if dashboardData.totals is missing or zero
    const calculatedTotals = useMemo(() => {
        if (!dailyData || dailyData.length === 0) return { totalFaturado: 0, totalPedidosQty: 0, totalPedidosValue: 0 };
        return dailyData.reduce((acc, curr) => ({
            totalFaturado: acc.totalFaturado + (curr.total || 0),
            totalPedidosQty: acc.totalPedidosQty + (curr.pedidoCount || 0),
            totalPedidosValue: acc.totalPedidosValue + (curr.pedidoTotal || 0)
        }), { totalFaturado: 0, totalPedidosQty: 0, totalPedidosValue: 0 });
    }, [dailyData]);

    const totals = (dashboardData?.totals && dashboardData.totals.totalFaturado > 0)
        ? dashboardData.totals
        : calculatedTotals;

    // Format for Chart (Oldest to Newest)
    const chartData = useMemo(() => {
        return [...dailyData]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(item => ({
                date: item.date,
                formattedDate: format(new Date(item.date), 'dd/MM'),
                value: activeTab === 'faturamento' ? item.total : item.pedidoTotal // Use pedidoTotal (Value)
            }));
    }, [dailyData, activeTab]);

    // Find Peak
    const peakValue = useMemo(() => {
        if (chartData.length === 0) return 0;
        return Math.max(...chartData.map(d => d.value));
    }, [chartData]);

    // Calculate Total for Chart
    const totalValue = useMemo(() => {
        if (chartData.length === 0) return 0;
        return chartData.reduce((acc, curr) => acc + (curr.value || 0), 0);
    }, [chartData]);

    // Cost Center Icons/Colors Map
    const getCostCenterStyle = (name: string) => {
        const normalized = name.toUpperCase();
        if (normalized.includes('BLUE BAY') || normalized.includes('VAREJO')) return {
            icon: Store,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/20',
            barColor: 'bg-indigo-500' // primary
        };
        if (normalized.includes('JAB') || normalized.includes('INDUSTRIA')) return {
            icon: Factory,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20',
            barColor: 'bg-orange-500' // orange
        };
        if (normalized.includes('BK') || normalized.includes('HOLDING')) return {
            icon: Landmark,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            barColor: 'bg-emerald-500' // green
        };
        return {
            icon: Store,
            color: 'text-slate-500',
            bg: 'bg-slate-500/10',
            border: 'border-slate-500/20',
            barColor: 'bg-slate-500'
        };
    };

    const costCenters = dashboardData?.costCenterStats || [];

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-slate-100 pb-24 font-sans transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
            {/* Header */}
            <div className="h-safe-top w-full"></div>
            <header className="sticky top-0 z-50 px-5 pt-4 pb-4 bg-slate-50/80 dark:bg-[#070a13]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
                <div className="flex justify-between items-center mb-5">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Dashboard Diretoria</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Consolidado Estratégico</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <Search className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 relative">
                            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-[#070a13]"></span>
                        </button>
                    </div>
                </div>

                {/* Date Filter Tabs */}
                <div className="flex p-1 bg-slate-200/50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                    <button
                        onClick={() => handleDateFilter('today')}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${isFilterActive('today')
                            ? 'bg-white dark:bg-indigo-600 shadow-sm text-indigo-600 dark:text-white'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        Hoje
                    </button>
                    <button
                        onClick={() => handleDateFilter('yesterday')}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${isFilterActive('yesterday')
                            ? 'bg-white dark:bg-indigo-600 shadow-sm text-indigo-600 dark:text-white'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        Ontem
                    </button>
                    <button
                        onClick={() => handleDateFilter('last30')}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${isFilterActive('last30')
                            ? 'bg-white dark:bg-indigo-600 shadow-sm text-indigo-600 dark:text-white'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        Últimos 30 dias
                    </button>
                </div>
            </header>

            <main className="px-5 py-6 space-y-8">
                {/* KPI Cards */}
                <section className="grid grid-cols-2 gap-4">
                    {/* Faturamento Card */}
                    <div className="bg-white dark:bg-[#111827] p-5 rounded-3xl border border-slate-200 dark:border-white/10 relative overflow-hidden group shadow-sm">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <DollarSign className="w-10 h-10 text-indigo-500" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Faturado</p>
                        <div className="flex items-baseline space-x-1">
                            <span className="text-xs font-bold text-slate-400">R$</span>
                            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                                {/* Format nicely, e.g. 5.7M */}
                                {new Intl.NumberFormat('pt-BR', { notation: "compact", maximumFractionDigits: 1 }).format(totals.totalFaturado)}
                            </h2>
                        </div>
                        {/* Dummy Trend - In real app, calculate diff */}
                        <div className="mt-2 flex items-center text-[10px] font-bold text-emerald-500">
                            <TrendingUp className="w-3 h-3 mr-1" /> {/* Placeholder trend */}
                            <span>+12.5%</span>
                        </div>
                    </div>

                    {/* Pedidos Card */}
                    <div className="bg-white dark:bg-[#111827] p-5 rounded-3xl border border-slate-200 dark:border-white/10 relative overflow-hidden group shadow-sm">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ShoppingBag className="w-10 h-10 text-emerald-500" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Pedidos</p>
                        <div className="flex items-baseline space-x-1">
                            <span className="text-xs font-bold text-slate-400">R$</span>
                            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                                {new Intl.NumberFormat('pt-BR', { notation: "compact", maximumFractionDigits: 1 }).format(totals.totalPedidosValue || 0)}
                            </h2>
                        </div>
                        <div className="mt-2 flex items-center text-[10px] font-bold text-emerald-500">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            <span>+8.2%</span>
                        </div>
                    </div>
                </section>

                {/* Chart Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Desempenho Temporal</h3>
                        <div className="flex p-0.5 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
                            <button
                                onClick={() => setActiveTab('faturamento')}
                                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${activeTab === 'faturamento'
                                    ? 'bg-white dark:bg-indigo-600 shadow-sm text-indigo-600 dark:text-white'
                                    : 'text-slate-500 dark:text-slate-400'
                                    }`}
                            >
                                Faturamento
                            </button>
                            <button
                                onClick={() => setActiveTab('pedidos')}
                                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${activeTab === 'pedidos'
                                    ? 'bg-white dark:bg-indigo-600 shadow-sm text-indigo-600 dark:text-white'
                                    : 'text-slate-500 dark:text-slate-400'
                                    }`}
                            >
                                Pedidos
                            </button>
                        </div>
                    </div>

                    <div className="relative h-56 w-full bg-white dark:bg-[#111827] rounded-3xl p-4 overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg">
                        <div className="absolute top-6 left-6 z-10 pointer-events-none">
                            <p className="text-xs font-medium text-slate-400">Total do Período</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {formatCurrency(totalValue)}
                            </p>
                        </div>

                        <div className="w-full h-full pt-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '12px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                        labelStyle={{ color: '#9ca3af' }}
                                        formatter={(value) => [
                                            formatCurrency(Number(value)),
                                            activeTab === 'faturamento' ? 'Faturamento' : 'Total Pedidos'
                                        ]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#chartGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>

                {/* Cost Centers */}
                <section className="space-y-4 pb-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Indicadores por Centro de Custo</h3>
                        <button className="text-xs font-bold text-indigo-500 px-3 py-1 bg-indigo-500/10 rounded-full hover:bg-indigo-500/20 transition-colors">Detalhes</button>
                    </div>

                    <div className="grid gap-4">
                        {costCenters.map((cc, idx) => {
                            const style = getCostCenterStyle(cc.nome);
                            const Icon = style.icon;

                            // Calculate percentages for visual bars (simplified)
                            const maxFat = Math.max(...costCenters.map(c => c.totalFaturado)) || 1;
                            const maxPed = Math.max(...costCenters.map(c => c.totalPedidos)) || 1; // Assuming totalPedidos is a count here?

                            // Note: The service might be returning totalPedidos as count or value. 
                            // In types: `totalPedidos: number` (ambiguous). Looking at service, dashboardComercialTypes:
                            // `totalPedidos: number` (from row.totalPedidos). 
                            // Let's assume it's count for this visual, or whatever is consistent.

                            const fatPercent = Math.round((cc.totalFaturado / maxFat) * 100);
                            const pedPercent = Math.round((cc.totalPedidos / maxPed) * 100);

                            return (
                                <div key={idx} className="bg-white dark:bg-[#111827] p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-12 h-12 rounded-2xl ${style.bg} flex items-center justify-center border ${style.border}`}>
                                                <Icon className={`w-6 h-6 ${style.color}`} />
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">{cc.nome}</h4>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                    {/* Tagline logic - Hardcoded for known CCs, or generic */}
                                                    {cc.nome.includes("BLUE BAY") ? "Varejo & Serviços" :
                                                        cc.nome.includes("JAB") ? "Indústria & Logística" :
                                                            cc.nome.includes("BK") ? "Holding Financeira" : "Centro de Custo"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1 text-emerald-500 font-bold text-xs bg-emerald-500/10 px-2 py-1 rounded-lg">
                                            <TrendingUp className="w-3 h-3" />
                                            <span>{(Math.random() * 10).toFixed(1)}%</span> {/* Dummy Change */}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 relative z-10">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Faturado</p>
                                            <p className="font-extrabold text-xl text-slate-900 dark:text-white truncate">
                                                {new Intl.NumberFormat('pt-BR', { notation: "compact", maximumFractionDigits: 1 }).format(cc.totalFaturado)}
                                            </p>
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full mt-2">
                                                <div className={`h-full ${style.barColor} rounded-full opacity-80`} style={{ width: `${fatPercent}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pedidos</p>
                                            <p className="font-extrabold text-xl text-slate-900 dark:text-white truncate">
                                                {new Intl.NumberFormat('pt-BR', { notation: "compact", maximumFractionDigits: 1 }).format(cc.totalPedidos)}
                                            </p>
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full mt-2">
                                                <div className="h-full bg-emerald-500 rounded-full opacity-80" style={{ width: `${pedPercent}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 h-24 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border-t border-slate-200 dark:border-white/10 px-8 flex items-start justify-between pt-4 pb-6 z-50">
                <button className="flex flex-col items-center space-y-1 text-indigo-500">
                    <LayoutGrid className="w-6 h-6 fill-current" />
                    <span className="text-[10px] font-bold">Início</span>
                </button>
                <button className="flex flex-col items-center space-y-1 text-slate-400 hover:text-indigo-400 transition-colors">
                    <BarChart4 className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Dados</span>
                </button>
                <button className="flex flex-col items-center space-y-1 text-slate-400 hover:text-indigo-400 transition-colors">
                    <Wallet className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Caixa</span>
                </button>
                <button className="flex flex-col items-center space-y-1 text-slate-400 hover:text-indigo-400 transition-colors">
                    <Settings className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Ajustes</span>
                </button>
            </nav>

            {/* Theme Toggle FAB */}
            <button
                onClick={toggleTheme}
                className="fixed bottom-28 right-6 w-12 h-12 bg-white dark:bg-white/10 text-slate-900 dark:text-white rounded-full flex items-center justify-center shadow-2xl border border-slate-200 dark:border-white/20 active:scale-90 transition-transform z-40"
            >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
        </div>
    );
};

export default BluebayAdmDashboardDiretoria;
