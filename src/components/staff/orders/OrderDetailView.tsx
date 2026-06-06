import React, { useState } from 'react';
import { useOrderDetail, type OrderStatus } from '../../../hooks/useOrders';
import OrderStatusBadge from './OrderStatusBadge';
import OrderActionButtons from './OrderActionButtons';
import ToastNotification from '../../ToastNotification';

// ── Toast helper ─────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

let toastCounter = 0;

// ── Spinner ───────────────────────────────────────────────────────────────────

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: '3px solid rgba(255,107,53,0.2)',
        borderTopColor: '#FF6B35',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatPrice = (price: number) =>
  `LKR ${Number.isFinite(price) ? price.toLocaleString() : '—'}`;

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// ── Status history entry ──────────────────────────────────────────────────────

interface HistoryEntryProps {
  oldStatus: OrderStatus | null;
  newStatus: OrderStatus;
  changedAt: string;
  isLast: boolean;
}

const statusLabel = (s: OrderStatus | null): string => {
  if (!s) return 'Order Created';
  const map: Record<OrderStatus, string> = {
    RECEIVED: 'Received',
    PREPARING: 'Preparing',
    READY: 'Ready',
    FINISHED: 'Finished',
    CANCELLED: 'Cancelled',
  };
  return map[s] ?? s;
};

