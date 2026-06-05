import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  employee_role: string | null;
  employee_level: number | null;
  salary: number | null;
  created_at: string;
  updated_at: string;
}

interface AdminUserFilters {
  role?: string;
  status?: string;
}

interface AdminUsersResponse {
  users?: AdminUser[];
  data?: AdminUser[] | { users?: AdminUser[] };
}

const normalizeUsersResponse = (payload: AdminUser[] | AdminUsersResponse): AdminUser[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.users)) {
    return payload.users;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload.data && !Array.isArray(payload.data) && Array.isArray(payload.data.users)) {
    return payload.data.users;
  }

  return [];
};

export const useAdminUsers = (filters: AdminUserFilters = {}) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {};

      if (filters.role) {
        params.role = filters.role;
      }

      if (filters.status) {
        params.status = filters.status;
      }

      const response = await api.get<AdminUser[] | AdminUsersResponse>('/api/admin/users', { params });
      setUsers(normalizeUsersResponse(response.data));
    } catch (err) {
      console.error('Failed to fetch admin users', err);
      setError('Failed to load users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filters.role, filters.status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchUsers();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
  };
};
