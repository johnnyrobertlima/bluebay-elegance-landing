
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  PercentIcon,
  AlertCircle
} from "lucide-react";
import { KpiData } from "@/types/bluebay/dashboardTypes";

interface KpiCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const KpiCard = ({ title, value, description, icon, trend, trendValue }: KpiCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className={`flex items-center mt-2 text-xs ${
            trend === 'up' ? 'text-emerald-500' : 
            trend === 'down' ? 'text-rose-500' : 
            'text-gray-500'
          }`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : 
             trend === 'down' ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
            <span>{trendValue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface KpiCardsProps {
  data: KpiData | null;
}

export const KpiCards = ({ data }: KpiCardsProps) => {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Carregando...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-7 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      <KpiCard
        title="Total de Pedidos"
        value={formatCurrency(data.totalOrders)}
        description="Valor total dos pedidos"
        icon={<DollarSign className="h-4 w-4" />}
      />
      
      <KpiCard
        title="Total Faturado"
        value={formatCurrency(data.totalBilled)}
        description="Valor total faturado"
        icon={<DollarSign className="h-4 w-4" />}
      />
      
      <KpiCard
        title="Taxa de Conversão"
        value={`${data.conversionRate.toFixed(2)}%`}
        description="Faturado ÷ Pedidos"
        icon={<PercentIcon className="h-4 w-4" />}
        trend={data.conversionRate >= 80 ? 'up' : data.conversionRate >= 50 ? 'neutral' : 'down'}
        trendValue={data.conversionRate >= 80 ? 'Ótima' : data.conversionRate >= 50 ? 'Regular' : 'Baixa'}
      />
      
      <KpiCard
        title="Volume de Peças Pedidas"
        value={formatNumber(data.orderedPieces)}
        description="Total de itens pedidos"
        icon={<Package className="h-4 w-4" />}
      />
      
      <KpiCard
        title="Volume de Peças Faturadas"
        value={formatNumber(data.billedPieces)}
        description="Total de itens faturados"
        icon={<Package className="h-4 w-4" />}
      />
      
      <KpiCard
        title="Desconto Médio"
        value={`${data.averageDiscount.toFixed(2)}%`}
        description="Média ponderada de descontos"
        icon={<PercentIcon className="h-4 w-4" />}
        trend={data.averageDiscount <= 5 ? 'up' : data.averageDiscount <= 15 ? 'neutral' : 'down'}
        trendValue={data.averageDiscount <= 5 ? 'Baixo' : data.averageDiscount <= 15 ? 'Regular' : 'Alto'}
      />
    </div>
  );
};
