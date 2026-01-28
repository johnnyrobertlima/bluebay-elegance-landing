
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { differenceInMonths } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  Legend
} from 'recharts';
import { DailyFaturamento, MonthlyFaturamento } from '@/services/bluebay/dashboardComercialTypes';

// Formatador de números para moeda brasileira
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-4 rounded-md shadow-md">
        <p className="font-medium text-foreground">{label}</p>
        {payload.map((entry, index) => (
          <p key={`tooltip-${index}`} style={{ color: entry.color }} className="text-sm">
            {entry.name === 'Faturado' ? 'Faturamento: ' : 'Pedido: '}
            {currencyFormatter.format(entry.value)}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

interface ChartData {
  label: string;
  value: number;
  pedidoValue: number;
  formattedLabel: string;
}

interface FaturamentoChartProps {
  dailyData: DailyFaturamento[];
  monthlyData: MonthlyFaturamento[];
  startDate: Date;
  endDate: Date;
  isLoading: boolean;
}

export const FaturamentoTimeSeriesChart = ({
  dailyData,
  monthlyData,
  startDate,
  endDate,
  isLoading
}: FaturamentoChartProps) => {
  const chartData = useMemo(() => {
    // Determinar se deve usar dados diários ou mensais
    const monthsDiff = differenceInMonths(endDate, startDate);

    // Se o período for maior que 2 meses, agrupa os dados diários por mês no frontend
    // Isso garante consistência com o gráfico diário e evita problemas de agregação no backend
    if (monthsDiff > 2) {
      const monthlyAggregation = new Map<string, { total: number; pedidoTotal: number; formattedLabel: string }>();

      dailyData.forEach(item => {
        // Data vem como YYYY-MM-DD
        const monthKey = item.date.substring(0, 7); // YYYY-MM
        const current = monthlyAggregation.get(monthKey) || { total: 0, pedidoTotal: 0, formattedLabel: '' };

        // Atualiza totais
        current.total += item.total || 0;
        current.pedidoTotal += item.pedidoTotal || 0;

        // Define label formatada se ainda não tiver (pega do primeiro item ou formata manual)
        if (!current.formattedLabel) {
          const [year, month] = monthKey.split('-');
          const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
          current.formattedLabel = dateObj.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
          // Capitalize first letter
          current.formattedLabel = current.formattedLabel.charAt(0).toUpperCase() + current.formattedLabel.slice(1);
        }

        monthlyAggregation.set(monthKey, current);
      });

      // Se houver meses faltando (buracos), a gente poderia preencher, mas o map só tem dias com dados.
      // O backend traria meses vazios?
      // Melhor usar o backend monthlyData apenas para garantir as chaves de meses se quisermos eixo X completo,
      // mas os valores pegamos do daily aggregation.
      // Simplificando: vamos converter o Map para array e ordenar.

      return Array.from(monthlyAggregation.entries())
        .map(([key, value]) => ({
          label: key,
          value: value.total,
          pedidoValue: value.pedidoTotal,
          formattedLabel: value.formattedLabel
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

    } else {
      // Caso contrário, usa dados diários
      return [...dailyData]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(item => ({
          label: item.date,
          value: item.total,
          pedidoValue: item.pedidoTotal,
          formattedLabel: item.formattedDate
        }));
    }
  }, [dailyData, startDate, endDate]); // Remove monthlyData dependency as we calculate it

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Evolução do Período</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 70,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="formattedLabel"
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis
                tickFormatter={(value) => currencyFormatter.format(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                name="Faturado"
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
              <Line
                name="Pedido"
                type="monotone"
                dataKey="pedidoValue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
