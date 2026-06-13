import { useState, type FC } from 'react';

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
  revenue: { total: number; daily_average: number; by_day: DailyRevenue[] };
  orders: { total: number; by_status: Record<string, number>; completion_rate: number };
  top_items: TopItem[];
  customers: { total_registered: number; new_in_period: number; active_in_period: number };
  employees: { total: number; by_role: Record<string, number> };
  revenue_by_category: RevenueByCategoryItem[];
}

interface ReportGeneratorProps {
  data: AnalyticsData | null;
  period: string;
}

const fmt = (value: number) => `LKR ${value.toLocaleString()}`;

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { dateStyle: 'long' });

const fmtShort = (iso: string) => new Date(iso).toLocaleDateString('en-US', { dateStyle: 'medium' });

const buildReport = (data: AnalyticsData, period: string): string => {
  const periodFrom = fmtDate(data.period.from);
  const periodTo = fmtDate(data.period.to);
  const generated = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });

  const cancelledOrders = data.orders.by_status.CANCELLED ?? 0;
  const finishedOrders = data.orders.by_status.FINISHED ?? 0;
  const cancellationRate = data.orders.total > 0 ? ((cancelledOrders / data.orders.total) * 100).toFixed(1) : '0.0';
  const avgOrderValue = data.orders.total > 0 ? Math.round(data.revenue.total / data.orders.total) : 0;

  const peakDay = [...data.revenue.by_day].sort((a, b) => b.revenue - a.revenue)[0];
  const quietDay = [...data.revenue.by_day].sort((a, b) => a.revenue - b.revenue)[0];

  const topItem = data.top_items[0];
  const topItemSharePct =
    data.revenue.total > 0 && topItem ? ((topItem.total_revenue / data.revenue.total) * 100).toFixed(1) : '0.0';

  const customerEngagementRate =
    data.customers.total_registered > 0
      ? ((data.customers.active_in_period / data.customers.total_registered) * 100).toFixed(1)
      : '0.0';

  const dailyRows = data.revenue.by_day
    .map(
      (day, index) => `
    <tr style="background:${index % 2 === 0 ? '#f9f9f9' : '#fff'}">
      <td style="padding:10px 14px;border:1px solid #e0e0e0">${fmtShort(day.date)}</td>
      <td style="padding:10px 14px;border:1px solid #e0e0e0;text-align:center">${day.order_count}</td>
      <td style="padding:10px 14px;border:1px solid #e0e0e0;text-align:right;color:#e85d26;font-weight:600">${fmt(day.revenue)}</td>
      <td style="padding:10px 14px;border:1px solid #e0e0e0;text-align:right">${day.order_count > 0 ? fmt(Math.round(day.revenue / day.order_count)) : '-'}</td>
    </tr>`,
    )
    .join('');

  const statusRows = Object.entries(data.orders.by_status)
    .map(([status, count]) => {
      const pct = data.orders.total > 0 ? ((count / data.orders.total) * 100).toFixed(1) : '0.0';
      const color = status === 'FINISHED' ? '#16a34a' : status === 'CANCELLED' ? '#dc2626' : '#1a1a2e';
      return `
    <tr>
      <td style="padding:10px 14px;border:1px solid #e0e0e0;font-weight:600;color:${color}">${status}</td>
      <td style="padding:10px 14px;border:1px solid #e0e0e0;text-align:center">${count}</td>
      <td style="padding:10px 14px;border:1px solid #e0e0e0;text-align:center">${pct}%</td>
    </tr>`;
    })
    .join('');

  const itemRows = data.top_items
    .map((item, index) => {
      const share = data.revenue.total > 0 ? ((item.total_revenue / data.revenue.total) * 100).toFixed(1) : '0.0';
      return `
    <tr style="background:${index % 2 === 0 ? '#f9f9f9' : '#fff'}">
      <td style="padding:10px 14px;border:1px solid #e0e0e0;text-align:center;font-weight:700;color:#e85d26">#${index + 1}</td>
      <td style="padding:10px 14px;border:1px solid #e0e0e0;font-weight:600">${item.name}</td>
      <td style="padding:10px 14px;border:1px solid #e0e0e0;text-align:center">${item.total_quantity_sold.toLocaleString()}</td>
      <td style="padding:10px 14px;border:1px solid #e0e0e0;text-align:right;color:#e85d26;font-weight:600">${fmt(item.total_revenue)}</td>
      <td style="padding:10px 14px;border:1px solid #e0e0e0;text-align:center">${share}%</td>
    </tr>`;
    })
    .join('');

  const categoryRows = data.revenue_by_category
    .map((category, index) => {
      const share = data.revenue.total > 0 ? ((category.total_revenue / data.revenue.total) * 100).toFixed(1) : '0.0';
      const avgPerOrder = category.order_count > 0 ? Math.round(category.total_revenue / category.order_count) : 0;
      return `
    <tr style="background:${index % 2 === 0 ? '#f9f9f9' : '#fff'}">
      <td style="padding:10px 14px;border:1px solid #e0e0e0;font-weight:600">${category.category_name}</td>
      <td style="padding:10px 14px;border:1px solid #e0e0e0;text-align:center">${category.order_count}</td>
      <td style="padding:10px 14px;border:1px solid #e0e0e0;text-align:right;color:#e85d26;font-weight:600">${fmt(category.total_revenue)}</td>
      <td style="padding:10px 14px;border:1px solid #e0e0e0;text-align:center">${share}%</td>
      <td style="padding:10px 14px;border:1px solid #e0e0e0;text-align:right">${fmt(avgPerOrder)}</td>
    </tr>`;
    })
    .join('');

  const employeeRows = Object.entries(data.employees.by_role)
    .map(([role, count]) => {
      const pct = data.employees.total > 0 ? ((count / data.employees.total) * 100).toFixed(1) : '0.0';
      return `
    <tr>
      <td style="padding:10px 14px;border:1px solid #e0e0e0;font-weight:600">${role}</td>
      <td style="padding:10px 14px;border:1px solid #e0e0e0;text-align:center">${count}</td>
      <td style="padding:10px 14px;border:1px solid #e0e0e0;text-align:center">${pct}%</td>
    </tr>`;
    })
    .join('');

  const insight = (text: string) => `<li style="margin-bottom:10px;padding-left:8px">${text}</li>`;
  const insights: string[] = [];

  if (data.orders.completion_rate >= 70) {
    insights.push(
      `Strong order completion rate of <strong>${data.orders.completion_rate.toFixed(1)}%</strong> indicates reliable kitchen and service operations.`,
    );
  } else {
    insights.push(
      `Order completion rate of <strong>${data.orders.completion_rate.toFixed(1)}%</strong> is below 70%; investigate root causes of the <strong>${cancelledOrders} cancelled orders</strong> (${cancellationRate}% cancellation rate) to identify operational bottlenecks.`,
    );
  }

  if (topItem) {
    insights.push(
      `<strong>${topItem.name}</strong> is the single highest-revenue item, contributing <strong>${topItemSharePct}%</strong> of total revenue. Ensure stock levels and preparation capacity are consistently maintained for this item.`,
    );
  }

  if (peakDay) {
    insights.push(
      `Peak revenue day was <strong>${fmtShort(peakDay.date)}</strong> with <strong>${fmt(peakDay.revenue)}</strong> across ${peakDay.order_count} orders. Analyse staffing and stock levels on this day as a benchmark for high-demand preparation.`,
    );
  }

  if (quietDay && peakDay && quietDay.date !== peakDay.date) {
    insights.push(
      `Lowest revenue day was <strong>${fmtShort(quietDay.date)}</strong> with <strong>${fmt(quietDay.revenue)}</strong>. Consider targeted promotions or limited-time offers on historically slow days to drive volume.`,
    );
  }

  if (data.customers.new_in_period < data.customers.active_in_period) {
    insights.push(
      `Customer retention is strong: <strong>${data.customers.active_in_period}</strong> customers placed orders this period versus <strong>${data.customers.new_in_period}</strong> new registrations, indicating repeat business is driving revenue.`,
    );
  } else {
    insights.push(
      `New customer acquisition (<strong>${data.customers.new_in_period}</strong> new registrations) is driving a significant portion of activity; invest in retention strategies such as loyalty offers to convert these customers into regulars.`,
    );
  }

  insights.push(
    `Daily revenue average of <strong>${fmt(Math.round(data.revenue.daily_average))}</strong> with an average order value of <strong>${fmt(avgOrderValue)}</strong>; consider upselling strategies such as combo deals or add-ons to increase the average order value above this baseline.`,
  );

  if (data.revenue_by_category.length > 1) {
    const topCategory = data.revenue_by_category[0];
    insights.push(
      `The <strong>${topCategory?.category_name}</strong> category dominates revenue. Diversify the menu within other categories to reduce revenue concentration risk and appeal to a broader customer base.`,
    );
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Dinely Sales Report - ${period} - ${periodFrom}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; color: #222; background: #fff; font-size: 14px; line-height: 1.6; }
  h1, h2, h3 { font-family: Georgia, serif; color: #1a1a2e; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th { background: #1a1a2e; color: #fff; padding: 10px 14px; text-align: left; font-size: 13px; letter-spacing: 0.3px; }
  th.right { text-align: right; }
  th.center { text-align: center; }
  .section { margin-bottom: 36px; }
  .metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 16px 0 24px; }
  .metric-box { border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px 20px; }
  .metric-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .metric-value { font-size: 24px; font-weight: 700; color: #1a1a2e; }
  .metric-value.accent { color: #e85d26; }
  .metric-value.green { color: #16a34a; }
  .metric-value.red { color: #dc2626; }
  @media print { body { font-size: 12px; } .no-print { display: none !important; } }
</style>
</head>
<body style="padding:40px 48px;max-width:1000px;margin:0 auto">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #e85d26;padding-bottom:20px;margin-bottom:32px">
    <div>
      <div style="font-size:28px;font-weight:700;color:#1a1a2e">Din<span style="color:#e85d26">ely</span></div>
      <div style="font-size:12px;color:#666;margin-top:2px">Restaurant Management System</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:22px;font-weight:700;font-family:Georgia,serif;color:#1a1a2e">Sales &amp; Operations Report</div>
      <div style="font-size:13px;color:#666;margin-top:4px">Period: ${periodFrom} - ${periodTo}</div>
      <div style="font-size:12px;color:#999;margin-top:2px">Report Type: ${period.charAt(0).toUpperCase() + period.slice(1)} | Generated: ${generated}</div>
    </div>
  </div>

  <div class="section">
    <h2 style="font-size:18px;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e0e0e0">1. Executive Summary</h2>
    <div class="metric-grid">
      <div class="metric-box">
        <div class="metric-label">Total Revenue</div>
        <div class="metric-value accent">${fmt(data.revenue.total)}</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Total Orders</div>
        <div class="metric-value">${data.orders.total}</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Completion Rate</div>
        <div class="metric-value ${data.orders.completion_rate >= 70 ? 'green' : 'red'}">${data.orders.completion_rate.toFixed(1)}%</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Avg Order Value</div>
        <div class="metric-value">${fmt(avgOrderValue)}</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Daily Avg Revenue</div>
        <div class="metric-value accent">${fmt(Math.round(data.revenue.daily_average))}</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Registered Customers</div>
        <div class="metric-value">${data.customers.total_registered}</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Active Customers</div>
        <div class="metric-value">${data.customers.active_in_period}</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Total Employees</div>
        <div class="metric-value">${data.employees.total}</div>
      </div>
    </div>
    <p style="color:#444;line-height:1.8">
      During the ${period} period from ${periodFrom} to ${periodTo}, Dinely generated total revenue of
      <strong style="color:#e85d26">${fmt(data.revenue.total)}</strong> across
      <strong>${data.orders.total} orders</strong>, averaging
      <strong>${fmt(avgOrderValue)}</strong> per order and
      <strong>${fmt(Math.round(data.revenue.daily_average))}</strong> per day.
      The restaurant achieved an order completion rate of
      <strong style="color:${data.orders.completion_rate >= 70 ? '#16a34a' : '#dc2626'}">${data.orders.completion_rate.toFixed(1)}%</strong>
      with <strong>${finishedOrders}</strong> completed and <strong>${cancelledOrders}</strong> cancelled orders.
      ${data.customers.active_in_period} of ${data.customers.total_registered} registered customers placed orders this period,
      representing a <strong>${customerEngagementRate}%</strong> engagement rate.
      The workforce consists of <strong>${data.employees.total} employees</strong> across
      ${Object.keys(data.employees.by_role).length} role${Object.keys(data.employees.by_role).length !== 1 ? 's' : ''}.
    </p>
  </div>

  <div class="section">
    <h2 style="font-size:18px;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e0e0e0">2. Revenue Analysis</h2>
    ${peakDay ? `<p style="margin-bottom:12px;color:#444">Peak revenue was recorded on <strong>${fmtShort(peakDay.date)}</strong> with <strong style="color:#e85d26">${fmt(peakDay.revenue)}</strong> from ${peakDay.order_count} orders (avg ${fmt(Math.round(peakDay.revenue / peakDay.order_count))} per order). ${quietDay && quietDay.date !== peakDay.date ? `The quietest day was <strong>${fmtShort(quietDay.date)}</strong> with <strong>${fmt(quietDay.revenue)}</strong> from ${quietDay.order_count} orders.` : ''}</p>` : ''}
    ${data.revenue.by_day.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th class="center">Orders</th>
          <th class="right">Revenue</th>
          <th class="right">Avg per Order</th>
        </tr>
      </thead>
      <tbody>${dailyRows}</tbody>
      <tfoot>
        <tr style="background:#1a1a2e;color:#fff;font-weight:700">
          <td style="padding:10px 14px;border:1px solid #333">TOTAL</td>
          <td style="padding:10px 14px;border:1px solid #333;text-align:center">${data.orders.total}</td>
          <td style="padding:10px 14px;border:1px solid #333;text-align:right;color:#e85d26">${fmt(data.revenue.total)}</td>
          <td style="padding:10px 14px;border:1px solid #333;text-align:right">${fmt(avgOrderValue)}</td>
        </tr>
      </tfoot>
    </table>` : '<p style="color:#999">No daily revenue data available for this period.</p>'}
  </div>

  <div class="section">
    <h2 style="font-size:18px;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e0e0e0">3. Order Performance</h2>
    <p style="margin-bottom:12px;color:#444">
      Out of <strong>${data.orders.total}</strong> total orders received,
      <strong style="color:#16a34a">${finishedOrders}</strong> were successfully completed and
      <strong style="color:#dc2626">${cancelledOrders}</strong> were cancelled, yielding a
      <strong style="color:${data.orders.completion_rate >= 70 ? '#16a34a' : '#dc2626'}">${data.orders.completion_rate.toFixed(1)}% completion rate</strong>
      and a <strong>${cancellationRate}% cancellation rate</strong>.
      ${Number(cancellationRate) > 30 ? 'The cancellation rate exceeds 30%, which warrants immediate investigation into order workflow, item availability, and kitchen capacity.' : 'The cancellation rate is within an acceptable operational range.'}
    </p>
    <table>
      <thead>
        <tr>
          <th>Order Status</th>
          <th class="center">Count</th>
          <th class="center">% of Total</th>
        </tr>
      </thead>
      <tbody>${statusRows}</tbody>
    </table>
  </div>

  <div class="section">
    <h2 style="font-size:18px;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e0e0e0">4. Product Performance</h2>
    ${topItem ? `<p style="margin-bottom:12px;color:#444"><strong>${topItem.name}</strong> leads all menu items with <strong>${topItem.total_quantity_sold}</strong> units sold generating <strong style="color:#e85d26">${fmt(topItem.total_revenue)}</strong>, accounting for <strong>${topItemSharePct}%</strong> of total revenue this period.</p>` : ''}
    ${data.top_items.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th class="center">Rank</th>
          <th>Item Name</th>
          <th class="center">Units Sold</th>
          <th class="right">Revenue</th>
          <th class="center">Revenue Share</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>` : '<p style="color:#999">No item sales data available for this period.</p>'}
  </div>

  <div class="section">
    <h2 style="font-size:18px;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e0e0e0">5. Revenue by Category</h2>
    ${data.revenue_by_category.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th class="center">Orders</th>
          <th class="right">Total Revenue</th>
          <th class="center">Revenue Share</th>
          <th class="right">Avg per Order</th>
        </tr>
      </thead>
      <tbody>${categoryRows}</tbody>
    </table>` : '<p style="color:#999">No category revenue data available for this period.</p>'}
  </div>

  <div class="section">
    <h2 style="font-size:18px;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e0e0e0">6. Customer Analysis</h2>
    <div class="metric-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="metric-box">
        <div class="metric-label">Total Registered</div>
        <div class="metric-value">${data.customers.total_registered}</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">New This Period</div>
        <div class="metric-value green">${data.customers.new_in_period}</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Active This Period</div>
        <div class="metric-value accent">${data.customers.active_in_period}</div>
      </div>
    </div>
    <p style="color:#444">
      Of <strong>${data.customers.total_registered}</strong> total registered customers,
      <strong>${data.customers.active_in_period}</strong> placed at least one order this period
      (<strong>${customerEngagementRate}%</strong> engagement rate).
      <strong>${data.customers.new_in_period}</strong> new customer${data.customers.new_in_period !== 1 ? 's' : ''} registered during this period.
      ${Number(customerEngagementRate) < 50 ? 'Engagement rate is below 50%; a targeted re-engagement campaign for inactive registered customers is recommended.' : 'Engagement rate is healthy, indicating strong repeat customer behaviour.'}
    </p>
  </div>

  <div class="section">
    <h2 style="font-size:18px;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e0e0e0">7. Workforce Overview</h2>
    <p style="margin-bottom:12px;color:#444">
      The restaurant operates with <strong>${data.employees.total}</strong> employees across
      <strong>${Object.keys(data.employees.by_role).length}</strong> role categories.
    </p>
    ${Object.keys(data.employees.by_role).length > 0 ? `
    <table style="max-width:400px">
      <thead>
        <tr>
          <th>Role</th>
          <th class="center">Headcount</th>
          <th class="center">% of Workforce</th>
        </tr>
      </thead>
      <tbody>${employeeRows}
        <tr style="background:#1a1a2e;color:#fff;font-weight:700">
          <td style="padding:10px 14px;border:1px solid #333">TOTAL</td>
          <td style="padding:10px 14px;border:1px solid #333;text-align:center">${data.employees.total}</td>
          <td style="padding:10px 14px;border:1px solid #333;text-align:center">100%</td>
        </tr>
      </tbody>
    </table>` : '<p style="color:#999">No workforce data available.</p>'}
  </div>

  <div class="section">
    <h2 style="font-size:18px;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e0e0e0">8. Key Insights &amp; Recommendations</h2>
    <ul style="color:#444;padding-left:20px;line-height:2">
      ${insights.map(insight).join('')}
    </ul>
  </div>

  <div style="border-top:1px solid #e0e0e0;padding-top:16px;margin-top:40px;display:flex;justify-content:space-between;color:#999;font-size:12px">
    <span>Dinely Restaurant Management System</span>
    <span>Generated: ${generated}</span>
  </div>
</body>
</html>`;
};

const ReportGenerator: FC<ReportGeneratorProps> = ({ data, period }) => {
  const [report, setReport] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!data) {
      return;
    }

    setReport(buildReport(data, period));
  };

  const handleDownload = () => {
    if (!report) {
      return;
    }

    const blob = new Blob([report], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `dinely-sales-report-${period}-${new Date().toISOString().slice(0, 10)}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ marginTop: '32px' }}>
      <div className="glass-card" style={{ padding: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: report ? '24px' : '0',
          }}
        >
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Generate Sales Report</h2>
            <p className="text-muted" style={{ fontSize: '14px' }}>
              Build a detailed, downloadable HTML report from the current analytics data.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
            {report && (
              <button
                type="button"
                onClick={handleDownload}
                className="btn-ghost"
                style={{ padding: '10px 20px', fontSize: '14px' }}
              >
                Download
              </button>
            )}
            <button
              type="button"
              onClick={handleGenerate}
              className="btn-primary"
              disabled={!data}
              style={{ padding: '10px 24px', fontSize: '14px', opacity: !data ? 0.6 : 1 }}
            >
              {report ? 'Regenerate' : 'Generate Report'}
            </button>
          </div>
        </div>

        {report && (
          <iframe
            srcDoc={report}
            style={{
              width: '100%',
              height: '800px',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              background: '#fff',
            }}
            title="Sales Report"
          />
        )}
      </div>
    </div>
  );
};

export default ReportGenerator;
