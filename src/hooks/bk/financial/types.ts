
export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
}

export interface FinancialDateFilter {
  range: DateRange;
  preset?: "today" | "week" | "month" | "quarter" | "year" | "custom";
}

export interface FinancialFilterState {
  dateRange: DateRange;
  clientFilter: string;
  statusFilter: string;
  searchTerm: string;
}
