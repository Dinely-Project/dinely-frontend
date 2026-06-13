import { useCallback, useEffect, useState, type CSSProperties, type FC } from 'react';
import api from '../../api/axios';
import { getApiErrorMessage } from '../../api/errors';
import { STATUS_COLORS } from '../../constants/colors';
import ReportGenerator from './ReportGenerator';

type AnalyticsPeriod = 'today' | 'week' | 'month' | 'year';

interface DailyRevenue {
  date: string;
  revenue: number;
  order_count: number;
}

interface TopItem {
  menu_item_id: string;
  name: string;
  total_quantity_sold: number;
  total_revenue: number;
}

interface RevenueByCategoryItem {
  category_id: string;
  category_name: string;
  total_revenue: number;
  order_count: number;
}

interface AnalyticsData {
  period: { from: string; to: string };
  revenue: {
    total: number;
    daily_average: number;
    by_day: DailyRevenue[];
  };
  orders: {
    total: number;
    by_status: Record<string, number>;
    completion_rate: number;
  };
  top_items: TopItem[];
  customers: {
    total_registered: number;
    new_in_period: number;
    active_in_period: number;
  };
  employees: {
    total: number;
    by_role: Record<string, number>;
  };
  revenue_by_category: RevenueByCategoryItem[];
}

interface AnalyticsResponse {
  data: AnalyticsData | null;
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
    return 'â€”';
  }

  return `LKR ${value.toLocaleString()}`;
};

