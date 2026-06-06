import React, { useState } from 'react';
import { useOrders, type OrderStatus } from '../../../hooks/useOrders';
import OrderCard from './OrderCard';
import ToastNotification from '../../ToastNotification';

// ── Toast helper ─────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

let toastCounter = 0;

// ── Status filter tabs ────────────────────────────────────────────────────────

type FilterTab = 'all' | OrderStatus;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All Active' },
  { key: 'RECEIVED', label: 'Received' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'READY', label: 'Ready' },
];

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

// ── Main component ────────────────────────────────────────────────────────────

interface LiveOrdersPanelProps {
  onViewDetail: (orderId: string) => void;
}

const LiveOrdersPanel: React.FC<LiveOrdersPanelProps> = ({ onViewDetail }) => {
  const { orders, loading, error, refetch, updateOrderStatus } = useOrders();
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
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

  const handleError = (msg: string) => {
    pushToast(msg, 'error');
  };

  // Active orders only: exclude FINISHED and CANCELLED from the queue
  const activeOrders = orders.filter(
    (o) => o.status !== 'FINISHED' && o.status !== 'CANCELLED',
  );

  const filteredOrders =
    filterTab === 'all'
      ? activeOrders
      : activeOrders.filter((o) => o.status === filterTab);

  // Group counts for the tab badges
  const counts: Record<string, number> = {
    all: activeOrders.length,
    RECEIVED: activeOrders.filter((o) => o.status === 'RECEIVED').length,
    PREPARING: activeOrders.filter((o) => o.status === 'PREPARING').length,
    READY: activeOrders.filter((o) => o.status === 'READY').length,
  };

  return (
    <section>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
            Live Orders
          </h1>
          <p className="text-muted" style={{ fontSize: '15px' }}>
            Auto-refreshes every 15 seconds. Click "View Details" for the full order breakdown.
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
            transition: 'border-color 0.2s',
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── Filter tabs ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {FILTER_TABS.map(({ key, label }) => {
          const active = filterTab === key;
          const count = counts[key] ?? 0;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilterTab(key)}
              style={{
                padding: '6px 16px',
                borderRadius: '50px',
                fontSize: '13px',
                fontWeight: 600,
                border: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
                background: active ? '#FF6B35' : 'transparent',
                color: active ? '#fff' : '#A0A0A0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.2s',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {label}
              <span
                style={{
                  background: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                  borderRadius: '50px',
                  padding: '1px 8px',
                  fontSize: '11px',
                  minWidth: '20px',
                  textAlign: 'center',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Error banner ───────────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
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

      {/* ── Loading state ──────────────────────────────────────────────── */}
      {loading && <Spinner />}

      {/* ── Empty state ────────────────────────────────────────────────── */}
      {!loading && !error && filteredOrders.length === 0 && (
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
          <div style={{ fontSize: '40px' }}>🎉</div>
          <p style={{ fontSize: '16px', fontWeight: 600 }}>
            {filterTab === 'all' ? 'No active orders right now.' : `No ${filterTab.toLowerCase()} orders.`}
          </p>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            New orders will appear here automatically.
          </p>
        </div>
      )}

      {/* ── Order list ─────────────────────────────────────────────────── */}
      {!loading && filteredOrders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdate={handleUpdate}
              onNavigate={onViewDetail}
              onError={handleError}
            />
          ))}
        </div>
      )}

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

export default LiveOrdersPanel;
