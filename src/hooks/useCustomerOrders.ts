import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import { getApiErrorMessage } from '../api/errors';

// ── Types ────────────────────────────────────────────────────────────────────

export type CustomerOrderStatus = 'RECEIVED' | 'PREPARING' | 'READY' | 'FINISHED' | 'CANCELLED';

export interface CustomerOrderItem {
  id: string;
  menu_item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface CustomerStatusHistory {
  id: string;
  order_id: string;
  old_status: CustomerOrderStatus | null;
  new_status: CustomerOrderStatus;
  changed_by: string;
  changed_at: string;
}

export interface CustomerOrder {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  status: CustomerOrderStatus;
  total_price: number;
  item_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items: CustomerOrderItem[];
  status_history: CustomerStatusHistory[];
}

// ── Normalise ─────────────────────────────────────────────────────────────────

const normalizeList = (payload: unknown): CustomerOrder[] => {
  if (Array.isArray(payload)) return payload as CustomerOrder[];
  if (payload && typeof payload === 'object') {
    const p = payload as Record<string, unknown>;
    if (Array.isArray(p.data)) return p.data as CustomerOrder[];
  }
  return [];
};

// ── useCustomerOrders ─────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 12_000;

/**
 * Polls GET /api/orders/my every 12 seconds.
 * Returns only active (non-FINISHED, non-CANCELLED) orders.
 * Exposes `hasReadyOrder` so the parent can show the pickup banner.
 */
export const useCustomerOrders = () => {
  const [activeOrders, setActiveOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchActive = useCallback(async () => {
    try {
      const res = await api.get('/api/orders/my');
      setActiveOrders(normalizeList(res.data));
      setError(null);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load your orders.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchActive();
    intervalRef.current = setInterval(() => void fetchActive(), POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchActive]);

  const hasReadyOrder = activeOrders.some((o) => o.status === 'READY');

  return { activeOrders, loading, error, refetch: fetchActive, hasReadyOrder };
};

// ── useOrderHistory ───────────────────────────────────────────────────────────

/**
 * Fetches GET /api/orders/history — FINISHED + CANCELLED orders only.
 * Not polled — loaded once on mount (history doesn't change).
 */
export const useOrderHistory = () => {
  const [history, setHistory] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/orders/history');
      setHistory(normalizeList(res.data));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load order history.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error, refetch: fetchHistory };
};
