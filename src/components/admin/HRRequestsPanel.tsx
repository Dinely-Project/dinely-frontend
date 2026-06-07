import React, { useState } from 'react';
import { STATUS_COLORS } from '../../constants/colors';
import { useAdminRequests } from '../../hooks/useAdminRequests';
import type { AdminEmployeeRequest } from '../../hooks/useAdminRequests';
import type { RequestStatus, RequestType } from '../../hooks/useEmployeeRequests';
import ReviewRequestModal from './ReviewRequestModal';

const STATUS_FILTERS: Array<RequestStatus | ''> = ['', 'PENDING', 'APPROVED', 'DECLINED'];
const TYPE_FILTERS: Array<RequestType | ''> = ['', 'PROMOTION', 'SALARY_INCREASE', 'RESIGNATION'];

const REQUEST_TYPE_COLORS: Record<RequestType, string> = {
  PROMOTION: '#00C9A7',
  SALARY_INCREASE: '#4d8ef0',
  RESIGNATION: '#FF4C6A',
};

interface RequestWithEmployeeFields extends AdminEmployeeRequest {
  name?: string;
  email?: string;
  employee_name?: string;
  employee_email?: string;
}

interface EmployeeDetails {
  name: string;
  email: string;
}

interface FilterButtonProps<T extends string> {
  value: T | '';
  activeValue: T | '';
  onClick: (value: T | '') => void;
}

const cellStyle: React.CSSProperties = {
  padding: '14px 16px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  verticalAlign: 'middle',
};

const actionButtonStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: '13px',
  borderRadius: '8px',
};

const errorBoxStyle: React.CSSProperties = {
  color: '#FF4C6A',
  background: 'rgba(255,76,106,0.1)',
  border: '1px solid rgba(255,76,106,0.2)',
  borderRadius: '10px',
  padding: '14px 16px',
  marginBottom: '18px',
};

const badgeStyle = (color: string): React.CSSProperties => ({
  background: `${color}22`,
  color,
  border: `1px solid ${color}55`,
  borderRadius: '999px',
  padding: '4px 10px',
  fontSize: '12px',
  fontWeight: 700,
  display: 'inline-flex',
});

const tabButtonStyle = (active: boolean): React.CSSProperties => ({
  padding: '12px 16px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.08)',
  background: active ? 'rgba(255,107,53,0.1)' : 'transparent',
  color: active ? '#FF6B35' : '#A0A0A0',
  cursor: 'pointer',
  fontWeight: active ? 600 : 500,
  fontFamily: 'Inter, sans-serif',
  transition: 'all 0.2s',
});

const LoadingSpinner = () => (
  <div className="flex justify-center py-12">
    <div className="w-10 h-10 rounded-full border-[3px] border-[rgba(255,107,53,0.2)] border-t-[#FF6B35] animate-spin" />
  </div>
);

const formatDate = (iso: string): string => {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const getEmployeeDetails = (request: RequestWithEmployeeFields): EmployeeDetails => {
  const name = request.users?.name ?? request.name ?? request.employee_name ?? request.employee_id;
  const email = request.users?.email ?? request.email ?? request.employee_email ?? '';

  if (
    import.meta.env.DEV &&
    !request.users?.name &&
    !request.name &&
    !request.employee_name &&
    !request.users?.email &&
    !request.email &&
    !request.employee_email
  ) {
    console.error('Missing employee details for HR request', request.id);
  }

  return { name, email };
};

const FilterButton = <T extends string,>({ value, activeValue, onClick }: FilterButtonProps<T>) => {
  const active = activeValue === value;

  return (
    <button type="button" onClick={() => onClick(value)} style={tabButtonStyle(active)}>
      {value || 'All'}
    </button>
  );
};

const HRRequestsPanel: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<RequestStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<RequestType | ''>('');
  const [reviewTarget, setReviewTarget] = useState<AdminEmployeeRequest | null>(null);
  const { requests, loading, error, reviewRequest } = useAdminRequests({
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  });

  return (
    <section>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>HR Requests</h1>
        <p className="text-muted" style={{ fontSize: '16px' }}>
          Review employee promotion, salary, and resignation requests.
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span
            style={{ fontSize: '13px', color: '#A0A0A0', marginRight: '8px', alignSelf: 'center' }}
          >
            Status
          </span>
          {STATUS_FILTERS.map((status) => (
            <FilterButton
              key={status || 'ALL_STATUS'}
              value={status}
              activeValue={statusFilter}
              onClick={setStatusFilter}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span
            style={{ fontSize: '13px', color: '#A0A0A0', marginRight: '8px', alignSelf: 'center' }}
          >
            Type
          </span>
          {TYPE_FILTERS.map((type) => (
            <FilterButton
              key={type || 'ALL_TYPE'}
              value={type}
              activeValue={typeFilter}
              onClick={setTypeFilter}
            />
          ))}
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {error && <div style={errorBoxStyle}>{error}</div>}

      {!loading && !error && (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '920px' }}>
              <thead>
                <tr style={{ color: '#A0A0A0', textAlign: 'left', fontSize: '13px' }}>
                  <th style={cellStyle}>Employee</th>
                  <th style={cellStyle}>Email</th>
                  <th style={cellStyle}>Type</th>
                  <th style={cellStyle}>Status</th>
                  <th style={cellStyle}>Date</th>
                  <th style={cellStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => {
                  const employee = getEmployeeDetails(request);
                  const isPending = request.status === 'PENDING';

                  return (
                    <tr key={request.id}>
                      <td style={cellStyle}>
                        <div style={{ fontWeight: 600 }}>{employee.name}</div>
                      </td>
                      <td style={{ ...cellStyle, color: '#A0A0A0' }}>{employee.email}</td>
                      <td style={cellStyle}>
                        <span style={badgeStyle(REQUEST_TYPE_COLORS[request.type])}>{request.type}</span>
                      </td>
                      <td style={cellStyle}>
                        <span style={badgeStyle(STATUS_COLORS[request.status] ?? '#A0A0A0')}>
                          {request.status}
                        </span>
                      </td>
                      <td style={{ ...cellStyle, color: '#A0A0A0', fontSize: '13px' }}>
                        {formatDate(request.created_at)}
                      </td>
                      <td style={cellStyle}>
                        {isPending ? (
                          <button
                            type="button"
                            className="btn-ghost"
                            onClick={() => setReviewTarget(request)}
                            style={actionButtonStyle}
                          >
                            Review
                          </button>
                        ) : (
                          <span style={{ fontSize: '13px', color: '#A0A0A0' }}>Reviewed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {requests.length === 0 && (
              <div className="text-muted" style={{ textAlign: 'center', padding: '40px 20px' }}>
                No requests found.
              </div>
            )}
          </div>
        </div>
      )}

      {reviewTarget && (
        <ReviewRequestModal
          request={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onReview={reviewRequest}
        />
      )}
    </section>
  );
};

export default HRRequestsPanel;
