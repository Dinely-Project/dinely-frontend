import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../../api/axios';
import { getApiErrorMessage } from '../../../api/errors';
import { STATUS_COLORS, STATUS_BG } from '../../../constants/colors';
import type { OrderSummary } from '../../../hooks/useOrders';

// ── Types ─────────────────────────────────────────────────────────────────────

interface OverviewStats {
  totalOrders: number;
  totalRevenue: number;
  menuItemCount: number;
  hotItemName: string | null;
  receivedCount: number;
  preparingCount: number;
  readyCount: number;
  finishedToday: number;
  cancelledToday: number;
  avgOrderValue: number;
}

interface TopItem {
  name: string;
  total_sold?: number;
  totalSold?: number;
}


// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) => `LKR ${n.toLocaleString()}`;
const fmtNum = (n: number) => n.toLocaleString();

const timeAgo = (iso: string): string => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Received',
  PREPARING: 'Preparing',
  READY: 'Ready',
  FINISHED: 'Finished',
  CANCELLED: 'Cancelled',
};

// ── Sub-components ────────────────────────────────────────────────────────────

const Spinner: React.FC = () => (
  <div
    style={{
      width: 20,
      height: 20,
      borderRadius: '50%',
      border: '2px solid rgba(255,107,53,0.2)',
      borderTopColor: '#FF6B35',
      animation: 'spin 0.8s linear infinite',
      display: 'inline-block',
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

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, loading, accent = '#FF6B35', subtext }) => (
  <div
    className="glass-card"
    style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}
  >
    <div
      style={{
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        background: `${accent}18`,
        border: `1px solid ${accent}33`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '24px',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="text-muted" style={{ fontSize: '13px', marginBottom: '4px', fontWeight: 500 }}>
        {label}
      </div>
      {loading ? (
        <div style={{ marginTop: '6px' }}><Spinner /></div>
      ) : (
        <>
          <div style={{ fontSize: '26px', fontWeight: 700, lineHeight: 1.1, color: '#fff' }}>
            {value ?? '—'}
          </div>
          {subtext && (
            <div className="text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>{subtext}</div>
          )}
        </>
      )}
    </div>
  </div>
);

interface StatusPillProps {
  status: string;
  count: number;
}

const StatusPill: React.FC<StatusPillProps> = ({ status, count }) => {
  const color = STATUS_COLORS[status] ?? '#A0A0A0';
  const bg = STATUS_BG[status] ?? 'rgba(160,160,160,0.1)';
  return (
    <div
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
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
        <span style={{ fontSize: '14px', fontWeight: 600, color }}>{STATUS_LABELS[status] ?? status}</span>
      </div>
      <span style={{ fontSize: '20px', fontWeight: 700, color }}>{count}</span>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

interface StaffOverviewPanelProps {
  userName?: string;
  onGoToOrders: () => void;
}

const POLL_MS = 30_000;

const StaffOverviewPanel: React.FC<StaffOverviewPanelProps> = ({ userName, onGoToOrders }) => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [ordersRes, analyticsRes, menuItemsRes] = await Promise.all([
        api.get('/api/orders'),
        api.get('/api/admin/analytics', { params: { period: 'today' } }),
        api.get('/api/menu/items', { params: { is_available: 'true' } }),
      ]);

      // ── Parse recent orders (staff queue) ──────────────────────────
      const rawOrders: unknown = ordersRes.data;
      let orderList: OrderSummary[] = [];
      if (Array.isArray(rawOrders)) orderList = rawOrders as OrderSummary[];
      else if (rawOrders && typeof rawOrders === 'object') {
        const p = rawOrders as Record<string, unknown>;
        if (Array.isArray(p.data)) orderList = p.data as OrderSummary[];
        else if (Array.isArray(p.orders)) orderList = p.orders as OrderSummary[];
      }

      // Sort most-recent first for the activity list
      const sorted = [...orderList].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setRecentOrders(sorted.slice(0, 6));

      // ── Parse analytics ───────────────────────────────────────────
      const rawRes = analyticsRes.data as Record<string, unknown>;
      const rawAnalytics = (rawRes?.data ?? rawRes ?? {}) as Record<string, unknown>;
      
      const orders = (rawAnalytics.orders ?? {}) as Record<string, unknown>;
      const revenue = (rawAnalytics.revenue ?? {}) as Record<string, unknown>;
      const items = (rawAnalytics.top_items ?? []) as TopItem[];

      const totalOrders = (orders.total as number) ?? 0;
      const totalRevenue = (revenue.total as number) ?? 0;
      const avgOV = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      const ordersByStatus = (orders.by_status as Record<string, number>) ?? {};
      
      // ── Parse menu items ──────────────────────────────────────────
      let menuItemCount = 0;
      const rawMenu: unknown = menuItemsRes.data;
      if (Array.isArray(rawMenu)) menuItemCount = rawMenu.length;
      else if (rawMenu && typeof rawMenu === 'object') {
        const p = rawMenu as Record<string, unknown>;
        if (Array.isArray(p.data)) menuItemCount = p.data.length;
        else if (Array.isArray(p.items)) menuItemCount = p.items.length;
      }

      // ── Build stats object ────────────────────────────────────────
      setTopItems(items.slice(0, 5));

      setStats({
        totalOrders,
        totalRevenue,
        menuItemCount,
        hotItemName: items.length > 0 ? items[0].name : null,
        receivedCount: ordersByStatus['RECEIVED'] || 0,
        preparingCount: ordersByStatus['PREPARING'] || 0,
        readyCount: ordersByStatus['READY'] || 0,
        finishedToday: ordersByStatus['FINISHED'] || 0,
        cancelledToday: ordersByStatus['CANCELLED'] || 0,
        avgOrderValue: avgOV,
      });

      setLastUpdated(new Date());
      setError(null);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load overview data.'));
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

  const activeCount = (stats?.receivedCount ?? 0) + (stats?.preparingCount ?? 0) + (stats?.readyCount ?? 0);

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .overview-fade { animation: fadeIn 0.35s ease both; }
        .order-row:hover { background: rgba(255,255,255,0.04) !important; }
        .go-to-orders-btn:hover { background: rgba(255,107,53,0.18) !important; border-color: #FF6B35 !important; color: #FF6B35 !important; }
      `}</style>

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 700, marginBottom: '6px' }}>
            Welcome back, {userName || 'Staff'} 👋
          </h1>
          <p className="text-muted" style={{ fontSize: '15px' }}>
            Here's what's happening at the restaurant today.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              transition: 'border-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* ── Error banner ──────────────────────────────────────────────── */}
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

      {/* ── KPI cards ─────────────────────────────────────────────────── */}
      <div
        className="overview-fade"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        <StatCard
          icon="📋"
          label="Today's Orders"
          value={stats ? fmtNum(stats.totalOrders) : null}
          loading={loading && !stats}
          accent="#4d8ef0"
          subtext={stats ? `${stats.cancelledToday} cancelled` : undefined}
        />
        <StatCard
          icon="💰"
          label="Today's Revenue"
          value={stats ? fmt(stats.totalRevenue) : null}
          loading={loading && !stats}
          accent="#FF6B35"
          subtext={stats && stats.totalOrders > 0 ? `Avg ${fmt(stats.avgOrderValue)} / order` : undefined}
        />
        <StatCard
          icon="📦"
          label="Menu Items"
          value={stats ? fmtNum(stats.menuItemCount) : null}
          loading={loading && !stats}
          accent="#00C9A7"
          subtext="Active items on menu"
        />
        <StatCard
          icon="🔥"
          label="Today's Hot Item"
          value={stats?.hotItemName ?? (loading ? null : 'N/A')}
          loading={loading && !stats}
          accent="#f7a429"
          subtext="Most ordered today"
        />
      </div>

      {/* ── Active queue alert ────────────────────────────────────────── */}
      {!loading && activeCount > 0 && (
        <div
          className="overview-fade"
          style={{
            padding: '16px 20px',
            borderRadius: '14px',
            background: 'rgba(255,107,53,0.08)',
            border: '1px solid rgba(255,107,53,0.25)',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '22px' }}>🍽️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#FF6B35' }}>
                {activeCount} active order{activeCount !== 1 ? 's' : ''} in the kitchen queue
              </div>
              <div className="text-muted" style={{ fontSize: '13px', marginTop: '2px' }}>
                {stats?.receivedCount ?? 0} received · {stats?.preparingCount ?? 0} preparing · {stats?.readyCount ?? 0} ready for pickup
              </div>
            </div>
          </div>
          <button
            type="button"
            className="go-to-orders-btn"
            onClick={onGoToOrders}
            style={{
              padding: '9px 20px',
              background: 'rgba(255,107,53,0.1)',
              border: '1px solid rgba(255,107,53,0.4)',
              borderRadius: '9px',
              color: '#FF8C5A',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            Manage Orders →
          </button>
        </div>
      )}

      {/* ── Middle row: order status breakdown + top items ────────────── */}
      <div
        className="overview-fade"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}
      >
        {/* Order status breakdown */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📊</span> Order Status Breakdown
          </h2>
          {loading && !stats ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}><Spinner /></div>
          ) : stats ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { status: 'RECEIVED', count: stats.receivedCount },
                { status: 'PREPARING', count: stats.preparingCount },
                { status: 'READY', count: stats.readyCount },
                { status: 'FINISHED', count: stats.finishedToday },
                { status: 'CANCELLED', count: stats.cancelledToday },
              ].map(({ status, count }) => (
                <StatusPill key={status} status={status} count={count} />
              ))}
            </div>
          ) : (
            <div className="text-muted" style={{ textAlign: 'center', padding: '32px 0', fontSize: '14px' }}>
              No data available.
            </div>
          )}
        </div>

        {/* Top selling items */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏆</span> Top Selling Items Today
          </h2>
          {loading && !stats ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}><Spinner /></div>
          ) : topItems.length > 0 ? (
            <div>
              {topItems.map((item, index) => {
                const sold = item.totalSold ?? item.total_sold ?? 0;
                const maxSold = (topItems[0]?.totalSold ?? topItems[0]?.total_sold ?? 1) || 1;
                const pct = Math.round((sold / maxSold) * 100);
                const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                return (
                  <div key={`${item.name}-${index}`} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>{MEDALS[index] ?? `${index + 1}.`}</span>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{item.name}</span>
                      </div>
                      <span className="text-muted" style={{ fontSize: '13px' }}>
                        {sold} sold
                      </span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          borderRadius: '99px',
                          background: index === 0
                            ? 'linear-gradient(90deg, #FF6B35, #f7a429)'
                            : 'rgba(255,107,53,0.45)',
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-muted" style={{ textAlign: 'center', padding: '32px 0', fontSize: '14px' }}>
              No sales data yet today.
            </div>
          )}
        </div>
      </div>

      {/* ── Recent orders activity ─────────────────────────────────────── */}
      <div className="glass-card overview-fade" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🕐</span> Recent Orders
          </h2>
          <button
            type="button"
            onClick={onGoToOrders}
            style={{
              padding: '7px 16px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
              color: '#A0A0A0',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.2s',
            }}
          >
            View All Orders →
          </button>
        </div>

        {loading && recentOrders.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner /></div>
        ) : recentOrders.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ color: '#A0A0A0', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Time'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const color = STATUS_COLORS[order.status] ?? '#A0A0A0';
                  return (
                    <tr
                      key={order.id}
                      className="order-row"
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        background: 'transparent',
                      }}
                      onClick={onGoToOrders}
                    >
                      <td style={{ padding: '13px 14px', fontFamily: 'monospace', color: '#A0A0A0', fontSize: '12px' }}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td style={{ padding: '13px 14px', fontWeight: 600 }}>{order.customer_name}</td>
                      <td style={{ padding: '13px 14px', color: '#A0A0A0' }}>{order.item_count} item{order.item_count !== 1 ? 's' : ''}</td>
                      <td style={{ padding: '13px 14px', fontWeight: 700, color: '#FF6B35' }}>
                        LKR {Number.isFinite(order.total_price) ? order.total_price.toLocaleString() : '—'}
                      </td>
                      <td style={{ padding: '13px 14px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '99px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color,
                            background: `${color}18`,
                            border: `1px solid ${color}33`,
                          }}
                        >
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>
                      <td style={{ padding: '13px 14px', color: '#A0A0A0', fontSize: '13px' }}>
                        {timeAgo(order.created_at)}
                      </td>
                    </tr>
                  );
                })}
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
            <div style={{ fontSize: '36px' }}>🎉</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>No orders yet today</div>
            <div style={{ fontSize: '14px' }}>New orders will appear here automatically.</div>
          </div>
        )}
      </div>
    </>
  );
};

export default StaffOverviewPanel;
