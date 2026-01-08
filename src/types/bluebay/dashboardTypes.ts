
export interface KpiData {
  totalOrders: number;
  totalBilled: number;
  averageTicket: number;
  conversionRate: number;
  totalItems: number;
  totalPedido: number;
  totalFaturado: number;
  ticketMedio: number;
  percentualFaturado: number;
  orderedPieces: number;
  billedPieces: number;
  averageDiscount: number;
}

export interface BrandData {
  brands: BrandPerformance[];
  items: BrandPerformance[];
  totalOrders: number;
  totalBilled: number;
}

export interface BrandPerformance {
  brand: string;
  totalOrders: number;
  totalBilled: number;
  conversionRate: number;
  volume: number;
}

export interface DeliveryData {
  onTimeDeliveries: number;
  lateDeliveries: number;
  pendingDeliveries: number;
  averageDeliveryDays: number;
  deliveryRate: number;
  fullyDeliveredPercentage: number;
  partialPercentage: number;
  openPercentage: number;
  averageRemainingQuantity: number;
}

export interface TimeSeriesData {
  date: string;
  total: number;
  orders: number;
  billed: number;
  formattedDate: string;
  monthlySeries?: MonthlySeriesItem[];
}

export interface MonthlySeriesItem {
  month: string;
  total: number;
  orders: number;
  billed: number;
}

export interface DashboardKpiData {
  totalOrders: number;
  totalBilled: number;
  averageTicket: number;
  conversionRate: number;
  totalItems: number;
}
