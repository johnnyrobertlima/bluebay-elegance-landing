
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeSeriesData } from "@/types/bluebay/dashboardTypes";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, TooltipProps } from "recharts";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { ptBR } from "date-fns/locale";
import { format, parse } from "date-fns";

// Format month year for display
const formatMonthYear = (dateStr: string) => {
  try {
    // Fix: Parse date properly without providing locale as a direct parameter
    const date = parse(dateStr, 'yyyy-MM', new Date());
    return format(date, 'MMM/yy', { locale: ptBR });
  } catch (e) {
    return dateStr;
  }
};

// Custom tooltip formatter for currency values
const currencyFormatter = (value: number) => formatCurrency(value);

// Custom tooltip formatter for number values
const numberFormatter = (value: number) => formatNumber(value);

interface TimeSeriesChartsProps {
  data: TimeSeriesData | null;
}

export const TimeSeriesCharts = ({ data }: TimeSeriesChartsProps) => {
  if (!data) {
    return <div className="space-y-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Carregando dados temporais...</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <div className="h-full w-full bg-gray-100 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    </div>;
  }

  const customTickFormatter = (value: string) => formatMonthYear(value);

  return (
    <div className="space-y-6 mb-6">
      {/* Chart 1: Monthly Evolution of Orders vs Billing (in R$) */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Mensal: Pedidos vs Faturamento (R$)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.monthlySeries}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={customTickFormatter} 
                tickMargin={10}
              />
              <YAxis tickFormatter={currencyFormatter} />
              <Tooltip 
                formatter={currencyFormatter}
                labelFormatter={customTickFormatter}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ordersValue" 
                name="Valor Pedidos" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="billedValue" 
                name="Valor Faturado" 
                stroke="#82ca9d"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 2: Monthly Evolution of Volume (Ordered Pieces vs Billed Pieces) */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Mensal: Volume (Peças Pedidas vs Faturadas)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.monthlySeries}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={customTickFormatter} 
                tickMargin={10}
              />
              <YAxis tickFormatter={numberFormatter} />
              <Tooltip 
                formatter={numberFormatter}
                labelFormatter={customTickFormatter}
              />
              <Legend />
              <Bar 
                dataKey="orderedPieces" 
                name="Peças Pedidas" 
                fill="#8884d8" 
              />
              <Bar 
                dataKey="billedPieces" 
                name="Peças Faturadas" 
                fill="#82ca9d" 
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
