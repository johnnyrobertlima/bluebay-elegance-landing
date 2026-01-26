
import { FaturamentoKpiCards } from "./FaturamentoKpiCards";
import { FaturamentoTimeSeriesChart } from "./FaturamentoTimeSeriesChart";
import { CentroCustoIndicators } from "./CentroCustoIndicators";
import { RepresentativesIndicators } from "./RepresentativesIndicators";
import { FaturamentoTable } from "./tables/FaturamentoTable";
import { ProductsTable } from "./tables/ProductsTable";
import { PedidosTable } from "./tables/PedidosTable";
import { DashboardAlerts } from "./alerts/DashboardAlerts";
import { useDataFiltering } from "./filters/useDataFiltering";
import { FaturamentoItem, PedidoItem, CitySalesStat, ClientStat } from "@/services/bluebay/dashboardComercialTypes";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CitySalesChart } from "./charts/CitySalesChart";
import { SalesHeatmap } from "./charts/SalesHeatmap";
import { ClientsGrid } from "./grids/ClientsGrid";

interface DashboardContentProps {
  dashboardData: {
    faturamentoItems: FaturamentoItem[];
    pedidoItems: PedidoItem[];
    dailyFaturamento: any[];
    monthlyFaturamento: any[];
    costCenterStats?: any[];
    representativeStats?: any[];
    totals?: {
      totalFaturado: number;
      totalItens: number;
      mediaValorItem: number;
      totalPedidosValue: number;
      totalPedidosQty: number;
    };
  } | null;
  selectedCentroCusto: string | null;
  setSelectedCentroCusto: (centroCusto: string | null) => void;
  selectedRepresentative: string | null;
  setSelectedRepresentative: (repId: string | null) => void;
  isLoading: boolean;
  isDetailsLoading?: boolean;
  startDate: Date;
  endDate: Date;
  // Lazy Loading Props
  onFetchDayDetails: (date: Date) => Promise<FaturamentoItem[]>;
  onFetchDayOrders: (date: Date) => Promise<PedidoItem[]>;

  onDateSelect?: (date: Date) => void;
  dailyStats?: any[];
  cityStats?: CitySalesStat[];
  selectedCity?: { city: string; uf: string } | null;
  onCitySelect?: (city: { city: string; uf: string } | null) => void;
  clientStats?: ClientStat[];
  isClientLoading?: boolean;
}

