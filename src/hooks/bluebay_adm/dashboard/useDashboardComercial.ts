
import { useState, useCallback, useEffect, useRef } from 'react';
import { subDays } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import {
  fetchDashboardStats,
  fetchDashboardDetails,
  fetchDashboardOrders,
  fetchDailyDetails,
  fetchDailyOrders,
  fetchCityStatsV2,
  fetchProductStats,
  fetchClientStats
} from '@/services/bluebay/dashboardComercialService';
import { DashboardComercialData, FaturamentoItem, PedidoItem, ClientStat, ProductCategoryStat, CitySalesStat } from '@/services/bluebay/dashboardComercialTypes';

interface UseDashboardComercialReturn {
  dashboardData: DashboardComercialData | null;
  isLoading: boolean;
  isDetailsLoading: boolean;
  error: Error | null;
  startDate: Date;
  endDate: Date;
  setDateRange: (startDate: Date, endDate: Date) => void;
  refreshData: () => Promise<void>;
  selectedCentroCusto: string | null;
  setSelectedCentroCusto: (centroCusto: string | null) => void;
  fetchDayData: (date: Date) => Promise<FaturamentoItem[]>;
  fetchDayOrderData: (date: Date) => Promise<PedidoItem[]>;
  selectedRepresentative: string | null;
  setSelectedRepresentative: (rep: string | null) => void;
  cityStats: CitySalesStat[];
  isCityLoading: boolean;
  selectedCity: { city: string; uf: string } | null;
  setSelectedCity: (city: { city: string; uf: string } | null) => void;
  // New States
  productStats: ProductCategoryStat[];
  isProductLoading: boolean;
  clientStats: ClientStat[];
  isClientLoading: boolean;
}

const defaultData: DashboardComercialData = {
  dailyFaturamento: [],
  monthlyFaturamento: [],
  totalFaturado: 0,
  totalItens: 0,
  mediaValorItem: 0,
  faturamentoItems: [],
  pedidoItems: [],
  dataRangeInfo: {
    startDateRequested: '',
    endDateRequested: '',
    startDateActual: null,
    endDateActual: null,
    hasCompleteData: false
  }
};

