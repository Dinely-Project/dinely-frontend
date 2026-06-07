import React, { useState } from 'react';
import { STATUS_COLORS } from '../../constants/colors';
import { useEmployeeRequests } from '../../hooks/useEmployeeRequests';
import type { EmployeeRequest, RequestStatus, RequestType } from '../../hooks/useEmployeeRequests';
import SubmitRequestModal from './SubmitRequestModal';

const STATUS_FILTERS: Array<RequestStatus | ''> = ['', 'PENDING', 'APPROVED', 'DECLINED'];

const REQUEST_TYPE_COLORS: Record<RequestType, string> = {
  PROMOTION: '#00C9A7',
  SALARY_INCREASE: '#4d8ef0',
  RESIGNATION: '#FF4C6A',
};

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

const getStatusColor = (status: RequestStatus): string =>
  STATUS_COLORS[status] ?? '#A0A0A0';

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

const filterButtonStyle = (active: boolean): React.CSSProperties => ({
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

const errorBoxStyle: React.CSSProperties = {
  color: '#FF4C6A',
  background: 'rgba(255,76,106,0.1)',
  border: '1px solid rgba(255,76,106,0.2)',
  borderRadius: '10px',
  padding: '14px 16px',
  marginBottom: '18px',
};

const adminFeedbackStyle: React.CSSProperties = {
  background: 'rgba(255,107,53,0.08)',
  border: '1px solid rgba(255,107,53,0.2)',
  borderRadius: '10px',
  padding: '12px 16px',
  marginTop: '12px',
};

const LoadingSpinner = () => (
  <div className="flex justify-center py-12">
    <div className="w-10 h-10 rounded-full border-[3px] border-[rgba(255,107,53,0.2)] border-t-[#FF6B35] animate-spin" />
  </div>
);

const RequestCard: React.FC<{ request: EmployeeRequest }> = ({ request }) => (
  <article className="glass-card" style={{ padding: '20px 24px', marginBottom: '12px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span style={badgeStyle(REQUEST_TYPE_COLORS[request.type])}>
          {request.type}
        </span>
        <span style={badgeStyle(getStatusColor(request.status))}>
          {request.status}
        </span>
      </div>
      <span style={{ color: '#A0A0A0', fontSize: '13px' }}>{formatDate(request.created_at)}</span>
    </div>

    {request.cover_letter && (
      <p
        style={{
          fontSize: '14px',
          color: '#e0e0e0',
          marginTop: '12px',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          whiteSpace: 'pre-line',
        }}
      >
        {request.cover_letter}
      </p>
    )}

    {request.admin_feedback && (
      <div style={adminFeedbackStyle}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#FF6B35',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}
        >
          Admin Feedback
        </div>
        <div style={{ fontSize: '14px', color: '#e0e0e0' }}>{request.admin_feedback}</div>
      </div>
    )}

    {request.reviewed_at && (
      <div style={{ fontSize: '12px', color: '#A0A0A0', marginTop: '8px' }}>
        Reviewed {formatDate(request.reviewed_at)}
      </div>
    )}
  </article>
);

const RequestsPanel: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<RequestStatus | ''>('');
  const [submitOpen, setSubmitOpen] = useState(false);
  const { requests, loading, error, submitRequest } = useEmployeeRequests({
    status: statusFilter || undefined,
  });

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>My Requests</h1>
          <p className="text-muted" style={{ fontSize: '16px' }}>
            Track your promotion, salary, and resignation requests.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          style={{ padding: '12px 24px' }}
          onClick={() => setSubmitOpen(true)}
        >
          Submit New Request
        </button>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {STATUS_FILTERS.map((status) => {
            const active = statusFilter === status;

            return (
              <button
                key={status || 'ALL'}
                type="button"
                onClick={() => setStatusFilter(status)}
                style={filterButtonStyle(active)}
              >
                {status || 'All'}
              </button>
            );
          })}
        </div>

        {loading && <LoadingSpinner />}

        {error && <div style={errorBoxStyle}>{error}</div>}

        {!loading && !error && requests.length === 0 && (
          <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
            <div className="text-muted" style={{ fontSize: '16px' }}>
              No requests yet. Submit your first one.
            </div>
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
          <>
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </>
        )}
      </div>

      {submitOpen && (
        <SubmitRequestModal
          onClose={() => setSubmitOpen(false)}
          onSuccess={() => undefined}
          onSubmit={submitRequest}
        />
      )}
    </section>
  );
};

export default RequestsPanel;
