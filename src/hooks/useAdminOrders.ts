import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import { getApiErrorMessage } from '../api/errors';

export type OrderStatus = 'RECEIVED' | 'PREPARING' | 'READY' | 'FINISHED' | 'CANCELLED';

export interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface OrderPerson {
  id: string;
  name: string;
  email: string;
}

export interface AdminOrder {
  id: string;
  status: string;
  total_price: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer: OrderPerson | null;
  staff: OrderPerson | null;
  items: OrderItem[];
  item_count?: number;
}

interface RawOrder {
  id: string;
  customer_id: string | null;
  status: string;
  total_price: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  customer_email: string | null;
  staff_name?: string | null;
  staff_email?: string | null;
  item_count?: number;
  items?: OrderItem[];
}

interface RawMeta {
  total: number;
  limit: number;
  offset: number;
}

interface AdminOrdersResponse {
  data: RawOrder[] | { orders?: RawOrder[]; total?: number };
  meta?: RawMeta;
  orders?: RawOrder[];
  total?: number;
}

const normalizeRawOrder = (raw: RawOrder): AdminOrder => ({
  id: raw.id,
  status: raw.status,
  total_price: raw.total_price,
  notes: raw.notes,
  created_at: raw.created_at,
  updated_at: raw.updated_at,
  customer: raw.customer_name
    ? {
        id: raw.customer_id ?? '',
        name: raw.customer_name,
        email: raw.customer_email ?? '',
      }
    : null,
  staff: raw.staff_name
    ? {
        id: '',
        name: raw.staff_name,
        email: raw.staff_email ?? '',
      }
    : null,
  items: raw.items ?? [],
  item_count: raw.item_count,
});

const extractOrders = (payload: AdminOrdersResponse): { orders: AdminOrder[]; total: number } => {
  // Shape: { data: [...], meta: { total } }
  if (Array.isArray(payload.data)) {
    const orders = (payload.data as RawOrder[]).map(normalizeRawOrder);
    const total = payload.meta?.total ?? orders.length;
    return { orders, total };
  }

  // Shape: { data: { orders: [...], total: N } }
  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    const inner = payload.data as { orders?: RawOrder[]; total?: number };
    if (Array.isArray(inner.orders)) {
      const orders = inner.orders.map(normalizeRawOrder);
      const total = inner.total ?? orders.length;
      return { orders, total };
    }
  }

  // Shape: { orders: [...], total: N } at root
  if (Array.isArray(payload.orders)) {
    const orders = payload.orders.map(normalizeRawOrder);
    const total = payload.total ?? orders.length;
    return { orders, total };
  }

  return { orders: [], total: 0 };
};

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const PAGE_SIZE = 100;
      let offset = 0;
      let allOrders: AdminOrder[] = [];
      let hasMore = true;

      while (hasMore) {
        const response = await api.get<AdminOrdersResponse>('/api/admin/orders', {
          params: { limit: PAGE_SIZE, offset },
        });

        const { orders: batch, total } = extractOrders(response.data);
        allOrders = [...allOrders, ...batch];
        offset += PAGE_SIZE;
        hasMore = offset < total;
      }

      setOrders(allOrders);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load orders. Please try again.'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchOrders();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
  };
};