const formatNumber = (value: number, loading: boolean): string => {
  if (loading) {
    return 'â€”';
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
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<AnalyticsResponse>('/api/admin/analytics', {
        params: { period },
      });
      setData(response.data?.data ?? null);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load analytics. Please try again.'));
      setData(null);
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

  const totalRevenue = data?.revenue?.total ?? 0;
  const dailyAverage = data?.revenue?.daily_average ?? 0;
  const byDay = data?.revenue?.by_day ?? [];
  const totalOrders = data?.orders?.total ?? 0;
  const completionRate = data?.orders?.completion_rate ?? 0;
  const ordersByStatus = data?.orders?.by_status ?? {};
  const topItems = data?.top_items ?? [];
  const revenueByCategory = data?.revenue_by_category ?? [];
  const totalCustomers = data?.customers?.total_registered ?? 0;
  const newCustomers = data?.customers?.new_in_period ?? 0;
  const activeCustomers = data?.customers?.active_in_period ?? 0;
  const totalEmployees = data?.employees?.total ?? 0;
  const employeesByRole = data?.employees?.by_role ?? {};
  const statusEntries = Object.entries(ordersByStatus);
  const periodFrom = data?.period?.from
    ? new Date(data.period.from).toLocaleDateString('en-US', { dateStyle: 'medium' })
    : '';
  const periodTo = data?.period?.to
    ? new Date(data.period.to).toLocaleDateString('en-US', { dateStyle: 'medium' })
    : '';

  const handlePrint = () => {
    window.print();
  };

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Sales Report</h1>
          <p className="text-muted" style={{ fontSize: '16px' }}>
            Detailed restaurant performance and sales analytics.
          </p>
          {periodFrom && periodTo && (
            <p className="text-muted" style={{ fontSize: '13px', marginTop: '4px' }}>
              Period: {periodFrom} - {periodTo}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="btn-ghost"
          style={{ padding: '10px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          Export / Print
        </button>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <StatCard icon="REV" label="Total Revenue" value={formatCurrency(totalRevenue, loading)} color="#FF6B35" />
        <StatCard icon="ORD" label="Total Orders" value={formatNumber(totalOrders, loading)} color="#4d8ef0" />
        <StatCard icon="AVG" label="Daily Average" value={formatCurrency(dailyAverage, loading)} color="#00C9A7" />
        <StatCard icon="CUS" label="Total Customers" value={formatNumber(totalCustomers, loading)} color="#a259f7" />
      </div>

      {!loading && data && (
        <div
          className="glass-card"
          style={{ padding: '20px 24px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '32px' }}
        >
          <div>
            <div className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Completion Rate</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#00C9A7' }}>{completionRate.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>New Customers</div>
            <div style={{ fontSize: '22px', fontWeight: 700 }}>{newCustomers}</div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Active Customers</div>
            <div style={{ fontSize: '22px', fontWeight: 700 }}>{activeCustomers}</div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Total Employees</div>
            <div style={{ fontSize: '22px', fontWeight: 700 }}>{totalEmployees}</div>
          </div>
        </div>
      )}

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

      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Daily Revenue Breakdown</h2>
        {byDay.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ fontSize: '13px', color: '#A0A0A0', textAlign: 'left' }}>
                <th style={cellStyle}>Date</th>
                <th style={cellStyle}>Orders</th>
                <th style={cellStyle}>Revenue</th>
                <th style={cellStyle}>Avg per Order</th>
              </tr>
            </thead>
            <tbody>
              {byDay.map((day) => (
                <tr key={day.date}>
                  <td style={cellStyle}>
                    {new Date(day.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </td>
                  <td style={{ ...cellStyle, color: '#A0A0A0' }}>{day.order_count}</td>
                  <td style={{ ...cellStyle, color: '#FF6B35', fontWeight: 600 }}>
                    LKR {day.revenue.toLocaleString()}
                  </td>
                  <td style={{ ...cellStyle, color: '#A0A0A0' }}>
                    LKR {day.order_count > 0 ? Math.round(day.revenue / day.order_count).toLocaleString() : '0'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 700 }}>
                <td style={{ ...cellStyle, color: '#A0A0A0', fontSize: '13px' }}>Total</td>
                <td style={cellStyle}>{totalOrders}</td>
                <td style={{ ...cellStyle, color: '#FF6B35' }}>LKR {totalRevenue.toLocaleString()}</td>
                <td style={{ ...cellStyle, color: '#A0A0A0' }}>
                  LKR {totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString() : '0'}
                </td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <div className="text-muted" style={{ textAlign: 'center', padding: '24px 0', fontSize: '14px' }}>
            No daily data yet.
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Top Selling Items</h2>
          {topItems.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ fontSize: '13px', color: '#A0A0A0', textAlign: 'left' }}>
                  <th style={cellStyle}>#</th>
                  <th style={cellStyle}>Item</th>
                  <th style={cellStyle}>Qty Sold</th>
                  <th style={cellStyle}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item, index) => (
                  <tr key={item.menu_item_id}>
                    <td style={{ ...cellStyle, color: '#A0A0A0', fontSize: '13px' }}>#{index + 1}</td>
                    <td style={{ ...cellStyle, fontWeight: 600 }}>{item.name}</td>
                    <td style={{ ...cellStyle, color: '#A0A0A0' }}>{item.total_quantity_sold.toLocaleString()}</td>
                    <td style={{ ...cellStyle, color: '#FF6B35', fontWeight: 600 }}>
                      LKR {item.total_revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-muted" style={{ textAlign: 'center', padding: '24px 0', fontSize: '14px' }}>
              No data yet.
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Revenue by Category</h2>
          {revenueByCategory.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ fontSize: '13px', color: '#A0A0A0', textAlign: 'left' }}>
                  <th style={cellStyle}>Category</th>
                  <th style={cellStyle}>Orders</th>
                  <th style={cellStyle}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {revenueByCategory.map((item) => (
                  <tr key={item.category_id}>
                    <td style={{ ...cellStyle, fontWeight: 600 }}>{item.category_name}</td>
                    <td style={{ ...cellStyle, color: '#A0A0A0' }}>{item.order_count}</td>
                    <td style={{ ...cellStyle, color: '#FF6B35', fontWeight: 600 }}>
                      LKR {item.total_revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-muted" style={{ textAlign: 'center', padding: '24px 0', fontSize: '14px' }}>
              No data yet.
            </div>
          )}
        </div>
      </div>

      {!loading && data && Object.keys(employeesByRole).length > 0 && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Employee Headcount by Role</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {Object.entries(employeesByRole).map(([role, count]) => (
              <div
                key={role}
                className="glass-card"
                style={{
                  padding: '16px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: '120px',
                }}
              >
                <div className="text-muted" style={{ fontSize: '12px', fontWeight: 600 }}>{role}</div>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>{count}</div>
              </div>
            ))}
            <div
              className="glass-card"
              style={{
                padding: '16px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                minWidth: '120px',
                border: '1px solid rgba(255,107,53,0.2)',
              }}
            >
              <div className="text-muted" style={{ fontSize: '12px', fontWeight: 600 }}>TOTAL</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#FF6B35' }}>{totalEmployees}</div>
            </div>
          </div>
        </div>
      )}

      <ReportGenerator data={data} period={period} />
    </section>
  );
};

export default AnalyticsPanel;
