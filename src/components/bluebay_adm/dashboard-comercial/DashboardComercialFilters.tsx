
import { useCallback, useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from 'lucide-react';

interface DashboardComercialFiltersProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const DashboardComercialFilters = ({
  startDate,
  endDate,
  onDateRangeChange,
  onRefresh,
  isLoading
}: DashboardComercialFiltersProps) => {
  const [localDateRange, setLocalDateRange] = useState<DateRange>({
    from: startDate,
    to: endDate
  });

  // Atualiza o filtro local quando as props mudam
  useEffect(() => {
    setLocalDateRange({
      from: startDate,
      to: endDate
    });
  }, [startDate, endDate]);

  const handleDateRangeChange = useCallback((range: DateRange) => {
    if (range?.from && range?.to) {
      setLocalDateRange(range);
      onDateRangeChange(range.from, range.to);
    }
  }, [onDateRangeChange]);

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex-1 mr-4">
            <DatePickerWithRange
              dateRange={localDateRange}
              onDateRangeChange={handleDateRangeChange}
            />
          </div>
          <div>
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
      </CardContent>
    </Card>
  );
};
