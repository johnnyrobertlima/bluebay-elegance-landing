
import { useCallback, useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, X } from 'lucide-react';
import { MultiSelectAsyncFilter } from './MultiSelectAsyncFilter';
import {
  fetchRepresentativesOptions,
  searchClients,
  searchProducts
} from '@/services/bluebay/dashboardComercialService';

import { getActivePessoaIds } from '@/services/bluebay/dashboardComercialService';

interface DashboardComercialFiltersProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  onRefresh: () => void;
  isLoading: boolean;
  selectedRepresentative: string[];
  setSelectedRepresentative: (rep: string[]) => void;
  selectedClient: string[];
  setSelectedClient: (client: string[]) => void;
  selectedProduct: string[];
  setSelectedProduct: (product: string[]) => void;
}

export const DashboardComercialFilters = ({
  startDate,
  endDate,
  onDateRangeChange,
  onRefresh,
  isLoading,
  selectedRepresentative,
  setSelectedRepresentative,
  selectedClient,
  setSelectedClient,
  selectedProduct,
  setSelectedProduct
}: DashboardComercialFiltersProps) => {
  const [localDateRange, setLocalDateRange] = useState<DateRange>({
    from: startDate,
    to: endDate
  });

  const [activeRepIds, setActiveRepIds] = useState<string[]>([]);
  const [activeClientIds, setActiveClientIds] = useState<string[]>([]);

  // Atualiza o filtro local quando as props mudam e busca active IDs
  useEffect(() => {
    setLocalDateRange({
      from: startDate,
      to: endDate
    });

    const fetchActiveIds = async () => {
      try {
        // Parallel fetch
        const [reps, clients] = await Promise.all([
          getActivePessoaIds(startDate, endDate, true),
          getActivePessoaIds(startDate, endDate, false)
        ]);

        setActiveRepIds(Array.from(reps));
        setActiveClientIds(Array.from(clients));
      } catch (error) {
        console.error("Error fetching active IDs for filters:", error);
      }
    };

    fetchActiveIds();

  }, [startDate, endDate]);

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    setLocalDateRange(range || { from: undefined, to: undefined });
    if (range?.from && range?.to) {
      onDateRangeChange(range.from, range.to);
    }
  }, [onDateRangeChange]);

  const clearFilters = () => {
    setSelectedRepresentative([]);
    setSelectedClient([]);
    setSelectedProduct([]);
  };

  const hasFilters = (selectedRepresentative.length > 0 || selectedClient.length > 0 || selectedProduct.length > 0);

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">

          {/* Top Row: Date Range & Refresh */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <DatePickerWithRange
                dateRange={localDateRange}
                onDateRangeChange={handleDateRangeChange}
              />
            </div>
            <div className="flex items-center gap-2">
              {hasFilters && (
                <Button variant="ghost" onClick={clearFilters} size="sm">
                  <X className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              )}
              <Button
                variant="default"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Bottom Row: Advanced Filters */}
          <div className="flex flex-wrap gap-4">
            <MultiSelectAsyncFilter
              label="Representante"
              value={selectedRepresentative}
              onChange={setSelectedRepresentative}
              fetchOptions={async (q) => {
                const all = await fetchRepresentativesOptions(activeRepIds);
                if (!q) return all;
                return all.filter(r => r.label.toLowerCase().includes(q.toLowerCase()));
              }}
              placeholder="Buscar Representante..."
            />

            <MultiSelectAsyncFilter
              label="Cliente"
              value={selectedClient}
              onChange={setSelectedClient}
              fetchOptions={(q) => searchClients(q, activeClientIds)}
              placeholder="Buscar Cliente..."
            />

            <MultiSelectAsyncFilter
              label="Produto"
              value={selectedProduct}
              onChange={setSelectedProduct}
              fetchOptions={searchProducts}
              placeholder="Buscar Produto..."
            />
          </div>

        </div>
      </CardContent>
    </Card>
  );
};
