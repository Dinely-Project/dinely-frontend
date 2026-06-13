import { useCallback, useEffect, useState, type CSSProperties, type FC } from 'react';
import api from '../../api/axios';
import { getApiErrorMessage } from '../../api/errors';
import { STATUS_COLORS } from '../../constants/colors';

type AnalyticsPeriod = 'today' | 'week' | 'month' | 'year';

interface TopItem {
  name: string;
  total_sold?: number;
  totalSold?: number;
}

interface CategoryRevenue {
  category?: string;
  name?: string;
  revenue?: number;
  total_revenue?: number;
}

interface StaffActivity {
  name: string;
  orders_handled?: number;
  ordersHandled?: number;
}

interface AnalyticsSummary {
  totalRevenue?: number;
  total_revenue?: number;
  totalOrders?: number;
  total_orders?: number;
  totalCustomers?: number;
  total_customers?: number;
  averageOrderValue?: number;
  average_order_value?: number;
  topItems?: TopItem[];
  top_items?: TopItem[];
  revenueByCategory?: CategoryRevenue[];
  revenue_by_category?: CategoryRevenue[];
  staffActivity?: StaffActivity[];
  staff_activity?: StaffActivity[];
  ordersByStatus?: Record<string, number>;
  orders_by_status?: Record<string, number>;
}

interface AnalyticsResponse extends AnalyticsSummary {
  data?: AnalyticsSummary | null;
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  color: string;
}

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

const cellStyle: CSSProperties = {
  padding: '14px 16px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  verticalAlign: 'middle',
};

const errorBoxStyle: CSSProperties = {
  color: '#FF4C6A',
  background: 'rgba(255,76,106,0.1)',
  border: '1px solid rgba(255,76,106,0.2)',
  borderRadius: '10px',
  padding: '14px 16px',
  marginBottom: '18px',
};

const badgeStyle = (color: string): CSSProperties => ({
  background: `${color}22`,
  color,
  border: `1px solid ${color}55`,
  borderRadius: '999px',
  padding: '4px 10px',
  fontSize: '12px',
  fontWeight: 700,
  display: 'inline-flex',
});

const tabButtonStyle = (active: boolean): CSSProperties => ({
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

const formatCurrency = (value: number, loading: boolean): string => {
  if (loading) {
    return '—';
  }

  return `LKR ${value.toLocaleString()}`;
};

const formatNumber = (value: number, loading: boolean): string => {
  if (loading) {
    return '—';
  }

  return value.toLocaleString();
};

const StatCard: FC<StatCardProps> = ({ icon, label, value, color }) => (
  <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div
      style={{
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color,
        fontSize: '13px',
        fontWeight: 700,
      }}
    >
      {icon}
    </div>
    <div>
      <div className="text-muted" style={{ fontSize: '14px', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 700 }}>{value}</div>
    </div>
  </div>
);

const AnalyticsPanel: FC = () => {
  const [period, setPeriod] = useState<AnalyticsPeriod>('month');
  const [data, setData] = useState<AnalyticsSummary>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<AnalyticsResponse>('/api/admin/analytics', {
        params: { period },
      });
      setData(response.data?.data ?? response.data ?? {});
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load analytics. Please try again.'));
      setData({});
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchAnalytics();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchAnalytics]);

  const totalRevenue = data.totalRevenue ?? data.total_revenue ?? 0;
  const totalOrders = data.totalOrders ?? data.total_orders ?? 0;
  const averageOrderValue = data.averageOrderValue ?? data.average_order_value ?? 0;
  const totalCustomers = data.totalCustomers ?? data.total_customers ?? 0;
  const topItems = data.topItems ?? data.top_items ?? [];
  const revenueByCategory = data.revenueByCategory ?? data.revenue_by_category ?? [];
  const staffActivity = data.staffActivity ?? data.staff_activity ?? [];
  const ordersByStatus = data.ordersByStatus ?? data.orders_by_status ?? {};
  const statusEntries = Object.entries(ordersByStatus);

  return (
    <section>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Analytics Dashboard</h1>
        <p className="text-muted" style={{ fontSize: '16px' }}>
          Restaurant performance and activity at a glance.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {PERIOD_OPTIONS.map((option) => {
          const isActive = period === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              style={tabButtonStyle(isActive)}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {error && <div style={errorBoxStyle}>{error}</div>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        <StatCard
          icon="REV"
          label="Total Revenue"
          value={formatCurrency(totalRevenue, loading)}
          color="#FF6B35"
        />
        <StatCard
          icon="ORD"
          label="Total Orders"
          value={formatNumber(totalOrders, loading)}
          color="#4d8ef0"
        />
        <StatCard
          icon="AVG"
          label="Avg Order Value"
          value={formatCurrency(averageOrderValue, loading)}
          color="#00C9A7"
        />
        <StatCard
          icon="CUS"
          label="Total Customers"
          value={formatNumber(totalCustomers, loading)}
          color="#a259f7"
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '32px' }}>
        {statusEntries.length > 0 ? (
          statusEntries.map(([status, count]) => (
            <span key={status} style={badgeStyle(STATUS_COLORS[status] ?? '#A0A0A0')}>
              {status}: {count}
            </span>
          ))
        ) : (
          <span className="text-muted" style={{ fontSize: '14px' }}>No order status data yet.</span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Top Selling Items</h2>
          {topItems.length > 0 ? (
            topItems.map((item, index) => {
              const totalSold = item.totalSold ?? item.total_sold ?? 0;

              return (
                <div
                  key={`${item.name}-${index}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    paddingBottom: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="text-muted" style={{ fontSize: '13px', width: '20px' }}>
                      #{index + 1}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{item.name}</span>
                  </div>
                  <span className="text-muted" style={{ fontSize: '13px' }}>
                    {totalSold.toLocaleString()} sold
                  </span>
                </div>
              );
            })
          ) : (
            <div className="text-muted" style={{ textAlign: 'center', padding: '24px 0', fontSize: '14px' }}>
              No data yet.
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Revenue by Category</h2>
          {revenueByCategory.length > 0 ? (
            revenueByCategory.map((item, index) => {
              const categoryName = item.category ?? item.name ?? 'Uncategorized';
              const revenue = item.revenue ?? item.total_revenue ?? 0;

              return (
                <div
                  key={`${categoryName}-${index}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    paddingBottom: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{categoryName}</span>
                  <span style={{ color: '#FF6B35', fontSize: '14px', fontWeight: 700 }}>
                    LKR {revenue.toLocaleString()}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="text-muted" style={{ textAlign: 'center', padding: '24px 0', fontSize: '14px' }}>
              No data yet.
            </div>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Staff Activity</h2>
        {staffActivity.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ fontSize: '13px', color: '#A0A0A0', textAlign: 'left' }}>
                <th style={cellStyle}>Staff Member</th>
                <th style={cellStyle}>Orders Handled</th>
              </tr>
            </thead>
            <tbody>
              {staffActivity.map((staff) => {
                const ordersHandled = staff.ordersHandled ?? staff.orders_handled ?? 0;

                return (
                  <tr key={staff.name}>
                    <td style={cellStyle}>
                      <span style={{ fontWeight: 600 }}>{staff.name}</span>
                    </td>
                    <td style={{ ...cellStyle, color: '#A0A0A0' }}>{ordersHandled.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-muted" style={{ textAlign: 'center', padding: '40px 20px' }}>
            No staff activity yet.
          </div>
        )}
      </div>
    </section>
  );
};

export default AnalyticsPanel;
