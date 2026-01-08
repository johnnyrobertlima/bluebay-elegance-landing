
import { FaturamentoKpiCards } from "./FaturamentoKpiCards";
import { FaturamentoTimeSeriesChart } from "./FaturamentoTimeSeriesChart";
import { CentroCustoIndicators } from "./CentroCustoIndicators";
import { FaturamentoTable } from "./FaturamentoTable";
import { DashboardAlerts } from "./alerts/DashboardAlerts";
import { useDataFiltering } from "./filters/useDataFiltering";
import { FaturamentoItem, PedidoItem } from "@/services/bluebay/dashboardComercialTypes";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DashboardContentProps {
  dashboardData: {
    faturamentoItems: FaturamentoItem[];
    pedidoItems: PedidoItem[];
    dailyFaturamento: any[];
    monthlyFaturamento: any[];
  } | null;
  selectedCentroCusto: string | null;
  setSelectedCentroCusto: (centroCusto: string | null) => void;
  isLoading: boolean;
  startDate: Date;
  endDate: Date;
}

export const DashboardContent = ({
  dashboardData,
  selectedCentroCusto,
  setSelectedCentroCusto,
  isLoading,
  startDate,
  endDate
}: DashboardContentProps) => {
  // Obter dados filtrados e calculados
  const {
    filteredFaturamentoItems,
    filteredPedidoItems,
    calculatedTotals,
    naoIdentificados,
    hasFilteredData
  } = useDataFiltering(dashboardData, selectedCentroCusto, isLoading);

  // Verifica se há dados disponíveis
  const hasData = !isLoading && dashboardData && 
    ((Array.isArray(dashboardData.faturamentoItems) && dashboardData.faturamentoItems.length > 0) || 
     (Array.isArray(dashboardData.pedidoItems) && dashboardData.pedidoItems.length > 0));
  
  // Para o caso "Não identificado", verificamos apenas os faturamentoItems, pois é onde esses dados aparecem
  const hasNaoIdentificadoData = selectedCentroCusto === "Não identificado" && 
    filteredFaturamentoItems.length > 0;
    
  // Agora verificamos corretamente se não há dados após a filtragem, considerando o caso especial "Não identificado"
  const noDataAfterFiltering = !isLoading && hasData && selectedCentroCusto && 
    !hasFilteredData && !hasNaoIdentificadoData;

  // Mostrar alerta quando não há dados após a filtragem
  if (noDataAfterFiltering) {
    return (
      <>
        <FaturamentoKpiCards
          totalFaturado={0}
          totalItens={0}
          mediaValorItem={0}
          isLoading={isLoading}
        />
        
        <Alert className="my-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nenhum dado encontrado</AlertTitle>
          <AlertDescription>
            Não foram encontrados dados para o Centro de Custo "{selectedCentroCusto}" no período selecionado.
            <div className="mt-2">
              <button
                onClick={() => setSelectedCentroCusto(null)}
                className="text-primary hover:underline"
              >
                Limpar filtro de Centro de Custo
              </button>
            </div>
          </AlertDescription>
        </Alert>
      </>
    );
  }

  return (
    <>
      <DashboardAlerts 
        hasData={hasData} 
        isLoading={isLoading} 
        naoIdentificados={naoIdentificados || []} 
      />

      <div className="mb-6">
        <FaturamentoKpiCards
          totalFaturado={calculatedTotals.totalFaturado}
          totalItens={calculatedTotals.totalItens}
          mediaValorItem={calculatedTotals.mediaValorItem}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <FaturamentoTimeSeriesChart
          dailyData={dashboardData?.dailyFaturamento || []}
          monthlyData={dashboardData?.monthlyFaturamento || []}
          startDate={startDate}
          endDate={endDate}
          isLoading={isLoading}
        />
      </div>
      
      {/* Indicadores por Centro de Custo com funcionalidade de filtro */}
      <CentroCustoIndicators 
        faturamentoItems={dashboardData?.faturamentoItems || []}
        pedidoItems={dashboardData?.pedidoItems || []}
        isLoading={isLoading}
        selectedCentroCusto={selectedCentroCusto}
        onCentroCustoSelect={setSelectedCentroCusto}
      />
      
      {/* Tabela de Notas Fiscais e Pedidos (filtrada pelo Centro de Custo selecionado) */}
      <FaturamentoTable 
        faturamentoData={filteredFaturamentoItems}
        pedidoData={filteredPedidoItems}
        isLoading={isLoading}
      />
    </>
  );
};