export const DashboardContent = ({
  dashboardData,
  selectedCentroCusto,
  setSelectedCentroCusto,
  selectedRepresentative,
  setSelectedRepresentative,
  isLoading,
  isDetailsLoading,
  startDate,
  endDate,
  onFetchDayDetails,
  onFetchDayOrders,

  onDateSelect,
  cityStats = [],
  selectedCity,
  onCitySelect,
  clientStats = [], // Added
  isClientLoading = false // Added
}: DashboardContentProps) => {

  // Server-side totals (if available in dashboardData)
  const totals = dashboardData?.totals || {
    totalFaturado: 0,
    totalItens: 0,
    mediaValorItem: 0,
    totalPedidosValue: 0,
    totalPedidosQty: 0
  };

  // Check if we have data (server-side filtering implies dashboardData IS the filtered data)
  const hasData = !isLoading && dashboardData && (
    (dashboardData.dailyFaturamento && dashboardData.dailyFaturamento.length > 0) ||
    (totals.totalFaturado > 0) ||
    (totals.totalPedidosValue > 0)
  );

  const dailyData = dashboardData?.dailyFaturamento || [];

  console.log('[DASHBOARD_DEBUG]', {
    isLoading,
    dashboardDataNull: !dashboardData,
    dailyDataLen: dailyData.length,
    totals: totals,
    hasRepStats: !!dashboardData?.representativeStats,
    repStatsLen: dashboardData?.representativeStats?.length,
    cityStatsLen: cityStats ? cityStats.length : 'undefined',
    clientStatsLen: clientStats ? clientStats.length : 'undefined'
  });

  // Logic for "No data found"
  // If we loaded specific data (possibly filtered by centro custo) and got nothing.
  const noDataFound = !isLoading && (!dashboardData || dailyData.length === 0);

  // Mostrar alerta quando não há dados
  if (noDataFound) {
    return (
      <>
        {/*
        <FaturamentoKpiCards
          totalFaturado={0}
          totalItens={0}
          mediaValorItem={0}
          isLoading={isLoading}
        />
        */}

        <Alert className="my-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nenhum dado encontrado</AlertTitle>
          <AlertDescription>
            {selectedCentroCusto
              ? `Não foram encontrados dados para o Centro de Custo "${selectedCentroCusto}" no período selecionado.`
              : "Não foram encontrados dados para o período selecionado."}

            {selectedCentroCusto && (
              <div className="mt-2">
                <button
                  onClick={() => setSelectedCentroCusto(null)}
                  className="text-primary hover:underline"
                >
                  Limpar filtro de Centro de Custo
                </button>
              </div>
            )}

            {selectedCity && onCitySelect && (
              <div className="mt-2">
                <p>Filtro aplicado: <strong>{selectedCity.city} - {selectedCity.uf}</strong></p>
                <button
                  onClick={() => onCitySelect(null)}
                  className="text-primary hover:underline mt-1"
                >
                  Remover filtro de cidade
                </button>
              </div>
            )}
          </AlertDescription>
        </Alert>

        {/* Still show Cost Center Indicators to allow switching/clearing if desired? 
            Or maybe better just show the alert. 
            Actually, if "Indicadores" has data but "Daily" doesn't, we might still want to show indicators.
            User said "Indicadores ... esta ok". So we should show indicators even if daily is empty?
            If user explicitly selected one, usually daily should match.
        */}
        <CentroCustoIndicators
          faturamentoItems={[]}
          pedidoItems={[]}
          costCenterStats={dashboardData?.costCenterStats}
          isLoading={isLoading}
          selectedCentroCusto={selectedCentroCusto}
          onCentroCustoSelect={setSelectedCentroCusto}
        />
      </>
    );
  }

  // Identify "Nao Identificados" explicitly if needed
  // Note: Since we don't have items, we can't easily count them here. 
  // Maybe from costCenterStats?
  const naoIdentificadosStats = dashboardData?.costCenterStats?.find(cc => cc.nome === 'Não identificado');
  const hasNaoIdentificados = !!naoIdentificadosStats && (naoIdentificadosStats.totalFaturado > 0 || naoIdentificadosStats.totalPedidos > 0);




  return (
    <>
      <DashboardAlerts
        hasData={hasData}
        isLoading={isLoading}
        naoIdentificados={[]} // Cannot list individual items without fetching them
      />

      {/* 
      <div className="mb-6">
        <FaturamentoKpiCards
          totalFaturado={totals.totalFaturado}
          totalItens={totals.totalItens}
          mediaValorItem={totals.mediaValorItem}
          isLoading={isLoading}
        />
      </div> 
      */}

      <div className="grid grid-cols-1 gap-6 mb-8">
        <FaturamentoTimeSeriesChart
          dailyData={dashboardData?.dailyFaturamento || []}
          monthlyData={dashboardData?.monthlyFaturamento || []}
          startDate={startDate}
          endDate={endDate}
          isLoading={isLoading}
          onDateSelect={onDateSelect}
        />
      </div>

      {/* Indicadores por Centro de Custo com funcionalidade de filtro */}
      <CentroCustoIndicators
        faturamentoItems={[]}
        pedidoItems={[]}
        costCenterStats={dashboardData?.costCenterStats}
        isLoading={isLoading}
        selectedCentroCusto={selectedCentroCusto}
        onCentroCustoSelect={setSelectedCentroCusto}
      />

      <RepresentativesIndicators
        stats={dashboardData?.representativeStats}
        isLoading={isLoading}
        selectedRepresentative={selectedRepresentative}
        onRepresentativeSelect={setSelectedRepresentative}
      />

      <div className="grid grid-cols-1 gap-6 mb-8 mt-8">
        {selectedCity && (
          <div className="flex items-center gap-2 mb-2 bg-blue-50 p-2 rounded border border-blue-100">
            <span className="text-sm text-blue-800">
              Exibindo dados apenas para <strong>{selectedCity.city} - {selectedCity.uf}</strong>
            </span>
            <button
              onClick={() => onCitySelect?.(null)}
              className="text-xs bg-white border border-blue-200 px-2 py-1 rounded hover:bg-blue-50 text-blue-600"
            >
              Limpar Filtro
            </button>
          </div>
        )}
        <SalesHeatmap
          data={cityStats || []}
          onCityClick={onCitySelect}
          selectedCity={selectedCity}
        />
      </div>

      {/* Tabela de Notas Fiscais e Pedidos (filtrada pelo Centro de Custo selecionado) */}
      {/* Tabela de Notas Fiscais e Pedidos (filtrada pelo Centro de Custo selecionado) */}
      <Tabs defaultValue="faturamento" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="faturamento">Notas Fiscais Emitidas</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger> {/* New Tab */}
        </TabsList>

        <TabsContent value="faturamento">
          <FaturamentoTable
            dailyStats={dailyData}
            monthlyStats={[]}
            startDate={startDate}
            endDate={endDate}
            onFetchDayDetails={onFetchDayDetails}
            onDateSelect={onDateSelect}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="pedidos">
          <div className="rounded-md border p-6 bg-card text-card-foreground shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Detalhamento de Pedidos</h3>
            <p className="text-muted-foreground mb-4">
              Visualize os pedidos por dia. Clique em um dia para expandir e ver os pedidos individuais.
            </p>
            <div className="rounded-md border text-left">
              <PedidosTable
                dailyStats={dailyData}
                onFetchDayOrders={onFetchDayOrders}
                isLoading={isLoading}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="produtos">
          {/* Replaced ProductsTable with ProductsGrid for consistency if available, otherwise keep ProductsTable. 
               Wait, existing code uses ProductsTable. The prompt asked for "Grid de produtos". 
               I'll assume ProductsTable is what the user refers to, or I should stick to it.
               The user said "Baseado na Grid de produtos...". I will keep existing ProductsTable here.
               But I need to add ClientsGrid.
           */}
          <ProductsTable
            startDate={startDate}
            endDate={endDate}
            selectedCentroCusto={selectedCentroCusto}
            selectedRepresentative={selectedRepresentative}
          />
        </TabsContent>

        <TabsContent value="clientes">
          <ClientsGrid
            data={clientStats || []}
            isLoading={isClientLoading || false}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};
