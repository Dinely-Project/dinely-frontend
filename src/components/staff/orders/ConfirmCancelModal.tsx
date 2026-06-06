import React from 'react';

interface ConfirmCancelModalProps {
  orderId: string;
  customerName: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  busy: boolean;
}

const ConfirmCancelModal: React.FC<ConfirmCancelModalProps> = ({
  orderId,
  customerName,
  onConfirm,
  onClose,
  busy,
}) => {
  const shortId = orderId.slice(0, 8).toUpperCase();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#141414',
          border: '1px solid rgba(248,81,73,0.25)',
          borderRadius: '16px',
          padding: '32px 28px',
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'rgba(248,81,73,0.12)',
            border: '1px solid rgba(248,81,73,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            marginBottom: '20px',
          }}
        >
          ✕
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '10px',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Cancel Order #{shortId}?
        </h2>

        {/* Body */}
        <p
          style={{
            fontSize: '14px',
            color: '#A0A0A0',
            lineHeight: '1.6',
            marginBottom: '28px',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          You are about to cancel{' '}
          <strong style={{ color: '#fff' }}>{customerName}</strong>'s order.
          This action cannot be undone.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{
              flex: 1,
              padding: '11px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent',
              color: '#A0A0A0',
              fontSize: '14px',
              fontWeight: 600,
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.5 : 1,
              transition: 'border-color 0.2s, color 0.2s',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Keep Order
          </button>

          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={busy}
            style={{
              flex: 1,
              padding: '11px 16px',
              borderRadius: '10px',
              border: 'none',
              background: busy ? 'rgba(248,81,73,0.5)' : '#f85149',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: busy ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {busy ? 'Cancelling…' : 'Yes, Cancel Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCancelModal;
