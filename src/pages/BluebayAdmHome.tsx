
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { ServiceCard } from "@/components/bluebay_adm/ServiceCard";
import { 
  FileText, BarChart2, Users, Wallet, ClipboardCheck, ShoppingBag, 
  Receipt, Package, ShoppingCart, TrendingUp, PackageCheck, Tag, Group,
  PieChart
} from "lucide-react";

const BluebayAdmHome = () => {
  const services = [
    {
      title: "Dashboard Comercial",
      description: "Visão geral do desempenho comercial",
      details: "Acompanhe faturamento, pedidos, metas e indicadores de performance em tempo real com gráficos interativos.",
      icon: PieChart,
      iconColor: "bg-blue-100 text-blue-600",
      path: "/client-area/bluebay_adm/dashboard_comercial",
      badge: "Principal"
    },
    {
      title: "Análise Estoque vs Vendas",
      description: "Otimize seu estoque com inteligência",
      details: "Compare estoque disponível com histórico de vendas, identifique produtos com giro alto/baixo e tome decisões de compra.",
      icon: TrendingUp,
      iconColor: "bg-cyan-100 text-cyan-600",
      path: "/client-area/bluebay_adm/stock-sales-analytics",
      badge: "Análise"
    },
    {
      title: "Dashboard Operacional",
      description: "Indicadores operacionais detalhados",
      details: "Visualize métricas de eficiência, entregas, prazos e performance por representante e região.",
      icon: BarChart2,
      iconColor: "bg-violet-100 text-violet-600",
      path: "/client-area/bluebay_adm/dashboard"
    },
    {
      title: "Gestão de Clientes",
      description: "Base completa de clientes",
      details: "Consulte cadastros, histórico de compras, situação financeira e categorização de clientes ativos.",
      icon: Users,
      iconColor: "bg-green-100 text-green-600",
      path: "/client-area/bluebay_adm/clients"
    },
    {
      title: "Faturamento",
      description: "Notas fiscais e vendas realizadas",
      details: "Consulte notas emitidas, itens vendidos, valores e filtros por período, cliente e representante.",
      icon: Wallet,
      iconColor: "bg-amber-100 text-amber-600",
      path: "/client-area/bluebay_adm/financial"
    },
    {
      title: "Controle de Estoque",
      description: "Posição atual do inventário",
      details: "Consulte quantidade física, disponível, reservada e entrada de produtos por local e filial.",
      icon: Package,
      iconColor: "bg-teal-100 text-teal-600",
      path: "/client-area/bluebay_adm/estoque"
    },
    {
      title: "Análise de Compra",
      description: "Planejamento de reposição",
      details: "Analise necessidades de compra baseado em vendas, estoque mínimo e curva ABC de produtos.",
      icon: ShoppingCart,
      iconColor: "bg-rose-100 text-rose-600",
      path: "/client-area/bluebay_adm/annalisedecompra"
    },
    {
      title: "Pedidos",
      description: "Acompanhamento de pedidos",
      details: "Visualize pedidos em aberto, separados, faturados e entregues com status em tempo real.",
      icon: ShoppingBag,
      iconColor: "bg-emerald-100 text-emerald-600",
      path: "/client-area/bluebay_adm/pedidos"
    },
    {
      title: "Financeiro",
      description: "Títulos e contas a receber",
      details: "Consulte vencimentos, inadimplência, cobranças e resumo financeiro por cliente e período.",
      icon: Receipt,
      iconColor: "bg-indigo-100 text-indigo-600",
      path: "/client-area/bluebay_adm/financeiromanager"
    },
    {
      title: "Relatório de Itens",
      description: "Dados detalhados de produtos",
      details: "Exporte relatórios com informações de cadastro, preços, grupos e movimentação de itens.",
      icon: FileText,
      iconColor: "bg-purple-100 text-purple-600",
      path: "/client-area/bluebay_adm/reports"
    },
    {
      title: "Gerenciar Itens",
      description: "Cadastro e edição de produtos",
      details: "Crie, edite e organize itens com variações de cor, tamanho, preços e categorização.",
      icon: PackageCheck,
      iconColor: "bg-orange-100 text-orange-600",
      path: "/client-area/bluebay_adm/item-management"
    },
    {
      title: "Gerenciar Grupos",
      description: "Organização por categorias",
      details: "Configure grupos e subgrupos para melhor organização e filtros de produtos no sistema.",
      icon: Group,
      iconColor: "bg-pink-100 text-pink-600",
      path: "/client-area/bluebay_adm/item-grupo-management"
    },
    {
      title: "Etiquetas",
      description: "Geração de etiquetas de produtos",
      details: "Crie e imprima etiquetas com código de barras, preços e informações do produto.",
      icon: Tag,
      iconColor: "bg-sky-100 text-sky-600",
      path: "/client-area/bluebay_adm/etiquetas"
    },
    {
      title: "Solicitações",
      description: "Central de atendimento interno",
      details: "Envie e acompanhe solicitações, chamados e requisições para o time de suporte.",
      icon: ClipboardCheck,
      iconColor: "bg-red-100 text-red-600",
      path: "/client-area/bluebay_adm/requests"
    },
  ];

  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayAdmBanner />
      <BluebayAdmMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Bem-vindo à área administrativa Bluebay
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Acesse as ferramentas e serviços disponíveis para gerenciamento completo dos seus dados comerciais, financeiros e operacionais.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                title={service.title}
                description={service.description}
                details={service.details}
                icon={service.icon}
                iconColor={service.iconColor}
                path={service.path}
                badge={service.badge}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default BluebayAdmHome;
