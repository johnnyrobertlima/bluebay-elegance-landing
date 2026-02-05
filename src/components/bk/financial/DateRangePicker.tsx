
import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FinancialDateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  onUpdate?: (range: DateRange | undefined) => void;
  startDate?: Date;
  endDate?: Date;
  label?: string;
  className?: string;
}

export const DateRangePicker: React.FC<FinancialDateRangePickerProps> = ({
  value,
  onChange,
  onUpdate,
  startDate,
  endDate,
  label,
  className,
}) => {
  const dateRange: DateRange | undefined = value || (startDate ? { from: startDate, to: endDate || startDate } : undefined);

  const handleChange = (range: DateRange | undefined) => {
    // Ensure we propagate the change correctly even if partial
    if (onChange) onChange(range);
    if (onUpdate) onUpdate(range);
  };

  const setPresetRange = (years: number) => {
    const to = new Date();
    const from = new Date();
    from.setFullYear(from.getFullYear() - years);

    const range = { from, to };
    handleChange(range);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Filtrar por período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col sm:flex-row">
            <div className="p-3 border-r border-border space-y-2 flex flex-col justify-center">
              <span className="text-sm font-medium mb-1 px-1">Períodos Rápidos</span>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start font-normal"
                onClick={() => setPresetRange(1)}
              >
                Último 1 Ano
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start font-normal"
                onClick={() => setPresetRange(2)}
              >
                Últimos 2 Anos
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start font-normal"
                onClick={() => setPresetRange(3)}
              >
                Últimos 3 Anos
              </Button>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleChange}
              numberOfMonths={2}
              locale={ptBR}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
