
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from "@/components/ui/select";
import { DateRangePicker } from "@/components/bk/financial/DateRangePicker";
import { DateRange } from "@/hooks/bk/financial/types";

interface FinancialFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  statuses: string[];
  clientFilter: string;
  onClientFilterChange: (value: string) => void;
  notaFilter: string;
  onNotaFilterChange: (value: string) => void;
  dateRange: DateRange;
  onDateRangeUpdate: (dateRange: DateRange) => void;
}

export const FinancialFilters: React.FC<FinancialFiltersProps> = ({
  statusFilter,
  onStatusChange,
  statuses,
  clientFilter,
  onClientFilterChange,
  notaFilter,
  onNotaFilterChange,
  dateRange,
  onDateRangeUpdate
}) => {
  return (
    <div className="bg-white p-4 rounded-md shadow mb-6 space-y-4">
      <h3 className="text-lg font-medium mb-2">Filtros</h3>
      
      <div className="flex flex-wrap gap-4">
        <div className="w-full sm:w-auto">
          <Label htmlFor="status-filter">Status</Label>
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger id="status-filter" className="w-full sm:w-48">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status === 'all' ? 'Todos' : 
                   status === '1' ? 'Em Aberto' :
                   status === '2' ? 'Parcialmente Pago' :
                   status === '3' ? 'Pago' : 
                   status === '4' ? 'Cancelado' :
                   status === 'VENCIDO' ? 'Vencido' : status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-auto">
          <Label htmlFor="client-filter">Cliente</Label>
          <Input
            id="client-filter"
            value={clientFilter}
            onChange={(e) => onClientFilterChange(e.target.value)}
            placeholder="Buscar por cliente"
            className="w-full sm:w-64"
          />
        </div>
        
        <div className="w-full sm:w-auto">
          <Label htmlFor="nota-filter">Nota Fiscal</Label>
          <Input
            id="nota-filter"
            value={notaFilter}
            onChange={(e) => onNotaFilterChange(e.target.value)}
            placeholder="Buscar por nota"
            className="w-full sm:w-44"
          />
        </div>
        
        <div className="w-full sm:w-auto">
          <DateRangePicker 
            startDate={dateRange.startDate} 
            endDate={dateRange.endDate} 
            onUpdate={onDateRangeUpdate}
            label="Período de Vencimento"
          />
        </div>
      </div>
    </div>
  );
};
