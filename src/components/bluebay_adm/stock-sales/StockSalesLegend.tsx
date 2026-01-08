
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Star, TrendingUp, TrendingDown, Info } from "lucide-react";

export const StockSalesLegend: React.FC = () => {
  return (
    <Card className="mt-6 bg-gray-50">
      <CardContent className="pt-6">
        <div className="flex items-center mb-2">
          <Info className="h-4 w-4 text-blue-500 mr-2" />
          <h3 className="text-sm font-semibold">Legenda de Indicadores</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded bg-red-50 mr-2"></div>
              <span className="text-xs text-gray-700 flex items-center">
                <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
                Estoque Baixo (menor que 5 unidades)
              </span>
            </div>
            
            <div className="flex items-center">
              <div className="w-3 h-3 rounded bg-blue-50 mr-2"></div>
              <span className="text-xs text-gray-700 flex items-center">
                <Badge className="h-4 bg-blue-600 text-[10px]">Novo</Badge>
                <span className="ml-1">Produto Novo (últimos 60 dias)</span>
              </span>
            </div>
            
            <div className="flex items-center">
              <div className="w-3 h-3 rounded bg-yellow-50 mr-2"></div>
              <span className="text-xs text-gray-700 flex items-center">
                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                Top 10 em Vendas
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-xs text-gray-700">
                <strong>Giro de Estoque:</strong> Qtd. Vendida / Estoque Físico
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="text-xs text-gray-700 flex items-center">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                Giro Alto (&gt; 1): Produto com alta rotatividade
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="text-xs text-gray-700 flex items-center">
                <TrendingDown className="h-3 w-3 text-amber-600 mr-1" />
                Giro Baixo (&lt; 1): Produto com baixa rotatividade
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-xs text-gray-700">
                <strong>% Estoque Vendido:</strong> (Qtd. Vendida / (Qtd. Vendida + Estoque)) × 100
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="text-xs text-gray-700">
                <strong>Dias de Cobertura:</strong> Estoque / Média diária de vendas
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="text-xs text-gray-700">
                <strong>∞:</strong> Sem vendas no período (cobertura infinita)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
