
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  Star,
  BadgeAlert,
  CalendarDays,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface SummaryStats {
  totalItems: number;
  totalStock: number;
  totalSales: number;
  totalValue: number;
  lowStockItems: number;
  newProducts: number;
  top10Items: number;
}

interface StockSalesSummaryProps {
  stats: SummaryStats | null;
  usingSampleData?: boolean;
  onFilterLowStock: () => void;
  onFilterNewProducts: () => void;
}

export const StockSalesSummary: React.FC<StockSalesSummaryProps> = ({ 
  stats, 
  usingSampleData = false,
  onFilterLowStock,
  onFilterNewProducts
}) => {
  if (!stats) return null;

  return (
    <div className="space-y-4">
      {usingSampleData && (
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Exibindo dados de exemplo. Os dados reais do banco de dados não estão disponíveis para o período selecionado.
          </AlertDescription>
        </Alert>
      )}
    
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens em Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              Estoque total: {stats.totalStock.toLocaleString('pt-BR')} unidades
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas no Período</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              Valor: {formatCurrency(stats.totalValue)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200 cursor-pointer hover:bg-red-100 transition-colors" onClick={onFilterLowStock}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowStockItems.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-red-600">
              Itens com menos de 5 unidades disponíveis
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors" onClick={onFilterNewProducts}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Produtos</CardTitle>
            <BadgeAlert className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.newProducts.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-blue-600">
              Cadastrados nos últimos 60 dias
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
