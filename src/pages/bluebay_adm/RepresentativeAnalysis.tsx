
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
    ChevronDown
} from "lucide-react";

const RepresentativeAnalysis = () => {
    return (
        <div className="min-h-screen bg-[#F3F4F6] text-slate-800 font-sans">
            <BluebayAdmMenu />

            <main className="max-w-[1440px] mx-auto p-8 lg:p-12">
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Dashboard de Vendas Premium</h2>
                        <p className="text-slate-500 mt-1">Acompanhamento de performance em tempo real</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:bg-slate-50 transition-colors">
                            <Search className="h-6 w-6" />
                        </button>
                        <button className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:bg-slate-50 transition-colors">
                            <Bell className="h-6 w-6" />
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-[#3b66ad] text-white rounded-xl shadow-md font-medium hover:opacity-90 transition-opacity">
                            <Download className="h-5 w-5" />
                            Exportar Relatório
                        </button>
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
                            >
                                <option value="">Todos os Representantes</option>
                                <option value="1">João Silva (Sul)</option>
                                <option value="2">Maria Oliveira (Sudeste)</option>
                                <option value="3">Ricardo Santos (Centro-Oeste)</option>
                                <option value="4">Fernanda Lima (Nordeste)</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none h-5 w-5" />
                        </div>
                    </div>
                    <div className="w-full md:w-auto flex bg-slate-100 p-1 rounded-xl">
                        <button className="px-5 py-2 text-sm text-[#3b66ad] font-semibold bg-white shadow-sm rounded-lg transition-all">30 dias</button>
                        <button className="px-5 py-2 text-sm text-slate-500 rounded-lg hover:text-slate-700 transition-all">6 meses</button>
                        <button className="px-5 py-2 text-sm text-slate-500 rounded-lg hover:text-slate-700 transition-all">1 ano</button>
                        <button className="px-5 py-2 text-sm text-slate-500 rounded-lg hover:text-slate-700 transition-all">3 anos</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    <div className="bg-[#3b66ad] p-8 rounded-[16px] text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10 flex justify-between items-start mb-8">
                            <div>
                                <p className="text-blue-100 font-medium mb-1">Faturamento Total</p>
                                <h3 className="text-4xl lg:text-5xl font-bold">R$ 350.000</h3>
                            </div>
                            <Banknote className="h-12 w-12 opacity-40" />
                        </div>
                        <div className="relative z-10 flex items-center gap-2 bg-white/20 w-fit px-4 py-1.5 rounded-full text-sm font-medium">
                            <TrendingUp className="h-4 w-4" />
                            +12% vs mês anterior
                        </div>
                    </div>

                    <div className="bg-[#508d62] p-8 rounded-[16px] text-white shadow-xl relative overflow-hidden">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-green-100 font-medium mb-1">Total de Pedidos</p>
                                <h3 className="text-4xl lg:text-5xl font-bold">75 Pedidos</h3>
                            </div>
                            <ShoppingCart className="h-12 w-12 opacity-40" />
                        </div>
                        <p className="text-sm text-green-100 bg-white/10 w-fit px-4 py-1.5 rounded-full">
                            Ticket Médio: <span className="font-bold">R$ 4.667</span>
                        </p>
                    </div>

                    <div className="bg-[#e08d4d] p-8 rounded-[16px] text-white shadow-xl relative overflow-hidden">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-orange-100 font-medium mb-1">Novos Clientes</p>
                                <h3 className="text-4xl lg:text-5xl font-bold">8 Novos</h3>
                            </div>
                            <UserPlus className="h-12 w-12 opacity-40" />
                        </div>
                        <div className="flex gap-4 text-sm text-orange-100 font-medium">
                            <span className="bg-white/10 px-3 py-1 rounded-lg">Ativos: <span className="font-bold">45</span></span>
                            <span className="bg-white/10 px-3 py-1 rounded-lg">Inativos: <span className="font-bold">20</span></span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8 mb-10">
                    <div className="col-span-12 lg:col-span-5 bg-white p-8 rounded-[16px] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-10">
                            <h4 className="font-bold text-xl text-slate-800">Mix de Produtos Vendidos</h4>
                            <MoreHorizontal className="h-6 w-6 text-slate-400 cursor-pointer" />
                        </div>
                        <div className="flex flex-col xl:flex-row items-center gap-10">
                            <div className="relative w-[180px] h-[180px] rounded-full shrink-0"
                                style={{
                                    background: 'conic-gradient(#3b66ad 0% 40%, #508d62 40% 70%, #e08d4d 70% 85%, #94a3b8 85% 95%, #f59e0b 95% 100%)'
                                }}>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110px] h-[110px] bg-white rounded-full"></div>
                            </div>

                            <div className="flex-1 w-full space-y-5">
                                {[
                                    { label: "Básicos", color: "bg-[#3b66ad]", value: "40%" },
                                    { label: "Jeans", color: "bg-[#508d62]", value: "30%" },
                                    { label: "Fitness", color: "bg-[#e08d4d]", value: "15%" },
                                    { label: "Premium", color: "bg-slate-400", value: "10%" }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                                            <span className="text-slate-600 font-medium">{item.label}</span>
                                        </div>
                                        <span className="font-bold text-slate-800">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-7 bg-white p-8 rounded-[16px] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-8">
                            <h4 className="font-bold text-xl text-slate-800">Top Clientes</h4>
                            <button className="text-[#3b66ad] text-sm font-bold hover:underline">Ver relatório completo</button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: "Loja Moda Viva", city: "Curitiba, PR", val: "R$ 80.000", orders: "12 pedidos", initials: "MV", color: "text-[#3b66ad] bg-blue-100", border: "hover:border-blue-200" },
                                { name: "Boutique Elegance", city: "São Paulo, SP", val: "R$ 65.000", orders: "8 pedidos", initials: "BE", color: "text-[#508d62] bg-green-100", border: "hover:border-green-200" },
                                { name: "Estilo Jovem", city: "Rio de Janeiro, RJ", val: "R$ 50.000", orders: "5 pedidos", initials: "EJ", color: "text-[#e08d4d] bg-orange-100", border: "hover:border-orange-200" }
                            ].map((client, idx) => (
                                <div key={idx} className={`flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 ${client.border} transition-colors cursor-default`}>
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${client.color}`}>
                                            {client.initials}
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-700 block text-lg">{client.name}</span>
                                            <span className="text-sm text-slate-500">{client.city}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900 text-lg">{client.val}</p>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{client.orders}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[16px] shadow-sm border border-slate-100 mb-10">
                    <h4 className="font-bold text-xl text-slate-800 mb-10">Top Produtos Vendidos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {[
                            { name: "Blusa X3", count: "120 unid.", pct: "100%" },
                            { name: "Calça Jeans Y1", count: "90 unid.", pct: "75%" },
                            { name: "Jaqueta Z5", count: "60 unid.", pct: "50%" },
                            { name: "Camiseta Básica", count: "50 unid.", pct: "42%" }
                        ].map((prod, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-semibold text-slate-700">{prod.name}</span>
                                    <span className="text-slate-500 font-bold">{prod.count}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3">
                                    <div className="bg-[#3b66ad] h-3 rounded-full" style={{ width: prod.pct }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="bg-white p-8 rounded-[16px] shadow-sm border border-slate-100 flex items-center gap-6">
                        <div className="p-4 bg-green-50 text-[#508d62] rounded-2xl">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Ativação</p>
                            <p className="text-3xl font-bold text-slate-800">67%</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[16px] shadow-sm border border-slate-100 flex items-center gap-6">
                        <div className="p-4 bg-blue-50 text-[#3b66ad] rounded-2xl">
                            <Calendar className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Frequência</p>
                            <p className="text-3xl font-bold text-slate-800">28 dias</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[16px] shadow-sm border border-slate-100 flex items-center gap-6">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <Wallet className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Margem</p>
                            <p className="text-3xl font-bold text-slate-800">35%</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[16px] shadow-sm border border-slate-100 flex items-center gap-6">
                        <div className="p-4 bg-red-50 text-red-500 rounded-2xl">
                            <RefreshCw className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Troca</p>
                            <p className="text-3xl font-bold text-slate-800">4%</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RepresentativeAnalysis;
