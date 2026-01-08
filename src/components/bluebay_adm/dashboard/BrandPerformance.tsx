
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandData } from "@/types/bluebay/dashboardTypes";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BrandPerformanceProps {
  data: BrandData | null;
}

export const BrandPerformance = ({ data }: BrandPerformanceProps) => {
  if (!data) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Carregando dados de marcas...</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <div className="h-full w-full bg-gray-100 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Desempenho por Marca</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart for Brand Performance */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.items}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="brand" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="totalOrders"
                  name="Total Pedidos (R$)"
                  fill="#8884d8"
                />
                <Bar
                  yAxisId="right"
                  dataKey="totalBilled"
                  name="Total Faturado (R$)"
                  fill="#82ca9d"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table for Detailed Brand Data */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marca</TableHead>
                  <TableHead className="text-right">Pedidos (R$)</TableHead>
                  <TableHead className="text-right">Faturado (R$)</TableHead>
                  <TableHead className="text-right">Conversão</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.brand}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.totalOrders)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.totalBilled)}</TableCell>
                    <TableCell className="text-right">{item.conversionRate.toFixed(2)}%</TableCell>
                    <TableCell className="text-right">{formatNumber(item.volume)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
