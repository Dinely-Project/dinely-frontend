import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import { getApiErrorMessage } from '../api/errors';

// ── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus = 'RECEIVED' | 'PREPARING' | 'READY' | 'FINISHED' | 'CANCELLED';

/** Lightweight shape returned by GET /api/orders (staff queue) */
export interface OrderSummary {
  id: string;
  customer_id: string;
  customer_name: string;
  status: OrderStatus;
  total_price: number;
  item_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Full shape returned by GET /api/orders/:id */
export interface OrderItem {
  id: string;
  menu_item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface StatusHistoryEntry {
  id: string;
  order_id: string;
  old_status: OrderStatus | null;
  new_status: OrderStatus;
  changed_by: string;
  changed_at: string;
}

export interface OrderDetail extends OrderSummary {
  customer_email: string;
  items: OrderItem[];
  status_history: StatusHistoryEntry[];
}

// ── Normalise helpers ────────────────────────────────────────────────────────

const normalizeList = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const p = payload as Record<string, unknown>;
    if (Array.isArray(p.data)) return p.data as T[];
    if (Array.isArray(p.orders)) return p.orders as T[];
  }
  return [];
};

// ── useOrders ────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 15_000;

/**
 * Fetches the staff-facing order queue (GET /api/orders) and auto-polls
 * every 15 seconds.
 */
export const useOrders = () => {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/api/orders');
      setOrders(normalizeList<OrderSummary>(res.data));
      setError(null);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load orders.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrders();
    intervalRef.current = setInterval(() => void fetchOrders(), POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchOrders]);

  /**
   * Advance or cancel an order.
   * Optimistically updates the local list, then re-fetches on success.
   */
  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus): Promise<void> => {
      await api.patch(`/api/orders/${orderId}/status`, { status });
      await fetchOrders();
    },
    [fetchOrders],
  );

  return { orders, loading, error, refetch: fetchOrders, updateOrderStatus };
};

// ── useOrderDetail ───────────────────────────────────────────────────────────

/**
 * Fetches a single order's full detail (GET /api/orders/:id).
 * Re-fetches whenever `orderId` changes.
 */
export const useOrderDetail = (orderId: string | null) => {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/orders/${orderId}`);
      // Response shape: { data: OrderDetail } or bare OrderDetail
      const payload = res.data;
      const detail: OrderDetail =
        payload && typeof payload === 'object' && 'data' in payload
          ? (payload as { data: OrderDetail }).data
          : (payload as OrderDetail);
      setOrder(detail);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load order details.'));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus): Promise<void> => {
      await api.patch(`/api/orders/${orderId}/status`, { status });
      await fetchDetail();
    },
    [fetchDetail],
  );

  return { order, loading, error, refetch: fetchDetail, updateOrderStatus };
};
