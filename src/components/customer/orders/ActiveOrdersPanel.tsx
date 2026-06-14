import React from 'react';
import { Ban, ShoppingBag } from 'lucide-react';
import { useCustomerOrders } from '../../../hooks/useCustomerOrders';
import OrderReadyBanner from './OrderReadyBanner';

// ── Types ─────────────────────────────────────────────────────────────────────

import type { CustomerOrderStatus } from '../../../hooks/useCustomerOrders';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatPrice = (price: number) =>
  `LKR ${Number.isFinite(price) ? price.toLocaleString() : '—'}`;

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// ── Status progress bar ───────────────────────────────────────────────────────

const PROGRESS_STEPS: { status: CustomerOrderStatus; label: string }[] = [
  { status: 'RECEIVED', label: 'Received' },
  { status: 'PREPARING', label: 'Preparing' },
  { status: 'READY', label: 'Ready' },
  { status: 'FINISHED', label: 'Done' },
];

const STATUS_COLORS: Record<CustomerOrderStatus, string> = {
  RECEIVED: '#d29922',
  PREPARING: '#58a6ff',
  READY: '#3fb950',
  FINISHED: '#6e7681',
  CANCELLED: '#f85149',
};

interface StatusProgressProps {
  status: CustomerOrderStatus;
}

const StatusProgress: React.FC<StatusProgressProps> = ({ status }) => {
  if (status === 'CANCELLED') {
    return (
      <div
        style={{
          padding: '10px 16px',
          background: 'rgba(248,81,73,0.1)',
          border: '1px solid rgba(248,81,73,0.2)',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#f85149',
          fontWeight: 600,
        }}
      >
        <Ban size={14} style={{ marginRight: 6 }} /> This order has been cancelled.
      </div>
    );
  }

  const currentIdx = PROGRESS_STEPS.findIndex((s) => s.status === status);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
      {PROGRESS_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        const color = active ? STATUS_COLORS[step.status] : done ? '#3fb950' : '#2d2d2d';

        return (
          <React.Fragment key={step.status}>
            {/* Step dot */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: done ? color : '#1a1a1a',
                  border: `2px solid ${done ? color : '#2d2d2d'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  transition: 'all 0.3s',
                  boxShadow: active ? `0 0 10px ${color}66` : 'none',
                }}
              >
                {done && !active && '✓'}
                {active && (
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: color,
                      animation: 'pulse-dot 1.5s ease-in-out infinite',
                    }}
                  />
                )}
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: active ? 700 : 500,
                  color: done ? color : '#6e7681',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < PROGRESS_STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  marginBottom: '18px',
                  background: idx < currentIdx ? '#3fb950' : '#2d2d2d',
                  transition: 'background 0.4s',
                }}
              />
            )}
          </React.Fragment>
        );
      })}

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.3); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

// ── Spinner ───────────────────────────────────────────────────────────────────

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: '3px solid rgba(255,107,53,0.2)',
        borderTopColor: '#FF6B35',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const ActiveOrdersPanel: React.FC = () => {
  const { activeOrders, loading, error, refetch } = useCustomerOrders();

  const readyOrders = activeOrders.filter((o) => o.status === 'READY');

  return (
    <section>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>My Orders</h1>
          <p className="text-muted" style={{ fontSize: '15px' }}>
            Live order status — updates every 12 seconds automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#A0A0A0',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── Ready banner ───────────────────────────────────────────────── */}
      {readyOrders.length > 0 && <OrderReadyBanner readyOrders={readyOrders} />}

      {/* ── States ─────────────────────────────────────────────────────── */}
      {loading && <Spinner />}

      {error && !loading && (
        <div
          style={{
            padding: '14px 18px',
            background: 'rgba(248,81,73,0.1)',
            border: '1px solid rgba(248,81,73,0.2)',
            borderRadius: '10px',
            color: '#f85149',
            fontSize: '14px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      {!loading && activeOrders.length === 0 && (
        <div
          className="glass-card"
          style={{
            padding: '60px 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <ShoppingBag size={40} />
          <p style={{ fontSize: '16px', fontWeight: 600 }}>No active orders right now.</p>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Place an order and track it live here.
          </p>
        </div>
      )}

      {/* ── Order cards ────────────────────────────────────────────────── */}
      {!loading && activeOrders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeOrders.map((order) => {
            const shortId = order.id.slice(0, 8).toUpperCase();
            const statusColor = STATUS_COLORS[order.status] ?? '#6e7681';

            return (
              <div
                key={order.id}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderLeft: `3px solid ${statusColor}`,
                }}
              >
                {/* Order header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        marginBottom: '4px',
                      }}
                    >
                      Order #{shortId}
                    </p>
                    <p className="text-muted" style={{ fontSize: '13px' }}>
                      Placed {formatDateTime(order.created_at)}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#FF6B35',
                    }}
                  >
                    {formatPrice(order.total_price)}
                  </span>
                </div>

                {/* Status progress bar */}
                <div style={{ marginBottom: '20px' }}>
                  <StatusProgress status={order.status} />
                </div>

                {/* Items list */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#6e7681',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: '4px',
                    }}
                  >
                    Items ({order.item_count})
                  </p>
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span style={{ fontSize: '13px', color: '#fff' }}>
                        {item.name}{' '}
                        <span className="text-muted">×{item.quantity}</span>
                      </span>
                      <span style={{ fontSize: '13px', color: '#A0A0A0', whiteSpace: 'nowrap' }}>
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {order.notes && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#A0A0A0',
                      fontStyle: 'italic',
                    }}
                  >
                    "{order.notes}"
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ActiveOrdersPanel;
