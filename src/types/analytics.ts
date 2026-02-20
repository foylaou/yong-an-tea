export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  name: string;
  qty: number;
  revenue: number;
}

export interface StatusDist {
  status: string;
  count: number;
}

export interface PaymentDist {
  payment_method: string;
  count: number;
}

export interface SalesAnalytics {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  new_customers: number;
  returning_customers: number;
  daily_revenue: DailyRevenue[];
  top_products: TopProduct[];
  order_status_dist: StatusDist[];
  payment_method_dist: PaymentDist[];
}
