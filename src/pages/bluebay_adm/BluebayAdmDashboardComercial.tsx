
import { useState, useCallback, useEffect } from "react";
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
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
    error,
    startDate,
    endDate,
    setDateRange,
    refreshData,
    selectedCentroCusto,
    setSelectedCentroCusto
  } = useDashboardComercial();
  
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
        <BluebayAdmBanner />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <BluebayAdmMenu />
          </div>
          
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
      <BluebayAdmBanner />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <BluebayAdmMenu />
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Dashboard Comercial</h1>
        
        <DashboardComercialFilters
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={setDateRange}
          onRefresh={refreshData}
          isLoading={isLoading}
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
            isLoading={isLoading}
            startDate={startDate}
            endDate={endDate}
          />
        )}
      </div>
    </div>
  );
};

export default BluebayAdmDashboardComercial;
