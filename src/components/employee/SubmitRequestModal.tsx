import React, { useState } from 'react';
import { getApiErrorMessage } from '../../api/errors';
import type { RequestType } from '../../hooks/useEmployeeRequests';

interface SubmitRequestModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (payload: { type: RequestType; cover_letter?: string }) => Promise<void>;
}

const REQUEST_TYPES: RequestType[] = ['PROMOTION', 'SALARY_INCREASE', 'RESIGNATION'];

const LABELS: Record<RequestType, string> = {
  PROMOTION: 'Cover Letter (required) - explain why you deserve advancement',
  SALARY_INCREASE: 'Justification (required) - explain your reasons',
  RESIGNATION: 'Note (optional) - any message for the admin',
};

const tabButtonStyle = (active: boolean, disabled: boolean): React.CSSProperties => ({
  padding: '12px 16px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.08)',
  background: active ? 'rgba(255,107,53,0.1)' : 'transparent',
  color: active ? '#FF6B35' : '#A0A0A0',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontWeight: active ? 600 : 500,
  fontFamily: 'Inter, sans-serif',
  transition: 'all 0.2s',
  opacity: disabled ? 0.6 : 1,
});

const SubmitRequestModal: React.FC<SubmitRequestModalProps> = ({
  onClose,
  onSuccess,
  onSubmit,
}) => {
  const [type, setType] = useState<RequestType>('PROMOTION');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedCoverLetter = coverLetter.trim();
    const requiresCoverLetter = type === 'PROMOTION' || type === 'SALARY_INCREASE';

    if (requiresCoverLetter && trimmedCoverLetter.length === 0) {
      setError('Please provide a cover letter or justification.');
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        type,
        cover_letter: trimmedCoverLetter.length > 0 ? trimmedCoverLetter : undefined,
      });
      onClose();
      onSuccess();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to submit request. Please try again.'));
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
      aria-labelledby="submit-request-title"
    >
      <form
        className="glass-card"
        style={{ width: '100%', maxWidth: '480px', padding: '28px' }}
        onSubmit={handleSubmit}
      >
        <div>
          <h2 id="submit-request-title" style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>
            Submit New Request
          </h2>
          <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>
            Send a promotion, salary, or resignation request for admin review.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', color: '#A0A0A0', marginBottom: '8px', display: 'block' }}>
            Request Type
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {REQUEST_TYPES.map((requestType) => {
              const selected = type === requestType;

              return (
                <button
                  key={requestType}
                  type="button"
                  disabled={submitting}
                  onClick={() => setType(requestType)}
                  style={tabButtonStyle(selected, submitting)}
                >
                  {requestType}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="cover-letter"
            style={{ fontSize: '13px', color: '#A0A0A0', marginBottom: '8px', display: 'block' }}
          >
            {LABELS[type]}
          </label>
          <textarea
            id="cover-letter"
            className="input-field"
            rows={5}
            value={coverLetter}
            disabled={submitting}
            onChange={(event) => setCoverLetter(event.target.value)}
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
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitRequestModal;
