import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import { getApiErrorMessage } from '../api/errors';

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
}

interface MenuItemsResponse {
  data?: MenuItem[];
  items?: MenuItem[];
}

interface MenuItemsFilters {
  categoryId?: string;
  search?: string;
  includeUnavailable?: boolean;
}

const normalizeItems = (payload: MenuItem[] | MenuItemsResponse): MenuItem[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  return [];
};

export const useMenuItems = (filters: MenuItemsFilters = {}) => {
  const { categoryId, search, includeUnavailable = true } = filters;
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    const buildParams = (isAvailable?: boolean) => {
      const params: Record<string, string> = {};

      if (categoryId) {
        params.category_id = categoryId;
      }

      if (search) {
        params.search = search;
      }

      if (typeof isAvailable === 'boolean') {
        params.is_available = isAvailable ? 'true' : 'false';
      }

      return params;
    };

    try {
      if (includeUnavailable) {
        const [availableResponse, unavailableResponse] = await Promise.all([
          api.get<MenuItem[] | MenuItemsResponse>('/api/menu/items', { params: buildParams(true) }),
          api.get<MenuItem[] | MenuItemsResponse>('/api/menu/items', { params: buildParams(false) }),
        ]);

        const merged = new Map<string, MenuItem>();
        for (const item of [...normalizeItems(availableResponse.data), ...normalizeItems(unavailableResponse.data)]) {
          merged.set(item.id, item);
        }

        const combined = Array.from(merged.values());
        combined.sort((a, b) => a.name.localeCompare(b.name));
        setItems(combined);
      } else {
        const response = await api.get<MenuItem[] | MenuItemsResponse>('/api/menu/items', {
          params: buildParams(),
        });
        const normalized = normalizeItems(response.data);
        normalized.sort((a, b) => a.name.localeCompare(b.name));
        setItems(normalized);
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load menu items.'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId, includeUnavailable, search]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    refetch: fetchItems,
  };
};
