
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { DashboardHeader } from "@/components/bluebay_adm/dashboard/DashboardHeader";
import { KpiCards } from "@/components/bluebay_adm/dashboard/KpiCards";
import { TimeSeriesCharts } from "@/components/bluebay_adm/dashboard/TimeSeriesCharts";
import { BrandPerformance } from "@/components/bluebay_adm/dashboard/BrandPerformance";
import { DeliveryEfficiency } from "@/components/bluebay_adm/dashboard/DeliveryEfficiency";
import { useDashboardData } from "@/hooks/bluebay_adm/dashboard/useDashboardData";
import { DashboardFilters } from "@/components/bluebay_adm/dashboard/DashboardFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { FiltersProvider } from "@/contexts/bluebay_adm/FiltersContext";
import { PaginationControls } from "@/components/bluebay_adm/financial/PaginationControls";
import { Suspense, lazy } from "react";

// Componentes lazy-loaded para melhorar o desempenho inicial
const LazyBrandPerformance = lazy(() => import('@/components/bluebay_adm/dashboard/BrandPerformance').then(module => ({ default: module.BrandPerformance })));

const BluebayAdmDashboard = () => {
  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayAdmBanner />
      <BluebayAdmMenu />
      
      <FiltersProvider>
        <div className="container mx-auto px-4 py-6">
          <DashboardHeader />
          <BluebayDashboardContent />
        </div>
      </FiltersProvider>
    </main>
  );
};

// Component that contains all dashboard content, nested inside FiltersProvider
const BluebayDashboardContent = () => {
  const { refreshData } = useDashboardData();
  
  return (
    <>
      <DashboardFilters onFilterChange={refreshData} />
      <DashboardDataContent />
    </>
  );
};

// Componente separado para usar hooks dentro do contexto FiltersProvider
const DashboardDataContent = () => {
  const {
    isLoading,
    kpiData,
    timeSeriesData,
    brandData,
    deliveryData,
    brandPagination,
  } = useDashboardData();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <>
      <KpiCards data={kpiData} />
      <TimeSeriesCharts data={timeSeriesData} />
      
      <Suspense fallback={<Skeleton className="h-80 w-full" />}>
        <LazyBrandPerformance data={brandData} />
        {brandPagination && brandData?.items?.length > 0 && (
          <PaginationControls pagination={brandPagination} itemCount={brandData.items.length} />
        )}
      </Suspense>
      
      <DeliveryEfficiency data={deliveryData} />
    </>
  );
};

export default BluebayAdmDashboard;