export const useDashboardComercial = (): UseDashboardComercialReturn => {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  // City Filtering
  const [selectedCity, setSelectedCity] = useState<{ city: string; uf: string } | null>(null);

  // Lazy Stats
  const [cityStats, setCityStats] = useState<CitySalesStat[]>([]);
  const [isCityLoading, setIsCityLoading] = useState(false);

  const [productStats, setProductStats] = useState<ProductCategoryStat[]>([]);
  const [isProductLoading, setIsProductLoading] = useState(false);

  const [clientStats, setClientStats] = useState<ClientStat[]>([]);
  const [isClientLoading, setIsClientLoading] = useState(false);

  const [selectedCentroCusto, setSelectedCentroCusto] = useState<string | null>(null);
  const [selectedRepresentative, setSelectedRepresentative] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<DashboardComercialData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [requestId, setRequestId] = useState<number>(0);

  // Refs for request control
  const isMountedRef = useRef<boolean>(true);
  const activeRequestRef = useRef<AbortController | null>(null);

  // setDateRange needs to be stable
  const setDateRange = useCallback((start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
    setRequestId(prev => prev + 1);
  }, []);

  // Main fetch function
  const fetchData = useCallback(async () => {
    // 1. Validate internal date range logic inline
    const today = new Date();
    const oneYearAgo = subDays(today, 365);

    if (endDate.getTime() - startDate.getTime() > 365 * 24 * 60 * 60 * 1000) {
      toast({
        title: "Período ajustado",
        description: "O período foi limitado a 90 dias para melhor performance.",
        variant: "destructive",
      });
      setStartDate(subDays(endDate, 90));
      return;
    }

    if (startDate < oneYearAgo) {
      setStartDate(oneYearAgo);
      return;
    }

    // 2. Cancel previous request
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
    }

    // 3. Start new request
    const controller = new AbortController();
    activeRequestRef.current = controller;
    const signal = controller.signal;

    setIsLoading(true);
    setIsDetailsLoading(false);
    setError(null);

    try {
      console.log(`[HOOK] Iniciando busca ESTAGIADA: ${startDate.toISOString()} até ${endDate.toISOString()}`);

      let stats;

      if (selectedCity) {
        // Use the new City-specific service
        console.log(`[HOOK] Modo Filtro por Cidade: ${selectedCity.city}-${selectedCity.uf}`);
        // Import dynamically or assume it's imported? It is not imported yet.
        // We need to update imports.
        const { fetchDashboardStatsByCity } = await import('@/services/bluebay/dashboardComercialService');

        stats = await fetchDashboardStatsByCity(
          startDate,
          endDate,
          selectedCity.city,
          selectedCity.uf,
          selectedCentroCusto,
          selectedRepresentative
        );

      } else {
        // Standard RPC fetch
        stats = await fetchDashboardStats(
          startDate,
          endDate,
          selectedCentroCusto,
          selectedRepresentative,
          signal
        );
      }

      if (signal.aborted) return;
      if (!isMountedRef.current) return;

      const statsData: DashboardComercialData = {
        dailyFaturamento: stats.dailyFaturamento || [],
        monthlyFaturamento: stats.monthlyFaturamento || [],
        totalFaturado: stats.totalFaturado || 0,
        totalItens: stats.totalItens || 0,
        mediaValorItem: stats.mediaValorItem || 0,
        faturamentoItems: [],
        pedidoItems: [],
        costCenterStats: stats.costCenterStats,
        representativeStats: stats.representativeStats,
        dataRangeInfo: stats.dataRangeInfo || defaultData.dataRangeInfo
      };

      setDashboardData(statsData);
      setIsLoading(false);
      setIsDetailsLoading(false);

    } catch (err) {
      if (signal.aborted) return;
      if (err instanceof DOMException && err.name === 'AbortError') return;

      console.error('Erro ao buscar dados:', err);
      if (!isMountedRef.current) return;

      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
      toast({
        title: "Erro ao carregar dados",
        description: "Falha ao carregar o dashboard.",
        variant: "destructive",
      });

      setDashboardData(prev => prev || defaultData);
    } finally {
      if (isMountedRef.current && activeRequestRef.current === controller) {
        setIsLoading(false);
        setIsDetailsLoading(false);
        activeRequestRef.current = null;
      }
    }
  }, [startDate, endDate, selectedCentroCusto, selectedRepresentative, selectedCity]); // Added selectedCity

  const refreshData = useCallback(async () => {
    if (isLoading || isDetailsLoading) return;

    toast({
      title: "Atualizando",
      description: "Buscando dados recentes...",
    });
    setRequestId(prev => prev + 1);
  }, [isLoading, isDetailsLoading]);

  // Effect to trigger fetch
  useEffect(() => {
    fetchData();

    return () => {
      // Cancel request on unmount or dependency change
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
      }
    };
  }, [fetchData, requestId]); // Removed selectedCentroCusto from dependency array as it's already in fetchData dependencies

  // Mount effect
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /* New Lazy Loading Helpers */
  const fetchDayData = useCallback(async (date: Date) => {
    // Check if checks are needed or state update
    // For now, we return the promise so the component can wait
    const result = await fetchDailyDetails(date, selectedCentroCusto, selectedRepresentative); // Lazy load might not need same global signal, or maybe it should?
    // Ideally we should track this request too if we want to cancel it on unmount.
    // For now, let's leave it as is, or pass a new signal if needed.
    return result;
  }, [selectedCentroCusto]);

  const fetchDayOrderData = useCallback(async (date: Date) => {
    const result = await fetchDailyOrders(date, selectedCentroCusto, selectedRepresentative);
    return result;
  }, [selectedCentroCusto, selectedRepresentative]);

  // Fetch Lazy Data (Products, Cities)
  useEffect(() => {
    async function fetchLazyStats() {
      // Use requested date range to keep map consistent regardless of data sparsity in the filtered view
      if (!startDate || !endDate) return;

      setIsCityLoading(true);
      // console.log('[HOOK] Fetching Lazy Stats (City)...');

      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      try {
        const cities = await fetchCityStatsV2(
          formattedStartDate,
          formattedEndDate,
          { centroCusto: selectedCentroCusto, representative: selectedRepresentative }
        );
        console.log('[HOOK] Received Cities:', cities.length);
        setCityStats(cities);
      } catch (err) {
        console.error('[HOOK] Error fetching city stats:', err);
      } finally {
        setIsCityLoading(false);
      }
    }

    fetchLazyStats();
  }, [startDate, endDate, selectedCentroCusto, selectedRepresentative]);

  // Lazy Load Products
  useEffect(() => {
    async function fetchProducts() {
      setIsProductLoading(true);
      try {
        const stats = await fetchProductStats(startDate, endDate, selectedCentroCusto, selectedRepresentative);
        setProductStats(stats);
      } catch (err) { console.error(err); }
      finally { setIsProductLoading(false); }
    }
    fetchProducts();
  }, [startDate, endDate, selectedCentroCusto, selectedRepresentative]);

  // Lazy Load Clients
  useEffect(() => {
    async function fetchClients() {
      setIsClientLoading(true);
      try {
        const stats = await fetchClientStats(startDate, endDate, selectedCentroCusto, selectedRepresentative);
        console.log(`[HOOK] ClientStats fetched: ${stats.length} items`);
        setClientStats(stats);
      } catch (err) { console.error('[HOOK] ClientStats Error:', err); }
      finally { setIsClientLoading(false); }
    }
    fetchClients();
  }, [startDate, endDate, selectedCentroCusto, selectedRepresentative]);

  return {
    dashboardData,
    isLoading,
    isDetailsLoading,
    cityStats,
    isCityLoading,
    error,
    startDate,
    endDate,
    setDateRange,
    refreshData,
    selectedCentroCusto,
    setSelectedCentroCusto,
    selectedRepresentative,
    setSelectedRepresentative,
    selectedCity,
    setSelectedCity,
    fetchDayData,
    fetchDayOrderData,
    productStats,
    isProductLoading,
    clientStats,
    isClientLoading
  };
};
