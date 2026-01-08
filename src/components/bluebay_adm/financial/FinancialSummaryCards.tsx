
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { AlarmClock, CheckCircle, CreditCard } from "lucide-react";

interface FinancialSummaryCardsProps {
  totalValoresVencidos: number;
  totalPago: number;
  totalEmAberto: number;
  label?: string;
}

export const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  totalValoresVencidos,
  totalPago,
  totalEmAberto,
  label
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {label ? `${label} - Valores Vencidos` : "Valores Vencidos"}
            </p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalValoresVencidos)}</p>
          </div>
          <AlarmClock className="h-8 w-8 text-red-400" />
        </CardContent>
      </Card>
      
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {label ? `${label} - Valores Pagos` : "Valores Pagos"}
            </p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPago)}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-400" />
        </CardContent>
      </Card>
      
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {label ? `${label} - Valores em Aberto` : "Valores em Aberto"}
            </p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalEmAberto)}</p>
          </div>
          <CreditCard className="h-8 w-8 text-blue-400" />
        </CardContent>
      </Card>
    </div>
  );
};
