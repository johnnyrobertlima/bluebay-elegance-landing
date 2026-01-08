
import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FaturamentoItem, PedidoItem } from '@/services/bluebay/dashboardComercialTypes';
import { Badge } from '@/components/ui/badge';
import { processarIndicadoresCentroCusto } from './utils/pedidoUtils';
import { CentroCustoLoading } from './centro-custo/CentroCustoLoading';
import { CentroCustoTable } from './centro-custo/CentroCustoTable';

interface CentroCustoIndicatorsProps {
  faturamentoItems: FaturamentoItem[];
  pedidoItems: PedidoItem[];
  isLoading: boolean;
  selectedCentroCusto: string | null;
  onCentroCustoSelect: (centroCusto: string | null) => void;
}

export const CentroCustoIndicators = ({ 
  faturamentoItems, 
  pedidoItems, 
  isLoading,
  selectedCentroCusto,
  onCentroCustoSelect
}: CentroCustoIndicatorsProps) => {
  // Processar os dados por CENTROCUSTO
  const indicadoresPorCentroCusto = useMemo(() => {
    return processarIndicadoresCentroCusto(faturamentoItems, pedidoItems);
  }, [faturamentoItems, pedidoItems]);

  const handleCentroCustoClick = (centroCusto: string) => {
    if (selectedCentroCusto === centroCusto) {
      // Se já está selecionado, desmarcar (filtro removido)
      onCentroCustoSelect(null);
    } else {
      // Selecionar este centroCusto como filtro
      onCentroCustoSelect(centroCusto);
    }
  };

  // Renderizar estado de carregamento
  if (isLoading) {
    return <CentroCustoLoading />;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Indicadores por Centro de Custo</CardTitle>
        {selectedCentroCusto && (
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-secondary"
            onClick={() => onCentroCustoSelect(null)}
          >
            Limpar filtro
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <CentroCustoTable 
          indicadores={indicadoresPorCentroCusto}
          selectedCentroCusto={selectedCentroCusto}
          onCentroCustoSelect={handleCentroCustoClick}
        />
      </CardContent>
    </Card>
  );
};
