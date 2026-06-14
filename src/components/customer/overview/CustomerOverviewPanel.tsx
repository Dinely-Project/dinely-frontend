import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/axios';
import { getApiErrorMessage } from '../../../api/errors';
import { STATUS_COLORS, STATUS_BG } from '../../../constants/colors';
import { useCart } from '../../../context/CartContext';
import type { CustomerOrder, CustomerOrderStatus } from '../../../hooks/useCustomerOrders';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  avgOrderValue: number;
  favouriteItem: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) => `LKR ${Number.isFinite(n) ? n.toLocaleString() : '—'}`;

const timeAgo = (iso: string): string => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Received',
  PREPARING: 'Preparing',
  READY: 'Ready for Pickup',
  FINISHED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_ICONS: Record<string, string> = {
  RECEIVED: '📥',
  PREPARING: '👨‍🍳',
  READY: '✅',
  FINISHED: '🎉',
  CANCELLED: '❌',
};

// ── Sub-components ────────────────────────────────────────────────────────────

const Spinner: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      border: '2px solid rgba(255,107,53,0.2)',
      borderTopColor: '#FF6B35',
      animation: 'spin 0.8s linear infinite',
      display: 'inline-block',
      flexShrink: 0,
    }}
  />
);

interface StatCardProps {
  icon: string;
  label: string;
  value: string | null;
  loading: boolean;
  accent?: string;
  subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  loading,
  accent = '#FF6B35',
  subtext,
}) => (
  <div
    className="glass-card"
    style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '18px' }}
  >
    <div
      style={{
        width: '52px',
        height: '52px',
        borderRadius: '14px',
        background: `${accent}18`,
        border: `1px solid ${accent}33`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '22px',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="text-muted" style={{ fontSize: '12px', marginBottom: '4px', fontWeight: 500 }}>
        {label}
      </div>
      {loading ? (
        <div style={{ marginTop: '6px' }}>
          <Spinner />
        </div>
      ) : (
        <>
          <div style={{ fontSize: '24px', fontWeight: 700, lineHeight: 1.1, color: '#fff' }}>
            {value ?? '—'}
          </div>
          {subtext && (
            <div className="text-muted" style={{ fontSize: '12px', marginTop: '3px' }}>
              {subtext}
            </div>
          )}
        </>
      )}
    </div>
  </div>
);

interface StatusBadgeProps {
  status: CustomerOrderStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const color = STATUS_COLORS[status] ?? '#A0A0A0';
  const bg = STATUS_BG[status] ?? 'rgba(160,160,160,0.1)';
  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: '50px',
        fontSize: '11px',
        fontWeight: 700,
        background: bg,
        color,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
};

// ── Active Order Mini-card ─────────────────────────────────────────────────────

interface ActiveOrderCardProps {
  order: CustomerOrder;
  onViewOrders: () => void;
}

const PROGRESS_STEPS: { status: CustomerOrderStatus; label: string }[] = [
  { status: 'RECEIVED', label: 'Received' },
  { status: 'PREPARING', label: 'Preparing' },
  { status: 'READY', label: 'Ready' },
  { status: 'FINISHED', label: 'Done' },
];

const MiniProgressBar: React.FC<{ status: CustomerOrderStatus }> = ({ status }) => {
  if (status === 'CANCELLED') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: '#f85149',
          fontWeight: 600,
        }}
      >
        <span>🚫</span> Cancelled
      </div>
    );
  }

  const currentIdx = PROGRESS_STEPS.findIndex((s) => s.status === status);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', width: '100%' }}>
      {PROGRESS_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        const color = active
          ? STATUS_COLORS[step.status]
          : done
          ? '#3fb950'
          : '#2d2d2d';

        return (
          <React.Fragment key={step.status}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: done ? color : '#1a1a1a',
                  border: `2px solid ${done ? color : '#2d2d2d'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  boxShadow: active ? `0 0 8px ${color}66` : 'none',
                  transition: 'all 0.3s',
                }}
              >
                {done && !active && (
                  <span style={{ color: '#000', fontWeight: 700 }}>✓</span>
                )}
                {active && (
                  <div
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: color,
                      animation: 'pulse-dot 1.5s ease-in-out infinite',
                    }}
                  />
                )}
              </div>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: active ? 700 : 500,
                  color: done ? color : '#6e7681',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </span>
            </div>
            {idx < PROGRESS_STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  marginBottom: '14px',
                  background: idx < currentIdx ? '#3fb950' : '#2d2d2d',
                  transition: 'background 0.4s',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const ActiveOrderCard: React.FC<ActiveOrderCardProps> = ({ order, onViewOrders }) => {
  const isReady = order.status === 'READY';
  const statusColor = STATUS_COLORS[order.status] ?? '#A0A0A0';

  return (
    <div
      className="glass-card"
      style={{
        padding: '18px 20px',
        borderLeft: `3px solid ${statusColor}`,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onClick={onViewOrders}
    >
      {isReady && (
        <div
          style={{
            padding: '8px 12px',
            background: 'rgba(63,185,80,0.1)',
            border: '1px solid rgba(63,185,80,0.25)',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#3fb950',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>🔔</span> Your order is ready for pickup!
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '14px',
          gap: '8px',
        }}
      >
        <div>
          <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>
            Order #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-muted" style={{ fontSize: '12px' }}>
            {formatDateTime(order.created_at)} · {order.item_count} item
            {order.item_count !== 1 ? 's' : ''}
          </p>
        </div>
        <span style={{ fontWeight: 700, fontSize: '15px', color: '#FF6B35', flexShrink: 0 }}>
          {fmt(order.total_price)}
        </span>
      </div>

      <MiniProgressBar status={order.status} />
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

interface CustomerOverviewPanelProps {
  userName?: string;
  onGoToOrders: () => void;
  onGoToHistory: () => void;
}

const POLL_MS = 30_000;

const normalizeList = (payload: unknown): CustomerOrder[] => {
  if (Array.isArray(payload)) return payload as CustomerOrder[];
  if (payload && typeof payload === 'object') {
    const p = payload as Record<string, unknown>;
    if (Array.isArray(p.data)) return p.data as CustomerOrder[];
  }
  return [];
};

const computeStats = (
  activeOrders: CustomerOrder[],
  historyOrders: CustomerOrder[],
): CustomerStats => {
  const allOrders = [...activeOrders, ...historyOrders];
  const completed = historyOrders.filter((o) => o.status === 'FINISHED');
  const cancelled = historyOrders.filter((o) => o.status === 'CANCELLED');

  const totalSpent = completed.reduce((sum, o) => sum + o.total_price, 0);
  const avgOV = completed.length > 0 ? totalSpent / completed.length : 0;

  // Find favourite item by frequency
  const itemCount: Record<string, number> = {};
  for (const order of allOrders) {
    for (const item of order.items) {
      itemCount[item.name] = (itemCount[item.name] ?? 0) + item.quantity;
    }
  }
  const favouriteItem =
    Object.entries(itemCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    totalOrders: allOrders.length,
    totalSpent,
    activeOrders: activeOrders.length,
    completedOrders: completed.length,
    cancelledOrders: cancelled.length,
    avgOrderValue: avgOV,
    favouriteItem,
  };
};

const CustomerOverviewPanel: React.FC<CustomerOverviewPanelProps> = ({
  userName,
  onGoToOrders,
  onGoToHistory,
}) => {
  const { totalItems } = useCart();

  const [activeOrders, setActiveOrders] = useState<CustomerOrder[]>([]);
  const [historyOrders, setHistoryOrders] = useState<CustomerOrder[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [activeRes, historyRes] = await Promise.all([
        api.get('/api/orders/my'),
        api.get('/api/orders/history'),
      ]);

      const active = normalizeList(activeRes.data);
      const history = normalizeList(historyRes.data);

      setActiveOrders(active);
      setHistoryOrders(history);
      setStats(computeStats(active, history));
      setLastUpdated(new Date());
      setError(null);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load your dashboard data.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
    intervalRef.current = setInterval(() => void fetchAll(), POLL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAll]);

  // Recent 5 from history (sorted newest first)
  const recentHistory = [...historyOrders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const hasReadyOrder = activeOrders.some((o) => o.status === 'READY');

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-dot { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.7; } }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(63,185,80,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(63,185,80,0); }
        }
        .overview-fade { animation: fadeIn 0.35s ease both; }
        .quick-card:hover { border-color: rgba(255,107,53,0.4) !important; background: rgba(255,107,53,0.06) !important; }
        .history-row:hover { background: rgba(255,255,255,0.04) !important; }
        .active-order-card:hover { border-color: rgba(255,107,53,0.3) !important; }
      `}</style>

      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div
        style={{
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 700, marginBottom: '6px' }}>
            Welcome back, {userName || 'Customer'} 👋
          </h1>
          <p className="text-muted" style={{ fontSize: '15px' }}>
            Here's a summary of your activity at Dinely.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {lastUpdated && (
            <span className="text-muted" style={{ fontSize: '12px' }}>
              Updated {timeAgo(lastUpdated.toISOString())}
            </span>
          )}
          <button
            type="button"
            onClick={() => { setLoading(true); void fetchAll(); }}
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
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* ── Error Banner ───────────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(248,81,73,0.1)',
            border: '1px solid rgba(248,81,73,0.2)',
            borderRadius: '10px',
            color: '#f85149',
            fontSize: '14px',
            marginBottom: '24px',
          }}
        >
          {error}
        </div>
      )}

      {/* ── Pickup Alert Banner ────────────────────────────────────────── */}
      {!loading && hasReadyOrder && (
        <div
          className="overview-fade"
          style={{
            padding: '16px 20px',
            borderRadius: '14px',
            background: 'rgba(63,185,80,0.08)',
            border: '1px solid rgba(63,185,80,0.3)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            animation: 'fadeIn 0.3s ease both',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(63,185,80,0.15)',
                border: '2px solid rgba(63,185,80,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                animation: 'pulse-glow 2s ease-in-out infinite',
              }}
            >
              🔔
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#3fb950' }}>
                Your order is ready for pickup!
              </div>
              <div className="text-muted" style={{ fontSize: '13px', marginTop: '2px' }}>
                Head to the counter to collect your order.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onGoToOrders}
            style={{
              padding: '9px 20px',
              background: 'rgba(63,185,80,0.1)',
              border: '1px solid rgba(63,185,80,0.4)',
              borderRadius: '9px',
              color: '#3fb950',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              whiteSpace: 'nowrap',
            }}
          >
            View Order →
          </button>
        </div>
      )}

      {/* ── KPI Stat Cards ─────────────────────────────────────────────── */}
      <div
        className="overview-fade"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <StatCard
          icon="📋"
          label="Total Orders"
          value={stats ? stats.totalOrders.toString() : null}
          loading={loading && !stats}
          accent="#4d8ef0"
          subtext={
            stats
              ? `${stats.activeOrders} active · ${stats.completedOrders} completed`
              : undefined
          }
        />
        <StatCard
          icon="💸"
          label="Total Spent"
          value={stats ? fmt(stats.totalSpent) : null}
          loading={loading && !stats}
          accent="#FF6B35"
          subtext={
            stats && stats.completedOrders > 0
              ? `Avg ${fmt(stats.avgOrderValue)} / order`
              : 'No completed orders yet'
          }
        />
        <StatCard
          icon="📡"
          label="Active Orders"
          value={stats ? stats.activeOrders.toString() : null}
          loading={loading && !stats}
          accent={stats && stats.activeOrders > 0 ? '#d29922' : '#6e7681'}
          subtext={
            stats
              ? stats.activeOrders > 0
                ? 'Being prepared now'
                : 'No active orders'
              : undefined
          }
        />
        <StatCard
          icon="⭐"
          label="Favourite Item"
          value={stats?.favouriteItem ?? (loading ? null : 'N/A')}
          loading={loading && !stats}
          accent="#f7a429"
          subtext="Most ordered by you"
        />
      </div>

      {/* ── Quick Actions ──────────────────────────────────────────────── */}
      <div
        className="overview-fade"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '28px',
        }}
      >
        <Link to="/menu" style={{ textDecoration: 'none' }}>
          <div
            className="quick-card glass-card"
            style={{
              padding: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: '1px solid rgba(255,107,53,0.2)',
            }}
          >
            <span style={{ fontSize: '24px' }}>🍽️</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: '14px' }}>Browse Menu</p>
              <p className="text-muted" style={{ fontSize: '12px' }}>Order something delicious</p>
            </div>
          </div>
        </Link>

        <Link to="/cart" style={{ textDecoration: 'none' }}>
          <div
            className="quick-card glass-card"
            style={{
              padding: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border:
                totalItems > 0
                  ? '1px solid rgba(255,107,53,0.4)'
                  : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ position: 'relative', fontSize: '24px' }}>
              🛒
              {totalItems > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-8px',
                    background: '#FF6B35',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {totalItems}
                </span>
              )}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '14px' }}>My Cart</p>
              <p className="text-muted" style={{ fontSize: '12px' }}>
                {totalItems > 0
                  ? `${totalItems} item${totalItems !== 1 ? 's' : ''} ready`
                  : 'Cart is empty'}
              </p>
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={onGoToOrders}
          style={{ textAlign: 'left', background: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", padding: 0 }}
        >
          <div
            className="quick-card glass-card"
            style={{
              padding: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              transition: 'all 0.2s',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span style={{ fontSize: '24px' }}>📡</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>Track Orders</p>
              <p className="text-muted" style={{ fontSize: '12px' }}>Live order status</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={onGoToHistory}
          style={{ textAlign: 'left', background: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", padding: 0 }}
        >
          <div
            className="quick-card glass-card"
            style={{
              padding: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              transition: 'all 0.2s',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span style={{ fontSize: '24px' }}>🕐</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>Order History</p>
              <p className="text-muted" style={{ fontSize: '12px' }}>Past & cancelled orders</p>
            </div>
          </div>
        </button>
      </div>

      {/* ── Middle Row: Active Orders + Order Breakdown ────────────────── */}
      <div
        className="overview-fade"
        style={{
          display: 'grid',
          gridTemplateColumns: activeOrders.length > 0 ? '1fr 1fr' : '1fr',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        {/* Active Orders (only shown if any) */}
        {activeOrders.length > 0 && (
          <div className="glass-card" style={{ padding: '22px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px',
                gap: '8px',
              }}
            >
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>📡</span> Active Orders
                <span
                  style={{
                    background: 'rgba(210,153,34,0.15)',
                    color: '#d29922',
                    padding: '2px 8px',
                    borderRadius: '50px',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {activeOrders.length}
                </span>
              </h2>
              <button
                type="button"
                onClick={onGoToOrders}
                style={{
                  padding: '6px 12px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '7px',
                  color: '#A0A0A0',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  whiteSpace: 'nowrap',
                }}
              >
                View All →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeOrders.slice(0, 3).map((order) => (
                <ActiveOrderCard
                  key={order.id}
                  order={order}
                  onViewOrders={onGoToOrders}
                />
              ))}
              {activeOrders.length > 3 && (
                <button
                  type="button"
                  onClick={onGoToOrders}
                  style={{
                    padding: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px dashed rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: '#A0A0A0',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  +{activeOrders.length - 3} more orders →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Order Breakdown */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 700,
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>📊</span> Order Breakdown
          </h2>
          {loading && !stats ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
              <Spinner size={28} />
            </div>
          ) : stats ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(
                [
                  { label: 'Active', count: stats.activeOrders, status: 'RECEIVED' },
                  { label: 'Completed', count: stats.completedOrders, status: 'FINISHED' },
                  { label: 'Cancelled', count: stats.cancelledOrders, status: 'CANCELLED' },
                ] as const
              ).map(({ label, count, status }) => {
                const color = STATUS_COLORS[status] ?? '#A0A0A0';
                const bg = STATUS_BG[status] ?? 'rgba(160,160,160,0.1)';
                const icon = STATUS_ICONS[status] ?? '•';
                return (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: bg,
                      border: `1px solid ${color}33`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px' }}>{icon}</span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color }}>{label}</span>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: 700, color }}>{count}</span>
                  </div>
                );
              })}

              {stats.totalOrders > 0 && (
                <div
                  style={{
                    marginTop: '4px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <p className="text-muted" style={{ fontSize: '12px', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Completion Rate
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        flex: 1,
                        height: '8px',
                        borderRadius: '99px',
                        background: 'rgba(255,255,255,0.06)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%`,
                          borderRadius: '99px',
                          background: 'linear-gradient(90deg, #3fb950, #00C9A7)',
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#3fb950', flexShrink: 0 }}>
                      {stats.totalOrders > 0
                        ? `${Math.round((stats.completedOrders / stats.totalOrders) * 100)}%`
                        : '0%'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted" style={{ textAlign: 'center', padding: '32px 0', fontSize: '14px' }}>
              No order data yet.
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Order History ───────────────────────────────────────── */}
      <div className="glass-card overview-fade" style={{ padding: '22px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>🕐</span> Recent Activity
          </h2>
          <button
            type="button"
            onClick={onGoToHistory}
            style={{
              padding: '7px 14px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#A0A0A0',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            View Full History →
          </button>
        </div>

        {loading && historyOrders.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Spinner size={28} />
          </div>
        ) : recentHistory.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr
                  style={{
                    color: '#A0A0A0',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {['Order', 'Items', 'Total', 'Status', 'Date'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentHistory.map((order) => (
                  <tr
                    key={order.id}
                    className="history-row"
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      background: 'transparent',
                    }}
                    onClick={onGoToHistory}
                  >
                    <td
                      style={{
                        padding: '13px 14px',
                        fontFamily: 'monospace',
                        color: '#A0A0A0',
                        fontSize: '12px',
                      }}
                    >
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td style={{ padding: '13px 14px', color: '#A0A0A0' }}>
                      {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                    </td>
                    <td style={{ padding: '13px 14px', fontWeight: 700, color: '#FF6B35' }}>
                      {fmt(order.total_price)}
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <StatusBadge status={order.status} />
                    </td>
                    <td style={{ padding: '13px 14px', color: '#A0A0A0', fontSize: '13px' }}>
                      {timeAgo(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              padding: '48px 20px',
              color: '#A0A0A0',
            }}
          >
            <div style={{ fontSize: '36px' }}>🍽️</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>
              No orders yet — let's change that!
            </div>
            <div style={{ fontSize: '14px' }}>
              Browse the menu and place your first order.
            </div>
            <Link
              to="/menu"
              style={{
                marginTop: '8px',
                padding: '10px 24px',
                background: '#FF6B35',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              Browse Menu →
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CustomerOverviewPanel;
