import React, { useState } from 'react';
import { getApiErrorMessage } from '../../api/errors';
import type { AdminEmployeeRequest } from '../../hooks/useAdminRequests';
import type { RequestType } from '../../hooks/useEmployeeRequests';

interface ReviewRequestModalProps {
  request: AdminEmployeeRequest;
  onClose: () => void;
  onReview: (
    id: string,
    payload: { status: 'APPROVED' | 'DECLINED'; admin_feedback?: string },
  ) => Promise<void>;
}

const REQUEST_TYPE_COLORS: Record<RequestType, string> = {
  PROMOTION: '#00C9A7',
  SALARY_INCREASE: '#4d8ef0',
  RESIGNATION: '#FF4C6A',
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

const decisionButtonStyle = (
  active: boolean,
  activeColor: string,
  activeBackground: string,
  activeBorder: string,
  disabled: boolean,
): React.CSSProperties => ({
  background: active ? activeBackground : 'rgba(255,255,255,0.04)',
  color: active ? activeColor : '#A0A0A0',
  border: active ? activeBorder : '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  padding: '10px 20px',
  fontWeight: 600,
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'Inter, sans-serif',
  opacity: disabled ? 0.6 : 1,
});

const ReviewRequestModal: React.FC<ReviewRequestModalProps> = ({ request, onClose, onReview }) => {
  const [decision, setDecision] = useState<'APPROVED' | 'DECLINED'>('APPROVED');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const employeeName = request.users?.name ?? request.employee_id;
  const employeeEmail = request.users?.email ?? '';
  const subtitle = employeeEmail ? `${employeeName} · ${employeeEmail}` : employeeName;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await onReview(request.id, {
        status: decision,
        admin_feedback: feedback.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to submit decision. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        zIndex: 1000,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-request-title"
    >
      <form
        className="glass-card"
        style={{ width: '100%', maxWidth: '500px', padding: '28px' }}
        onSubmit={handleSubmit}
      >
        <div>
          <h2 id="review-request-title" style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>
            Review Request
          </h2>
          <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>
            {subtitle}
          </p>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <span style={badgeStyle(REQUEST_TYPE_COLORS[request.type])}>{request.type}</span>
          {request.cover_letter ? (
            <p style={{ fontSize: '14px', color: '#e0e0e0', marginTop: '10px', whiteSpace: 'pre-line' }}>
              {request.cover_letter}
            </p>
          ) : (
            <p className="text-muted" style={{ fontSize: '14px', marginTop: '10px' }}>
              No cover letter provided.
            </p>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', color: '#A0A0A0', marginBottom: '8px', display: 'block' }}>
            Decision
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              disabled={submitting}
              onClick={() => setDecision('APPROVED')}
              style={decisionButtonStyle(
                decision === 'APPROVED',
                '#3fb950',
                'rgba(63,185,80,0.15)',
                '1px solid rgba(63,185,80,0.4)',
                submitting,
              )}
            >
              APPROVE
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => setDecision('DECLINED')}
              style={decisionButtonStyle(
                decision === 'DECLINED',
                '#f85149',
                'rgba(248,81,73,0.15)',
                '1px solid rgba(248,81,73,0.4)',
                submitting,
              )}
            >
              DECLINE
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="admin-feedback"
            style={{ fontSize: '13px', color: '#A0A0A0', marginBottom: '8px', display: 'block' }}
          >
            Feedback (optional) - visible to the employee
          </label>
          <textarea
            id="admin-feedback"
            className="input-field"
            rows={4}
            value={feedback}
            disabled={submitting}
            onChange={(event) => setFeedback(event.target.value)}
            style={{ resize: 'vertical', width: '100%' }}
          />
          {error && <p style={{ color: '#FF4C6A', fontSize: '13px', marginTop: '8px' }}>{error}</p>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: '10px 18px', opacity: submitting ? 0.6 : 1 }}
            disabled={submitting}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '10px 18px', opacity: submitting ? 0.6 : 1 }}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Decision'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewRequestModal;
