import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import { getApiErrorMessage } from '../api/errors';

export interface MenuCategory {
  id: string;
  name: string;
  description: string | null;
  display_order: number | null;
}

interface MenuCategoriesResponse {
  data?: MenuCategory[];
  categories?: MenuCategory[];
}

const normalizeCategories = (
  payload: MenuCategory[] | MenuCategoriesResponse
): MenuCategory[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.categories)) {
    return payload.categories;
  }

  return [];
};

export const useMenuCategories = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<MenuCategory[] | MenuCategoriesResponse>('/api/menu/categories');
      setCategories(normalizeCategories(response.data));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load menu categories.'));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};
