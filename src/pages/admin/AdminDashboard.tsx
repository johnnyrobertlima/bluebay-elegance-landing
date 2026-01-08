import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, 
  Users, 
  Package, 
  FileText, 
  DollarSign, 
  BarChart3, 
  Settings, 
  ArrowLeft,
  ArrowRight,
  Loader2,
  TrendingUp,
  ShoppingCart,
  Warehouse
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalItems: number;
  totalClients: number;
  adminsCount: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();

  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [profiles, products, orders, items, clients, admins] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('BLUEBAY_ITEM').select('ITEM_CODIGO', { count: 'exact', head: true }),
        supabase.from('BLUEBAY_PESSOA').select('PES_CODIGO', { count: 'exact', head: true }),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
      ]);

      return {
        totalUsers: profiles.count || 0,
        totalProducts: products.count || 0,
        totalOrders: orders.count || 0,
        totalItems: items.count || 0,
        totalClients: clients.count || 0,
        adminsCount: admins.count || 0,
      };
    },
    enabled: isAdmin === true,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && user && isAdmin === false) {
      toast.error('Acesso negado. Você não tem permissão de administrador.');
      navigate('/');
    }
  }, [isAdmin, authLoading, user, navigate]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const quickLinks = [
    {
      title: 'Gerenciar Roles',
      description: 'Adicionar ou remover permissões de usuários',
      icon: Shield,
      href: '/admin/roles',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Dashboard Comercial',
      description: 'Visualizar métricas de vendas e faturamento',
      icon: BarChart3,
      href: '/client-area/bluebay_adm/dashboard_comercial',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Gestão de Itens',
      description: 'Gerenciar produtos e variações',
      icon: Package,
      href: '/client-area/bluebay_adm/item-management',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Financeiro',
      description: 'Títulos, cobranças e relatórios financeiros',
      icon: DollarSign,
      href: '/client-area/bluebay_adm/financial',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Estoque',
      description: 'Controle de estoque e disponibilidade',
      icon: Warehouse,
      href: '/client-area/bluebay_adm/estoque',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Análise de Vendas',
      description: 'Relatórios detalhados de vendas por item',
      icon: TrendingUp,
      href: '/client-area/bluebay_adm/stock-sales-analytics',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  const statsCards = [
    { title: 'Usuários', value: stats?.totalUsers, icon: Users, color: 'text-blue-500' },
    { title: 'Admins', value: stats?.adminsCount, icon: Shield, color: 'text-red-500' },
    { title: 'Produtos', value: stats?.totalProducts, icon: Package, color: 'text-purple-500' },
    { title: 'Pedidos', value: stats?.totalOrders, icon: ShoppingCart, color: 'text-green-500' },
    { title: 'Itens Bluebay', value: stats?.totalItems, icon: FileText, color: 'text-orange-500' },
    { title: 'Clientes Bluebay', value: stats?.totalClients, icon: Users, color: 'text-cyan-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  Painel Administrativo
                </h1>
                <p className="text-sm text-muted-foreground">
                  Visão geral do sistema
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/admin/roles')}>
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Estatísticas do Sistema</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statsCards.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      {isLoadingStats ? (
                        <Skeleton className="h-8 w-16 mt-1" />
                      ) : (
                        <p className="text-2xl font-bold">{stat.value?.toLocaleString() || 0}</p>
                      )}
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg ${link.bgColor}`}>
                        <link.icon className={`h-6 w-6 ${link.color}`} />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg mb-1">{link.title}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Additional Links */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Mais Opções</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/client-area/bluebay_adm">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <BarChart3 className="h-5 w-5" />
                <span>Área Bluebay</span>
              </Button>
            </Link>
            <Link to="/client-area/bluebay_adm/pedidos">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Pedidos</span>
              </Button>
            </Link>
            <Link to="/client-area/bluebay_adm/clients">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Users className="h-5 w-5" />
                <span>Clientes</span>
              </Button>
            </Link>
            <Link to="/client-area/bluebay_adm/reports">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <FileText className="h-5 w-5" />
                <span>Relatórios</span>
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
