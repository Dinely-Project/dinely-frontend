import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import { getApiErrorMessage } from '../api/errors';

export type AnalyticsPeriod = 'today' | 'week' | 'month' | 'year';

export interface TopItem {
  name: string;
  total_sold?: number;
  totalSold?: number;
  revenue?: number;
}

export interface CategoryRevenue {
  category?: string;
  name?: string;
  revenue?: number;
  total_revenue?: number;
}

export interface StaffActivity {
  name: string;
  orders_handled?: number;
  ordersHandled?: number;
}

export interface AnalyticsSummary {
  totalRevenue?: number;
  total_revenue?: number;
  totalOrders?: number;
  total_orders?: number;
  totalCustomers?: number;
  total_customers?: number;
  totalMenuItems?: number;
  total_menu_items?: number;
  averageOrderValue?: number;
  average_order_value?: number;
  topItems?: TopItem[];
  top_items?: TopItem[];
  revenueByCategory?: CategoryRevenue[];
  revenue_by_category?: CategoryRevenue[];
  staffActivity?: StaffActivity[];
  staff_activity?: StaffActivity[];
  ordersByStatus?: Record<string, number>;
  orders_by_status?: Record<string, number>;
}

interface AnalyticsResponse extends AnalyticsSummary {
  data?: AnalyticsSummary | null;
}

const normalizeAnalyticsResponse = (payload: AnalyticsResponse): AnalyticsSummary => payload.data ?? payload;

export const useAnalytics = (period: AnalyticsPeriod) => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<AnalyticsResponse>('/api/admin/analytics', {
        params: { period },
      });
      setData(normalizeAnalyticsResponse(response.data));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load analytics. Please try again.'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchAnalytics();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchAnalytics]);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};
