
import { useState, useCallback, useEffect } from 'react';
import { subDays } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { fetchWalletOrders, WalletOrder } from '@/services/bluebay/walletManagementService';
import { getActivePessoaIds } from '@/services/bluebay/dashboardComercialService';

export const useWalletManagement = () => {
    const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 365));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [selectedRepresentatives, setSelectedRepresentatives] = useState<string[]>([]);
    const [onlyPending, setOnlyPending] = useState(true);

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
            // Only load if representatives are selected
            if (selectedRepresentatives.length === 0) {
                setData([]);
                return;
            }

            setIsLoading(true);
            try {
                const orders = await fetchWalletOrders(
                    startDate,
                    endDate,
                    selectedRepresentatives,
                    onlyPending
                );
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
    }, [startDate, endDate, selectedRepresentatives, onlyPending, requestId]);

    return {
        data,
        isLoading,
        startDate,
        endDate,
        setDateRange,
        refreshData,
        selectedRepresentatives,
        setSelectedRepresentatives,
        onlyPending,
        setOnlyPending
    };
};
