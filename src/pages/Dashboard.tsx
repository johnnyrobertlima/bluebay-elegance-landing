import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Package, FileText, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';

// Types
interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  phone: string | null;
  created_at: string;
  linked_client_type?: 'CNPJ' | 'CATEGORY' | 'NONE';
  linked_client_value?: string;
}

interface ClientOrder {
  PED_NUMPEDIDO: string;
  PES_CODIGO: number;
  TOTAL_PRODUTO: number | null;
  STATUS: string | null;
  DATA_PEDIDO: string | null;
  client_name?: string;
}

interface ClientTitle {
  NUMDOCUMENTO: string | null;
  PES_CODIGO: string | null;
  VLRTITULO: number | null;
  NUMNOTA: number | null;
  STATUS: string | null;
  DTVENCIMENTO: string | null;
  client_name?: string;
}

interface ClientInvoice {
  NOTA: string | null;
  PES_CODIGO: number | null;
  VALOR_NOTA: number | null;
  DATA_EMISSAO: string | null;
  client_name?: string;
}

const statusColors: Record<string, string> = {
  'PENDENTE': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'CONFIRMADO': 'bg-blue-100 text-blue-800 border-blue-200',
  'PROCESSANDO': 'bg-purple-100 text-purple-800 border-purple-200',
  'ENVIADO': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'ENTREGUE': 'bg-green-100 text-green-800 border-green-200',
  'CANCELADO': 'bg-red-100 text-red-800 border-red-200',
  'ABERTO': 'bg-blue-100 text-blue-800 border-blue-200',
  'PAGO': 'bg-green-100 text-green-800 border-green-200',
};

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [titles, setTitles] = useState<ClientTitle[]>([]);
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [expandedSection, setExpandedSection] = useState<{
    orders: boolean;
    titles: boolean;
    invoices: boolean;
  }>({
    orders: false,
    titles: false,
    invoices: false,
  });

  const toggleSection = (section: 'orders' | 'titles' | 'invoices') => {
    setExpandedSection(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: profileData, error: profileError } = await (supabase as any)
        .from('profiles').select('*').eq('id', user.id).maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData as Profile);

      let clientIds: number[] = [];
      let clientNamesMap: Record<string, string> = {};
      let isRestricted = false;

      // 1. Determine Restriction
      if (profileData?.linked_client_type === 'CNPJ' && profileData.linked_client_value) {
        isRestricted = true;
        const { data: clientData } = await (supabase as any)
          .from('BLUEBAY_PESSOA')
          .select('PES_CODIGO, RAZAOSOCIAL, CNPJCPF')
          .or(`CNPJCPF.eq.${profileData.linked_client_value},PES_CODIGO.eq.${profileData.linked_client_value}`)
          .maybeSingle();

        if (clientData) {
          clientIds = [clientData.PES_CODIGO];
          clientNamesMap[clientData.PES_CODIGO] = clientData.RAZAOSOCIAL || 'Cliente';
        }
      } else if (profileData?.linked_client_type === 'CATEGORY' && profileData.linked_client_value) {
        isRestricted = true;
        const { data: clientsInCategory } = await (supabase as any)
          .from('BLUEBAY_PESSOA')
          .select('PES_CODIGO, RAZAOSOCIAL')
          .eq('NOME_CATEGORIA', profileData.linked_client_value);

        if (clientsInCategory) {
          clientIds = clientsInCategory.map((c: any) => c.PES_CODIGO);
          clientsInCategory.forEach((c: any) => {
            clientNamesMap[c.PES_CODIGO] = c.RAZAOSOCIAL || 'Cliente';
          });
        }
      }

      // 2. Fetch Data
      if (isRestricted) {
        // Restricted User: Fetch only for their Client IDs
        if (clientIds.length > 0) {
          const [ordersRes, titlesRes, invoicesRes] = await Promise.all([
            (supabase as any).from('BLUEBAY_PEDIDO').select('PED_NUMPEDIDO, PES_CODIGO, TOTAL_PRODUTO, STATUS, DATA_PEDIDO').in('PES_CODIGO', clientIds).order('DATA_PEDIDO', { ascending: false }).limit(20),
            (supabase as any).from('BLUEBAY_TITULO').select('NUMDOCUMENTO, PES_CODIGO, VLRTITULO, NUMNOTA, STATUS, DTVENCIMENTO').in('PES_CODIGO', clientIds.map(String)).order('DTVENCIMENTO', { ascending: false }).limit(20),
            (supabase as any).from('BLUEBAY_FATURAMENTO').select('NOTA, PES_CODIGO, VALOR_NOTA, DATA_EMISSAO').in('PES_CODIGO', clientIds).order('DATA_EMISSAO', { ascending: false }).limit(20)
          ]);

          if (ordersRes.data) setOrders(ordersRes.data.map((o: any) => ({ ...o, client_name: clientNamesMap[o.PES_CODIGO] })));
          if (titlesRes.data) setTitles(titlesRes.data.map((t: any) => ({ ...t, client_name: clientNamesMap[String(t.PES_CODIGO)] || clientNamesMap[Number(t.PES_CODIGO)] })));
          if (invoicesRes.data) setInvoices(invoicesRes.data.map((i: any) => ({ ...i, client_name: clientNamesMap[i.PES_CODIGO] })));
        }
      } else {
        // Admin or Unrestricted: Fetch ALL latest
        const [ordersRes, titlesRes, invoicesRes] = await Promise.all([
          (supabase as any).from('BLUEBAY_PEDIDO').select('PED_NUMPEDIDO, PES_CODIGO, TOTAL_PRODUTO, STATUS, DATA_PEDIDO').order('DATA_PEDIDO', { ascending: false }).limit(20),
          (supabase as any).from('BLUEBAY_TITULO').select('NUMDOCUMENTO, PES_CODIGO, VLRTITULO, NUMNOTA, STATUS, DTVENCIMENTO').order('DTVENCIMENTO', { ascending: false }).limit(20),
          (supabase as any).from('BLUEBAY_FATURAMENTO').select('NOTA, PES_CODIGO, VALOR_NOTA, DATA_EMISSAO').order('DATA_EMISSAO', { ascending: false }).limit(20)
        ]);

        // Collect distinct PES_CODIGO to fetch names
        const distinctClientIds = new Set<string>();
        ordersRes.data?.forEach((o: any) => { if (o.PES_CODIGO) distinctClientIds.add(String(o.PES_CODIGO)); });
        titlesRes.data?.forEach((t: any) => { if (t.PES_CODIGO) distinctClientIds.add(String(t.PES_CODIGO)); });
        invoicesRes.data?.forEach((i: any) => { if (i.PES_CODIGO) distinctClientIds.add(String(i.PES_CODIGO)); });

        if (distinctClientIds.size > 0) {
          const { data: clientsData } = await (supabase as any)
            .from('BLUEBAY_PESSOA')
            .select('PES_CODIGO, RAZAOSOCIAL')
            .in('PES_CODIGO', Array.from(distinctClientIds).map(Number)); // Assuming PES_CODIGO is number

          if (clientsData) {
            clientsData.forEach((c: any) => {
              clientNamesMap[c.PES_CODIGO] = c.RAZAOSOCIAL || 'Cliente';
            });
          }
        }

        if (ordersRes.data) setOrders(ordersRes.data.map((o: any) => ({ ...o, client_name: clientNamesMap[o.PES_CODIGO] || o.PES_CODIGO })));
        if (titlesRes.data) setTitles(titlesRes.data.map((t: any) => ({ ...t, client_name: clientNamesMap[String(t.PES_CODIGO)] || clientNamesMap[Number(t.PES_CODIGO)] || t.PES_CODIGO })));
        if (invoicesRes.data) setInvoices(invoicesRes.data.map((i: any) => ({ ...i, client_name: clientNamesMap[i.PES_CODIGO] || i.PES_CODIGO })));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({ title: 'Erro', description: 'Não foi possível carregar os dados.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number | null) => val ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val) : 'R$ 0,00';
  const formatDate = (date: string | null) => date ? format(new Date(date), 'dd/MM/yyyy', { locale: ptBR }) : '-';

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-primary font-display text-xl">Carregando...</div></div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Área do Cliente</h1>
          <p className="text-muted-foreground">Bem-vindo(a), {profile?.full_name || user?.email}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="shadow-card hover:shadow-elegant transition-shadow h-fit">
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5 text-primary" /> Meu Perfil</CardTitle></CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-12 w-full" /> : (
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{profile?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    {(profile?.linked_client_type === 'CNPJ' || profile?.linked_client_type === 'CATEGORY') && (
                      <Badge variant="outline" className="mt-1 text-xs">{profile.linked_client_type === 'CNPJ' ? 'Cliente Vinculado' : 'Categoria Vinculada'}</Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orders */}
          <Card className="shadow-card lg:col-span-2">
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Package className="h-5 w-5 text-primary" /> Histórico de Pedidos</CardTitle></CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-12 w-full" /> : orders.length === 0 ? <p className="text-center py-4 text-muted-foreground">Nenhum pedido encontrado.</p> : (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 text-xs font-semibold text-muted-foreground px-3"><div>Nº PEDIDO</div><div>CLIENTE</div><div className="text-right">VALOR</div><div className="text-right">STATUS</div></div>
                  {orders.slice(0, expandedSection.orders ? undefined : 5).map((o, i) => (
                    <div key={i} className="grid grid-cols-4 items-center p-3 rounded-lg bg-muted/30 text-sm">
                      <div className="font-medium">{o.PED_NUMPEDIDO}</div>
                      <div className="truncate" title={o.client_name}>{o.client_name || o.PES_CODIGO}</div>
                      <div className="text-right font-medium">{formatCurrency(o.TOTAL_PRODUTO)}</div>
                      <div className="text-right"><Badge variant="outline" className={statusColors[o.STATUS?.toUpperCase() || '']}>{o.STATUS}</Badge></div>
                    </div>
                  ))}
                  {orders.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 text-muted-foreground hover:text-primary"
                      onClick={() => toggleSection('orders')}
                    >
                      {expandedSection.orders ? 'Ver menos' : `Ver mais (${orders.length - 5} restantes)`}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Titles */}
          <Card className="shadow-card md:col-span-2 lg:col-span-3">
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5 text-primary" /> Meus Títulos</CardTitle></CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-12 w-full" /> : titles.length === 0 ? <p className="text-center py-4 text-muted-foreground">Nenhum título encontrado.</p> : (
                <div className="space-y-2">
                  <div className="grid grid-cols-5 text-xs font-semibold text-muted-foreground px-3"><div>CLIENTE</div><div>DOC</div><div>NOTA</div><div className="text-right">VALOR</div><div className="text-right">STATUS</div></div>
                  {titles.slice(0, expandedSection.titles ? undefined : 5).map((t, i) => (
                    <div key={i} className="grid grid-cols-5 items-center p-3 rounded-lg bg-muted/30 text-sm">
                      <div className="truncate" title={t.client_name}>{t.client_name || t.PES_CODIGO}</div>
                      <div>{t.NUMDOCUMENTO}</div>
                      <div>{t.NUMNOTA}</div>
                      <div className="text-right font-medium">{formatCurrency(t.VLRTITULO)}</div>
                      <div className="text-right"><Badge variant="outline" className={statusColors[t.STATUS?.toUpperCase() || '']}>{t.STATUS}</Badge></div>
                    </div>
                  ))}
                  {titles.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 text-muted-foreground hover:text-primary"
                      onClick={() => toggleSection('titles')}
                    >
                      {expandedSection.titles ? 'Ver menos' : `Ver mais (${titles.length - 5} restantes)`}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card className="shadow-card md:col-span-2 lg:col-span-3">
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><CheckCircle2 className="h-5 w-5 text-primary" /> Meus Faturamentos</CardTitle></CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-12 w-full" /> : invoices.length === 0 ? <p className="text-center py-4 text-muted-foreground">Nenhum faturamento encontrado.</p> : (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 text-xs font-semibold text-muted-foreground px-3"><div>NOTA</div><div>CLIENTE</div><div className="text-right">VALOR</div></div>
                  {invoices.slice(0, expandedSection.invoices ? undefined : 5).map((inv, i) => (
                    <div key={i} className="grid grid-cols-3 items-center p-3 rounded-lg bg-muted/30 text-sm">
                      <div>{inv.NOTA}</div>
                      <div className="truncate" title={inv.client_name}>{inv.client_name || inv.PES_CODIGO}</div>
                      <div className="text-right font-medium text-green-700">{formatCurrency(inv.VALOR_NOTA)}</div>
                    </div>
                  ))}
                  {invoices.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 text-muted-foreground hover:text-primary"
                      onClick={() => toggleSection('invoices')}
                    >
                      {expandedSection.invoices ? 'Ver menos' : `Ver mais (${invoices.length - 5} restantes)`}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
