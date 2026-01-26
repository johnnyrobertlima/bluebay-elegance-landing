import React, { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CitySalesStat } from "@/service/bluebay/dashboardComercialTypes";

interface CitySalesChartProps {
    data: CitySalesStat[];
    title?: string;
    limit?: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function CitySalesChart({ data, title = "Vendas por Cidade/UF", limit = 20 }: CitySalesChartProps) {

    const chartData = useMemo(() => {
        // Take top N
        return data.slice(0, limit).map(item => ({
            ...item,
            name: `${item.city}/${item.uf}`,
            formattedTotal: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalFaturado)
        }));
    }, [data, limit]);

    if (!data || data.length === 0) {
        return (
            <Card className="col-span-1 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-gray-400">
                    Nenhum dado disponível.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 shadow-sm">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            layout="vertical" // Vertical layout for city names
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={150}
                                tick={{ fontSize: 11 }}
                                interval={0}
                            />
                            <Tooltip
                                formatter={(value: any, name: any, props: any) => [
                                    props.payload.formattedTotal,
                                    "Total Faturado"
                                ]}
                                labelStyle={{ color: 'black' }}
                            />
                            <Bar dataKey="totalFaturado" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