const HistoryEntry: React.FC<HistoryEntryProps> = ({ oldStatus, newStatus, changedAt, isLast }) => {
  const dotColors: Record<string, string> = {
    RECEIVED: '#d29922',
    PREPARING: '#58a6ff',
    READY: '#3fb950',
    FINISHED: '#6e7681',
    CANCELLED: '#f85149',
  };
  const dotColor = dotColors[newStatus] ?? '#6e7681';

  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      {/* Timeline track */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px', flexShrink: 0 }}>
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: dotColor,
            border: `2px solid ${dotColor}55`,
            flexShrink: 0,
            marginTop: '3px',
          }}
        />
        {!isLast && (
          <div
            style={{
              width: '2px',
              flex: 1,
              background: 'rgba(255,255,255,0.08)',
              marginTop: '4px',
              minHeight: '28px',
            }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ paddingBottom: isLast ? 0 : '20px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '2px' }}>
          {oldStatus ? (
            <span className="text-muted" style={{ fontSize: '13px' }}>
              {statusLabel(oldStatus)} →{' '}
              <strong style={{ color: '#fff' }}>{statusLabel(newStatus)}</strong>
            </span>
          ) : (
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
              Order Received
            </span>
          )}
          <OrderStatusBadge status={newStatus} size="sm" />
        </div>
        <span className="text-muted" style={{ fontSize: '12px' }}>
          {formatDateTime(changedAt)}
        </span>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

interface OrderDetailViewProps {
  orderId: string;
  onBack: () => void;
}

const OrderDetailView: React.FC<OrderDetailViewProps> = ({ orderId, onBack }) => {
  const { order, loading, error, updateOrderStatus } = useOrderDetail(orderId);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdate = async (orderId: string, newStatus: OrderStatus): Promise<void> => {
    await updateOrderStatus(orderId, newStatus);
    const labels: Record<OrderStatus, string> = {
      RECEIVED: 'received',
      PREPARING: 'now preparing',
      READY: 'ready for pickup',
      FINISHED: 'finished',
      CANCELLED: 'cancelled',
    };
    pushToast(`Order marked as ${labels[newStatus]}.`);
  };

  const handleError = (msg: string) => pushToast(msg, 'error');

  // ── Render states ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <section>
        <button type="button" onClick={onBack} style={backBtnStyle}>
          ← Back to Orders
        </button>
        <Spinner />
      </section>
    );
  }

  if (error || !order) {
    return (
      <section>
        <button type="button" onClick={onBack} style={backBtnStyle}>
          ← Back to Orders
        </button>
        <div
          style={{
            padding: '16px 20px',
            background: 'rgba(248,81,73,0.1)',
            border: '1px solid rgba(248,81,73,0.2)',
            borderRadius: '10px',
            color: '#f85149',
            fontSize: '14px',
          }}
        >
          {error ?? 'Order not found.'}
        </div>
      </section>
    );
  }

  const shortId = order.id.slice(0, 8).toUpperCase();

  return (
    <section>
      {/* ── Back link ──────────────────────────────────────────────────── */}
      <button type="button" onClick={onBack} style={backBtnStyle}>
        ← Back to Orders
      </button>

      {/* ── Order header ───────────────────────────────────────────────── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Order #{shortId}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <span className="text-muted" style={{ fontSize: '14px' }}>
            👤 <strong style={{ color: '#fff' }}>{order.customer_name}</strong>
          </span>
          <span className="text-muted" style={{ fontSize: '14px' }}>
            📅 {formatDateTime(order.created_at)}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#FF6B35' }}>
            {formatPrice(order.total_price)}
          </span>
        </div>
      </div>

      {/* ── Action buttons (same lifecycle rules as queue) ─────────────── */}
      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#A0A0A0', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Order Actions
        </p>
        <OrderActionButtons
          orderId={order.id}
          customerName={order.customer_name}
          status={order.status}
          onUpdate={handleUpdate}
          onError={handleError}
        />
        {order.status === 'FINISHED' || order.status === 'CANCELLED' ? (
          <p className="text-muted" style={{ fontSize: '13px' }}>
            This order is {order.status.toLowerCase()} — no further actions available.
          </p>
        ) : null}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* ── Left column: Items table ──────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px', overflow: 'hidden' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
              📋 Items ({order.item_count})
            </h2>

            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto auto',
                gap: '12px',
                paddingBottom: '10px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                marginBottom: '8px',
              }}
            >
              {['Item', 'Qty', 'Unit Price', 'Subtotal'].map((h) => (
                <span key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Table rows */}
            {order.items.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto auto',
                  gap: '12px',
                  padding: '10px 0',
                  borderBottom: idx < order.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>{item.name}</span>
                <span className="text-muted" style={{ fontSize: '14px', textAlign: 'right' }}>
                  ×{item.quantity}
                </span>
                <span className="text-muted" style={{ fontSize: '14px', textAlign: 'right' }}>
                  {formatPrice(item.unit_price)}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#FF6B35', textAlign: 'right' }}>
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}

            {/* Total row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto auto',
                gap: '12px',
                paddingTop: '14px',
                borderTop: '1px solid rgba(255,255,255,0.12)',
                marginTop: '4px',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '14px', gridColumn: '1 / 4', textAlign: 'right' }}>
                Total
              </span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#FF6B35', textAlign: 'right' }}>
                {formatPrice(order.total_price)}
              </span>
            </div>
          </div>

          {/* ── Customer notes ──────────────────────────────────────────── */}
          {order.notes && (
            <div className="glass-card" style={{ padding: '20px 24px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>
                💬 Customer Notes
              </h2>
              <p
                style={{
                  fontSize: '14px',
                  color: '#A0A0A0',
                  fontStyle: 'italic',
                  lineHeight: '1.6',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                "{order.notes}"
              </p>
            </div>
          )}
        </div>

        {/* ── Right column: Status history timeline ────────────────────── */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '22px' }}>
            🕐 Status Timeline
          </h2>

          {order.status_history.length === 0 ? (
            <p className="text-muted" style={{ fontSize: '14px' }}>No status history yet.</p>
          ) : (
            <div>
              {order.status_history.map((entry, idx) => (
                <HistoryEntry
                  key={entry.id}
                  oldStatus={entry.old_status}
                  newStatus={entry.new_status}
                  changedAt={entry.changed_at}
                  isLast={idx === order.status_history.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Toasts ─────────────────────────────────────────────────────── */}
      {toasts.map((t) => (
        <ToastNotification
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => dismissToast(t.id)}
        />
      ))}
    </section>
  );
};

const backBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#A0A0A0',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  padding: '0 0 20px 0',
  display: 'block',
  fontFamily: "'Inter', sans-serif",
  transition: 'color 0.15s',
};

export default OrderDetailView;
