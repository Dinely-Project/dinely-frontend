import { useCallback, useState } from 'react';
import api from '../api/axios';
import { getApiErrorMessage } from '../api/errors';

export interface PlaceOrderItem {
  menu_item_id: string;
  quantity: number;
}

export interface PlaceOrderPayload {
  items: PlaceOrderItem[];
  notes?: string;
}

export interface PlacedOrder {
  id: string;
  status: string;
  total_price: number;
  created_at: string;
}

const normalizePlacedOrder = (payload: unknown): PlacedOrder => {
  if (payload && typeof payload === 'object') {
    const p = payload as Record<string, unknown>;
    // Handle { data: { order: {...} } }, { data: {...} }, or bare object
    if (p.data && typeof p.data === 'object') {
      const d = p.data as Record<string, unknown>;
      if (d.order && typeof d.order === 'object') return d.order as PlacedOrder;
      return d as unknown as PlacedOrder;
    }
    if (p.order && typeof p.order === 'object') return p.order as PlacedOrder;
    return p as unknown as PlacedOrder;
  }
  throw new Error('Unexpected response shape from POST /api/orders');
};

export const usePlaceOrder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeOrder = useCallback(
    async (payload: PlaceOrderPayload): Promise<PlacedOrder> => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.post('/api/orders', payload);
        return normalizePlacedOrder(res.data);
      } catch (err: unknown) {
        const msg = getApiErrorMessage(err, 'Failed to place order. Please try again.');
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { placeOrder, loading, error };
};
