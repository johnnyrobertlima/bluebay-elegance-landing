
import { useState, useCallback, useEffect, useRef } from 'react';
import { subDays } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { 
  fetchDashboardComercialData
} from '@/services/bluebay/dashboardComercialService';
import { DashboardComercialData } from '@/services/bluebay/dashboardComercialTypes';

interface UseDashboardComercialReturn {
  dashboardData: DashboardComercialData | null;
  isLoading: boolean;
  error: Error | null;
  startDate: Date;
  endDate: Date;
  setDateRange: (startDate: Date, endDate: Date) => void;
  refreshData: () => Promise<void>;
  selectedCentroCusto: string | null;
  setSelectedCentroCusto: (centroCusto: string | null) => void;
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
  // Usar período inicial menor para melhorar performance
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedCentroCusto, setSelectedCentroCusto] = useState<string | null>(null);
  
  const [dashboardData, setDashboardData] = useState<DashboardComercialData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [requestId, setRequestId] = useState<number>(0);
  
  const { toast } = useToast();
  
  // Refs para controle de requisições e evitar vazamento de memória
  const isMountedRef = useRef<boolean>(true);
  const activeRequestRef = useRef<AbortController | null>(null);
  const requestInProgressRef = useRef<boolean>(false);

  // Validar intervalo de datas
  const validateDateRange = useCallback(() => {
    const today = new Date();
    const oneYearAgo = subDays(today, 365);
    
    // Se o intervalo for maior que um ano, ajustar para um período mais razoável
    if (endDate.getTime() - startDate.getTime() > 365 * 24 * 60 * 60 * 1000) {
      toast({
        title: "Intervalo de datas muito grande",
        description: "Para melhor performance, o período foi limitado a 90 dias.",
        variant: "destructive",
      });
      
      setStartDate(subDays(endDate, 90));
      return false;
    }
    
    // Se a data inicial for muito antiga, ajustar para um ano atrás
    if (startDate < oneYearAgo) {
      toast({
        title: "Data muito antiga",
        description: "A data inicial foi ajustada para um período mais recente.",
        variant: "destructive",
      });
      
      setStartDate(oneYearAgo);
      return false;
    }
    
    return true;
  }, [startDate, endDate, toast]);

  const setDateRange = useCallback((start: Date, end: Date) => {
    console.log(`Definindo novo intervalo de datas: ${start.toISOString()} até ${end.toISOString()}`);
    setStartDate(start);
    setEndDate(end);
    setRequestId(prev => prev + 1);
  }, []);

  const fetchData = useCallback(async () => {
    // Evitar requisições duplicadas
    if (requestInProgressRef.current) {
      console.log('Fetching already in progress, skipping duplicate request');
      return;
    }
    
    // Validar o intervalo de datas antes de buscar
    if (!validateDateRange()) {
      return;
    }
    
    requestInProgressRef.current = true;
    setIsLoading(true);
    setError(null);
    
    // Cancelar requisição anterior se existir
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
    }
    
    // Criar um novo controlador de aborto para esta requisição
    activeRequestRef.current = new AbortController();
    
    try {
      console.log(`Iniciando busca de dados: ${startDate.toISOString()} até ${endDate.toISOString()}`);
      if (selectedCentroCusto) {
        console.log(`Filtrando por centro de custo: ${selectedCentroCusto}`);
      }
      
      // Adicionar um timeout para evitar travamentos em caso de resposta lenta
      const fetchPromise = fetchDashboardComercialData(startDate, endDate, selectedCentroCusto);
      const timeoutPromise = new Promise<DashboardComercialData | null>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: A busca demorou muito tempo')), 30000);
      });
      
      // Usar Promise.race para implementar um timeout
      const data = await Promise.race([fetchPromise, timeoutPromise]);
      
      // Verificar se o componente ainda está montado
      if (!isMountedRef.current) return;
      
      // Tratar os dados recebidos
      if (data) {
        setDashboardData(data);
        console.log(`Dados carregados com sucesso: ${data.faturamentoItems.length} registros de faturamento, ${data.pedidoItems.length} registros de pedidos`);
      
        if (data.faturamentoItems.length === 0 && data.pedidoItems.length === 0) {
          toast({
            title: "Sem dados disponíveis",
            description: "Não foram encontrados dados para o período selecionado.",
            variant: "destructive",
          });
        } 
        else {
          toast({
            title: "Dados carregados com sucesso",
            description: `Foram encontrados ${data.faturamentoItems.length} registros de faturamento e ${data.pedidoItems.length} registros de pedidos para o período.`,
            variant: "default",
          });
        }
      }
    } catch (err) {
      // Ignorar erros de aborto (causados por cancelamento intencional)
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Requisição cancelada intencionalmente');
        return;
      }
      
      // Tratar outros erros
      console.error('Erro ao buscar dados do dashboard comercial:', err);
      
      if (!isMountedRef.current) return;
      
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao buscar dados'));
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.",
        variant: "destructive",
      });
      
      // Definir dados padrão em caso de erro para evitar problemas de UI
      setDashboardData(defaultData);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      requestInProgressRef.current = false;
      activeRequestRef.current = null;
    }
  }, [startDate, endDate, toast, validateDateRange, selectedCentroCusto]);

  const refreshData = useCallback(async () => {
    if (isLoading) return;
    
    toast({
      title: "Atualizando dados",
      description: "Carregando informações mais recentes...",
    });
    
    setRequestId(prev => prev + 1);
  }, [isLoading, toast]);

  // Effect para carregar dados quando mudar o requestId ou o centro de custo
  useEffect(() => {
    console.log(`Efeito chamado para busca de dados: requestId=${requestId}, centroCusto=${selectedCentroCusto || 'none'}`);
    fetchData();
    
    // Função de cleanup para lidar com desmontagem
    return () => {
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
      }
    };
  }, [fetchData, requestId, selectedCentroCusto]);

  // Effect para definir o status de montagem
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    dashboardData,
    isLoading,
    error,
    startDate,
    endDate,
    setDateRange,
    refreshData,
    selectedCentroCusto,
    setSelectedCentroCusto
  };
};
