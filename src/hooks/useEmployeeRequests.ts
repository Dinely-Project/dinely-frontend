import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import { getApiErrorMessage } from '../api/errors';

export type RequestType = 'PROMOTION' | 'SALARY_INCREASE' | 'RESIGNATION';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'DECLINED';

export interface EmployeeRequest {
  id: string;
  employee_id: string;
  type: RequestType;
  cover_letter: string | null;
  status: RequestStatus;
  admin_feedback: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface EmployeeRequestFilters {
  status?: RequestStatus;
}

interface EmployeeRequestsResponse {
  data: EmployeeRequest[];
}

interface SubmitRequestPayload {
  type: RequestType;
  cover_letter?: string;
}

interface SubmitRequestResponse {
  data: EmployeeRequest;
}

export const useEmployeeRequests = (filters: EmployeeRequestFilters = {}) => {
  const [requests, setRequests] = useState<EmployeeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {};

      if (filters.status) {
        params.status = filters.status;
      }

      const response = await api.get<EmployeeRequestsResponse>('/api/employee-requests/my', {
        params,
      });
      setRequests(response.data.data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load requests. Please try again.'));
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filters.status]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const submitRequest = useCallback(
    async (payload: SubmitRequestPayload) => {
      try {
        await api.post<SubmitRequestResponse>('/api/employee-requests', payload);
        await fetchRequests();
      } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, 'Failed to submit request. Please try again.'));
      }
    },
    [fetchRequests],
  );

  const refetch = useCallback(() => {
    void fetchRequests();
  }, [fetchRequests]);

  return {
    requests,
    loading,
    error,
    submitRequest,
    refetch,
  };
};
