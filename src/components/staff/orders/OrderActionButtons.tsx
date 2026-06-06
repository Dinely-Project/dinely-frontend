import React, { useState } from 'react';
import type { OrderStatus } from '../../../hooks/useOrders';
import { getApiErrorMessage } from '../../../api/errors';
import ConfirmCancelModal from './ConfirmCancelModal';

interface OrderActionButtonsProps {
  orderId: string;
  customerName: string;
  status: OrderStatus;
  onUpdate: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  onError?: (msg: string) => void;
  /** If true, buttons render in a compact row (list view). Default: false (detail view). */
  compact?: boolean;
}

/**
 * Next valid status transitions per the backend lifecycle:
 *   RECEIVED → PREPARING → READY → FINISHED  (one-way)
 *   RECEIVED | PREPARING → CANCELLED
 */
const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  RECEIVED: { status: 'PREPARING', label: 'Start Preparing' },
  PREPARING: { status: 'READY', label: 'Mark Ready' },
  READY: { status: 'FINISHED', label: 'Mark Finished' },
};

const CAN_CANCEL: OrderStatus[] = ['RECEIVED', 'PREPARING'];

const OrderActionButtons: React.FC<OrderActionButtonsProps> = ({
  orderId,
  customerName,
  status,
  onUpdate,
  onError,
  compact = false,
}) => {
  const [busy, setBusy] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const next = NEXT_STATUS[status];
  const canCancel = CAN_CANCEL.includes(status);

  if (!next && !canCancel) {
    return null; // FINISHED or CANCELLED — no actions
  }

  const handleAdvance = async () => {
    if (!next || busy) return;
    setBusy(true);
    try {
      await onUpdate(orderId, next.status);
    } catch (err: unknown) {
      onError?.(getApiErrorMessage(err, `Failed to update order to ${next.status}.`));
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmCancel = async () => {
    setBusy(true);
    try {
      await onUpdate(orderId, 'CANCELLED');
      setShowCancelModal(false);
    } catch (err: unknown) {
      onError?.(getApiErrorMessage(err, 'Failed to cancel order.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: compact ? 'nowrap' : 'wrap',
          flexDirection: compact ? 'row' : 'row',
          marginTop: compact ? 0 : '4px',
        }}
      >
        {/* Advance button */}
        {next && (
          <button
            type="button"
            onClick={handleAdvance}
            disabled={busy}
            style={{
              padding: compact ? '7px 14px' : '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#FF6B35',
              color: '#fff',
              fontSize: compact ? '12px' : '14px',
              fontWeight: 600,
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.6 : 1,
              transition: 'background 0.2s',
              whiteSpace: 'nowrap',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {busy ? '…' : next.label}
          </button>
        )}

        {/* Cancel button */}
        {canCancel && (
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            disabled={busy}
            style={{
              padding: compact ? '7px 14px' : '10px 20px',
              borderRadius: '8px',
              border: '1px solid rgba(248,81,73,0.4)',
              background: 'rgba(248,81,73,0.08)',
              color: '#f85149',
              fontSize: compact ? '12px' : '14px',
              fontWeight: 600,
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.6 : 1,
              transition: 'background 0.2s',
              whiteSpace: 'nowrap',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {showCancelModal && (
        <ConfirmCancelModal
          orderId={orderId}
          customerName={customerName}
          onConfirm={handleConfirmCancel}
          onClose={() => setShowCancelModal(false)}
          busy={busy}
        />
      )}
    </>
  );
};

export default OrderActionButtons;
