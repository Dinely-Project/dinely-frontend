import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import { getApiErrorMessage } from '../api/errors';
import type { EmployeeRequest, RequestStatus, RequestType } from './useEmployeeRequests';

export interface AdminEmployeeRequest extends EmployeeRequest {
  users?: {
    name: string;
    email: string;
  };
}

interface AdminRequestFilters {
  status?: RequestStatus;
  type?: RequestType;
}

interface AdminRequestsResponse {
  data: AdminEmployeeRequest[];
}

interface ReviewRequestPayload {
  status: 'APPROVED' | 'DECLINED';
  admin_feedback?: string;
}

export const useAdminRequests = (filters: AdminRequestFilters = {}) => {
  const [requests, setRequests] = useState<AdminEmployeeRequest[]>([]);
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

      if (filters.type) {
        params.type = filters.type;
      }

      const response = await api.get<AdminRequestsResponse>('/api/employee-requests', {
        params,
      });
      setRequests(response.data.data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load HR requests. Please try again.'));
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.type]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const reviewRequest = useCallback(
    async (id: string, payload: ReviewRequestPayload) => {
      try {
        await api.patch(`/api/employee-requests/${id}/review`, payload);
        await fetchRequests();
      } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, 'Failed to review request. Please try again.'));
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
    reviewRequest,
    refetch,
  };
};
