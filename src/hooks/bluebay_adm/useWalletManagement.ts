
import { useState, useCallback, useEffect } from 'react';
import { subDays } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { fetchWalletOrders, WalletOrder } from '@/services/bluebay/walletManagementService';

export const useWalletManagement = () => {
    const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
    const [endDate, setEndDate] = useState<Date>(new Date());

    const [data, setData] = useState<WalletOrder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [requestId, setRequestId] = useState(0);

    const setDateRange = useCallback((start: Date, end: Date) => {
        setStartDate(start);
        setEndDate(end);
        setRequestId(prev => prev + 1);
    }, []);

    const refreshData = useCallback(() => {
        setRequestId(prev => prev + 1);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const orders = await fetchWalletOrders(startDate, endDate);
                setData(orders);
            } catch (error) {
                console.error("Error loading wallet data:", error);
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: "Falha ao carregar dados da carteira."
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
        refreshData
    };
};
