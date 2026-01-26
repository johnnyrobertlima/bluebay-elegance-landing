
import { useState, useCallback, useEffect } from 'react';
import { subDays } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { fetchSeasonPerformance, SeasonPerformanceStat } from '@/services/bluebay/seasonPerformanceService';

export const useSeasonPerformance = () => {
    const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
    const [endDate, setEndDate] = useState<Date>(new Date());

    const [data, setData] = useState<SeasonPerformanceStat[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [requestId, setRequestId] = useState(0);

    const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);

    const setDateRange = useCallback((start: Date, end: Date) => {
        setStartDate(start);
        setEndDate(end);
        setRequestId(prev => prev + 1);
    }, []);

    const handleChangeSeasons = useCallback((seasons: string[]) => {
        setSelectedSeasons(seasons);
        setRequestId(prev => prev + 1); // Trigger fetch
    }, []);

    const refreshData = useCallback(() => {
        setRequestId(prev => prev + 1);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const stats = await fetchSeasonPerformance(startDate, endDate, selectedSeasons);
                setData(stats);
            } catch (error) {
                console.error("Error loading season stats:", error);
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: "Falha ao carregar dados de desempenho."
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [startDate, endDate, requestId]);

    return {
        data,
        isLoading,
        startDate,
        endDate,
        setDateRange,
        refreshData,
        selectedSeasons,
        setSelectedSeasons: handleChangeSeasons
    };
};
