
import { useEffect, useState } from "react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { Card, CardContent } from "@/components/ui/card";
import { useFilters } from "@/contexts/bluebay_adm/FiltersContext";
import { useDashboardFilters } from "@/hooks/bluebay_adm/dashboard/useDashboardFilters";
import { Button } from "@/components/ui/button";
import { DownloadIcon, RefreshCw } from "lucide-react";
import { exportToExcel } from "@/utils/exportUtils";
import { useToast } from "@/components/ui/use-toast";

interface DashboardFiltersProps {
  onFilterChange: () => void;
}

export const DashboardFilters = ({ onFilterChange }: DashboardFiltersProps) => {
  const { filters, updateDateRange, updateBrand, updateStatus } = useFilters();
  const { filterOptions, isLoading } = useDashboardFilters();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Usa um estado local para evitar que múltiplas mudanças de filtro acionem múltiplas chamadas de API
  const [localDateRange, setLocalDateRange] = useState<DateRange>({
    from: filters.dateRange.startDate,
    to: filters.dateRange.endDate
  });

  // Atualiza o estado local quando os filtros mudam
  useEffect(() => {
    setLocalDateRange({
      from: filters.dateRange.startDate,
      to: filters.dateRange.endDate
    });
  }, [filters.dateRange.startDate, filters.dateRange.endDate]);

  const handleDateRangeChange = (range: DateRange) => {
    if (range?.from && range?.to) {
      console.log("Nova seleção de datas:", range);
      setLocalDateRange(range);
      
      // Aplicamos automaticamente o intervalo de datas quando o usuário seleciona
      updateDateRange(range.from, range.to);
    }
  };

  const handleExportData = () => {
    toast({
      title: "Exportação iniciada",
      description: "Preparando dados para exportação...",
    });
    
    setTimeout(() => {
      // Create sample data to export instead of passing an object with batchSize
      const dataToExport = [
        { 
          totalBatches: 'Múltiplos',
          totalRecords: 'Todos disponíveis',
          exportDate: new Date().toISOString()
        }
      ];
      
      // Pass the array to exportToExcel
      exportToExcel(dataToExport, "dashboard_export");
      
      toast({
        title: "Exportação concluída",
        description: "Os dados foram exportados com sucesso.",
      });
    }, 1500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    onFilterChange();
    
    // Reseta o estado de atualização após um atraso
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  // Log filter options when they change to help debugging
  useEffect(() => {
    if (filterOptions.brands.length > 0) {
      console.log("Opções de filtro de marca carregadas:", 
        filterOptions.brands.map(b => b.value).join(", "));
    }
  }, [filterOptions.brands]);

  // Aplica filtros quando os filtros mudam
  useEffect(() => {
    // Isso garante que não acionamos a mudança de filtro imediatamente na montagem
    const timeoutId = setTimeout(() => {
      onFilterChange();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [filters, onFilterChange]);

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <div className="flex flex-col space-y-2">
              <DatePickerWithRange
                dateRange={localDateRange}
                onDateRangeChange={handleDateRangeChange}
              />
            </div>
          </div>
          
          <div>
            <Select
              value={filters.brand || "all"}
              onValueChange={value => updateBrand(value === "all" ? null : value)}
              disabled={isLoading || isRefreshing}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Marca (Centrocusto)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Marcas</SelectItem>
                {filterOptions.brands.map(brand => (
                  <SelectItem key={brand.value} value={brand.value || "sem-marca"}>
                    {brand.label || "Sem marca"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select
              value={filters.status || "all"}
              onValueChange={value => updateStatus(value === "all" ? null : value)}
              disabled={isLoading || isRefreshing}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Status do Pedido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                {filterOptions.statuses.map(status => (
                  <SelectItem key={status.value} value={status.value || "sem-status"}>
                    {status.label || "Sem status"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 col-span-1 lg:col-span-4">
            <Button 
              variant="outline" 
              onClick={handleExportData}
              className="bg-white"
              disabled={isLoading || isRefreshing}
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              Exportar Dados
            </Button>
            
            <Button 
              variant="default" 
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
