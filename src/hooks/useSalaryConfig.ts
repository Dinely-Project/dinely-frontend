import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import { getApiErrorMessage } from '../api/errors';

export interface SalaryConfigRow {
  id: string;
  employee_role: string;
  employee_level: number | null;
  base_salary: number;
  configured_by: string | null;
  updated_at: string;
}

interface SalaryConfigResponse {
  data: SalaryConfigRow[];
}

export const useSalaryConfig = () => {
  const [configs, setConfigs] = useState<SalaryConfigRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalaryConfig = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<SalaryConfigResponse>('/api/admin/salary-config');
      setConfigs(response.data.data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load salary configuration.'));
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalaryConfig();
  }, [fetchSalaryConfig]);

  return {
    configs,
    loading,
    error,
    refetch: fetchSalaryConfig,
  };
};
