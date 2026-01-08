
import React, { useMemo } from "react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "@/hooks/bluebay_adm/stock-sales/useStockSalesFilters";
import { DateRange as CalendarDateRange } from "react-day-picker";

interface DateRangeFilterSectionProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
}

export const DateRangeFilterSection: React.FC<DateRangeFilterSectionProps> = ({
  dateRange,
  onDateRangeChange
}) => {
  // Convert our date range format to the one expected by the DatePickerWithRange
  const calendarDateRange = useMemo<CalendarDateRange>(() => {
    return {
      from: dateRange.startDate,
      to: dateRange.endDate
    };
  }, [dateRange.startDate, dateRange.endDate]);

  // Handler that converts back from calendar format to our app format
  const handleDateRangeChange = (newRange: CalendarDateRange) => {
    onDateRangeChange({
      startDate: newRange.from,
      endDate: newRange.to
    });
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Período de Venda</h3>
      <DatePickerWithRange 
        dateRange={calendarDateRange} 
        onDateRangeChange={handleDateRangeChange} 
      />
    </div>
  );
};
