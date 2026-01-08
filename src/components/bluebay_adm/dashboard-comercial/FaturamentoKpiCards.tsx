
import { 
  CreditCard, 
  DollarSign, 
  Package, 
  TrendingUp
} from 'lucide-react';

interface KpiCardsProps {
  totalFaturado: number;
  totalItens: number;
  mediaValorItem: number;
  isLoading: boolean;
}

// Formatador de números para moeda brasileira
const formatCurrency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

// Formatador de números com separador de milhar
const formatNumber = new Intl.NumberFormat('pt-BR');

export const FaturamentoKpiCards = ({ 
  totalFaturado, 
  totalItens, 
  mediaValorItem,
  isLoading
}: KpiCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      <div className="rounded-xl bg-card text-card-foreground shadow">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/20 p-3">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none text-muted-foreground">
                Total Faturado
              </p>
              {isLoading ? (
                <div className="h-2 w-24 animate-pulse rounded bg-muted mt-2.5"></div>
              ) : (
                <h2 className="text-xl font-bold">
                  {formatCurrency.format(totalFaturado)}
                </h2>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-card text-card-foreground shadow">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none text-muted-foreground">
                Total de Itens
              </p>
              {isLoading ? (
                <div className="h-2 w-24 animate-pulse rounded bg-muted mt-2.5"></div>
              ) : (
                <h2 className="text-xl font-bold">
                  {formatNumber.format(totalItens)}
                </h2>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-card text-card-foreground shadow">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none text-muted-foreground">
                Ticket Médio por Item
              </p>
              {isLoading ? (
                <div className="h-2 w-24 animate-pulse rounded bg-muted mt-2.5"></div>
              ) : (
                <h2 className="text-xl font-bold">
                  {formatCurrency.format(mediaValorItem)}
                </h2>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
