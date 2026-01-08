
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliveryData } from "@/types/bluebay/dashboardTypes";
import { formatNumber } from "@/utils/formatters";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface DeliveryEfficiencyProps {
  data: DeliveryData | null;
}

export const DeliveryEfficiency = ({ data }: DeliveryEfficiencyProps) => {
  if (!data) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Carregando eficiência de entrega...</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <div className="h-full w-full bg-gray-100 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const pieData = [
    { name: 'Totalmente Atendidos', value: data.fullyDeliveredPercentage, color: '#22c55e' },
    { name: 'Parcialmente Atendidos', value: data.partialPercentage, color: '#f59e0b' },
    { name: 'Em Aberto', value: data.openPercentage, color: '#ef4444' },
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Eficiência de Entrega</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `${Number(value).toFixed(2)}%`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 place-content-center">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-1">Status dos Pedidos</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="inline-block w-4 h-4 rounded-full bg-green-500 mr-2"></span>
                      Totalmente Atendidos
                    </div>
                    <span className="font-semibold">{data.fullyDeliveredPercentage.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="inline-block w-4 h-4 rounded-full bg-amber-500 mr-2"></span>
                      Parcialmente Atendidos
                    </div>
                    <span className="font-semibold">{data.partialPercentage.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="inline-block w-4 h-4 rounded-full bg-red-500 mr-2"></span>
                      Em Aberto
                    </div>
                    <span className="font-semibold">{data.openPercentage.toFixed(2)}%</span>
                  </div>
                  
                  <div className="border-t pt-4 mt-2">
                    <div className="flex justify-between items-center">
                      <span>Quantidade Média Pendente por Pedido:</span>
                      <span className="font-bold">{formatNumber(data.averageRemainingQuantity)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
