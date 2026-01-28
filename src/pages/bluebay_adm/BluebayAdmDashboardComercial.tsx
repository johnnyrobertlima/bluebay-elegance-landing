
import { useState, useCallback, useEffect } from "react";
import { subDays } from "date-fns";

import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { DashboardComercialFilters } from "@/components/bluebay_adm/dashboard-comercial/DashboardComercialFilters";
import { useDashboardComercial } from "@/hooks/bluebay_adm/dashboard/useDashboardComercial";
import { DashboardContent } from "@/components/bluebay_adm/dashboard-comercial/DashboardContent";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const BluebayAdmDashboardComercial = () => {
  const {
    dashboardData,
    isLoading,
    isDetailsLoading,
    error,
    startDate,
    endDate,
    setDateRange,
    refreshData,
    selectedCentroCusto,
    setSelectedCentroCusto,
    selectedRepresentative,
    setSelectedRepresentative,
    fetchDayData,
    fetchDayOrderData,
    cityStats,
    selectedCity,
    setSelectedCity,
    clientStats,
    isClientLoading,
    productStats,
    isProductLoading,
    selectedClient,
    setSelectedClient,
    selectedProduct,
    setSelectedProduct
  } = useDashboardComercial();

  const handleDateSelect = useCallback((date: Date) => {
    // When clicking a day on chart, set range to that day
    setDateRange(date, date);
  }, [setDateRange]);

  const handleClearFilters = useCallback(() => {
    // Reset to default date range (30 days) and clear cost center
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    setDateRange(thirtyDaysAgo, today);
    setSelectedCentroCusto(null);
    setSelectedRepresentative(null);
    setSelectedCity(null);
    setSelectedClient(null);
    setSelectedProduct(null);
  }, [setDateRange, setSelectedCentroCusto, setSelectedRepresentative, setSelectedCity, setSelectedClient, setSelectedProduct]);

  const { toast } = useToast();
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  // Effect para lidar com erros de carregamento
  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro ao carregar os dados do dashboard. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Effect para verificar quando terminou o carregamento inicial
  useEffect(() => {
    if (!isLoading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isLoading, isInitialLoad]);

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <BluebayAdmMenu />
        <div className="container mx-auto px-4 py-8">


          <h1 className="text-3xl font-bold mb-6">Dashboard Comercial</h1>

          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar dados</AlertTitle>
            <AlertDescription>
              {error.message || "Não foi possível carregar os dados do dashboard. Tente novamente mais tarde."}
              <div className="mt-4">
                <button
                  onClick={() => refreshData()}
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
                >
                  Tentar novamente
                </button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BluebayAdmMenu />
      <div className="container mx-auto px-4 py-8">


        <h1 className="text-3xl font-bold mb-6">Dashboard Comercial</h1>

        <DashboardComercialFilters
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={setDateRange}
          onRefresh={refreshData}
          isLoading={isLoading || isDetailsLoading}
          // Filters
          selectedRepresentative={selectedRepresentative}
          setSelectedRepresentative={setSelectedRepresentative}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
        />

        {isLoading && isInitialLoad ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Carregando dados do dashboard...</p>
            </div>
          </div>
        ) : (
          <DashboardContent
            dashboardData={dashboardData}
            selectedCentroCusto={selectedCentroCusto}
            setSelectedCentroCusto={setSelectedCentroCusto}
            selectedRepresentative={selectedRepresentative}
            setSelectedRepresentative={setSelectedRepresentative}
            isLoading={isLoading}
            isDetailsLoading={isDetailsLoading}
            startDate={startDate}
            endDate={endDate}
            onFetchDayDetails={fetchDayData}
            onFetchDayOrders={fetchDayOrderData}
            cityStats={cityStats}
            onDateSelect={handleDateSelect}
            selectedCity={selectedCity}
            onCitySelect={setSelectedCity}
            clientStats={clientStats}
            isClientLoading={isClientLoading}
            selectedClient={selectedClient}
            selectedProduct={selectedProduct}
          />
        )}
      </div>
    </div>
  );
};

export default BluebayAdmDashboardComercial;
