import { Fragment, useMemo, useState, type CSSProperties, type FC } from 'react';
import api from '../../api/axios';
import { getApiErrorMessage } from '../../api/errors';
import { STATUS_COLORS } from '../../constants/colors';
import { useAdminOrders, type AdminOrder, type OrderStatus } from '../../hooks/useAdminOrders';

const PAGE_SIZE = 20;
const STATUS_FILTERS: Array<OrderStatus | ''> = [
  '',
  'RECEIVED',
  'PREPARING',
  'READY',
  'FINISHED',
  'CANCELLED',
];

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const cellStyle: CSSProperties = {
  padding: '14px 16px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  verticalAlign: 'middle',
};

const formatDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return dateFormatter.format(date);
};

interface AdminOrderDetailPayload {
  items?: AdminOrder['items'];
  notes?: AdminOrder['notes'];
}

interface AdminOrderDetailResponse extends AdminOrderDetailPayload {
  data?: AdminOrderDetailPayload | null;
}

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: '3px solid rgba(255,107,53,0.2)',
        borderTopColor: '#FF6B35',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const AdminOrdersPanel: FC = () => {
  const { orders, loading, error } = useAdminOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortKey, setSortKey] = useState<'created_at' | 'total_price'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [expandedOrderData, setExpandedOrderData] = useState<Record<string, AdminOrder>>({});
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...orders];

    if (statusFilter) {
      result = result.filter((order) => order.status === statusFilter);
    }

    if (fromDate) {
      const from = new Date(`${fromDate}T00:00:00Z`).getTime();
      result = result.filter((order) => new Date(order.created_at).getTime() >= from);
    }

    if (toDate) {
      const to = new Date(`${toDate}T23:59:59Z`).getTime();
      result = result.filter((order) => new Date(order.created_at).getTime() <= to);
    }

    result.sort((a, b) => {
      const aVal = sortKey === 'total_price' ? a.total_price : new Date(a.created_at).getTime();
      const bVal = sortKey === 'total_price' ? b.total_price : new Date(b.created_at).getTime();

      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [fromDate, orders, sortDir, sortKey, statusFilter, toDate]);

  const total = filtered.length;
  const paginated = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const showingFrom = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE + paginated.length, total);

  const handleStatusChange = (status: OrderStatus | '') => {
    setStatusFilter(status);
    setPage(0);
    setExpandedOrderId(null);
  };

  const handleFromChange = (value: string) => {
    setFromDate(value);
    setPage(0);
    setExpandedOrderId(null);
  };

  const handleToChange = (value: string) => {
    setToDate(value);
    setPage(0);
    setExpandedOrderId(null);
  };

  const handleSort = (key: 'created_at' | 'total_price') => {
    if (sortKey === key) {
      setSortDir((currentDirection) => (currentDirection === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }

    setPage(0);
    setExpandedOrderId(null);
  };

  const handleView = async (order: AdminOrder) => {
    if (expandedOrderId === order.id) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(order.id);

    if (expandedOrderData[order.id]) {
      return;
    }

    setLoadingDetail(order.id);

    try {
      const response = await api.get<AdminOrderDetailResponse>(`/api/admin/orders/${order.id}`);
      const raw = response.data.data ?? response.data;
      setExpandedOrderData((prev) => ({
        ...prev,
        [order.id]: {
          ...order,
          items: raw.items ?? [],
          notes: raw.notes ?? order.notes,
        },
      }));
    } catch (err: unknown) {
      getApiErrorMessage(err, 'Failed to load order item details.');
      setExpandedOrderData((prev) => ({
        ...prev,
        [order.id]: { ...order, items: [] },
      }));
    } finally {
      setLoadingDetail(null);
    }
  };

  const sortArrow = (key: 'created_at' | 'total_price') => {
    if (sortKey !== key) {
      return <span style={{ color: '#A0A0A0', marginLeft: '4px' }}>↕</span>;
    }

    return <span style={{ color: '#FF6B35', marginLeft: '4px' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <section>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>All Orders</h1>
        <p className="text-muted" style={{ fontSize: '16px' }}>Full order history across the restaurant.</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {STATUS_FILTERS.map((status) => {
          const active = statusFilter === status;

          return (
            <button
              key={status || 'ALL'}
              type="button"
              onClick={() => handleStatusChange(status)}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: active ? 'rgba(255,107,53,0.1)' : 'transparent',
                color: active ? '#FF6B35' : '#A0A0A0',
                cursor: 'pointer',
                fontWeight: active ? 600 : 500,
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
              }}
            >
              {status || 'All'}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#A0A0A0' }}>
          From
          <input
            className="input-field"
            type="text"
            placeholder="YYYY-MM-DD"
            value={fromDate}
            style={{ width: 'auto', minWidth: '140px' }}
            onChange={(event) => handleFromChange(event.target.value)}
          />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#A0A0A0' }}>
          To
          <input
            className="input-field"
            type="text"
            placeholder="YYYY-MM-DD"
            value={toDate}
            style={{ width: 'auto', minWidth: '140px' }}
            onChange={(event) => handleToChange(event.target.value)}
          />
        </label>

        {(fromDate || toDate || statusFilter) && (
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => {
              setStatusFilter('');
              setFromDate('');
              setToDate('');
              setPage(0);
              setExpandedOrderId(null);
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {error && (
        <div
          style={{
            color: '#FF4C6A',
            background: 'rgba(255,76,106,0.1)',
            border: '1px solid rgba(255,76,106,0.2)',
            borderRadius: '10px',
            padding: '14px 16px',
            marginBottom: '18px',
          }}
        >
          {error}
        </div>
      )}

      {loading && <LoadingSpinner />}

      {!loading && !error && (
        <>
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '980px' }}>
                <thead>
                  <tr style={{ color: '#A0A0A0', textAlign: 'left', fontSize: '13px' }}>
                    <th style={cellStyle}>Order ID</th>
                    <th style={cellStyle}>Customer</th>
                    <th style={cellStyle}>Status</th>
                    <th style={cellStyle}>Items</th>
                    <th
                      style={{ ...cellStyle, cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('total_price')}
                    >
                      Total {sortArrow('total_price')}
                    </th>
                    <th
                      style={{ ...cellStyle, cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('created_at')}
                    >
                      Placed At {sortArrow('created_at')}
                    </th>
                    <th style={cellStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((order) => {
                    const isExpanded = expandedOrderId === order.id;
                    const statusColor = STATUS_COLORS[order.status] ?? '#A0A0A0';
                    const detailItems = expandedOrderData[order.id]?.items ?? [];

                    return (
                      <Fragment key={order.id}>
                        <tr>
                          <td
                            style={{
                              ...cellStyle,
                              fontFamily: 'DM Mono, monospace',
                              fontSize: '13px',
                              color: '#A0A0A0',
                            }}
                          >
                            {order.id.slice(0, 8)}
                          </td>
                          <td style={cellStyle}>
                            {order.customer ? (
                              <>
                                <div style={{ fontWeight: 600 }}>{order.customer.name}</div>
                                <div style={{ fontSize: '13px', color: '#A0A0A0' }}>{order.customer.email}</div>
                              </>
                            ) : (
                              <span style={{ color: '#A0A0A0' }}>Guest</span>
                            )}
                          </td>
                          <td style={cellStyle}>
                            <span
                              style={{
                                background: `${statusColor}22`,
                                color: statusColor,
                                border: `1px solid ${statusColor}55`,
                                borderRadius: '999px',
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: 700,
                                display: 'inline-flex',
                              }}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td style={{ ...cellStyle, fontSize: '14px', color: '#A0A0A0' }}>
                            {order.item_count ?? order.items.length}{' '}
                            {(order.item_count ?? order.items.length) === 1 ? 'item' : 'items'}
                          </td>
                          <td style={{ ...cellStyle, color: '#FF6B35', fontWeight: 600 }}>
                            LKR {order.total_price.toLocaleString()}
                          </td>
                          <td style={{ ...cellStyle, fontSize: '13px', color: '#A0A0A0' }}>
                            {formatDate(order.created_at)}
                          </td>
                          <td style={cellStyle}>
                            <button
                              type="button"
                              className="btn-ghost"
                              onClick={() => {
                                void handleView(order);
                              }}
                              style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '8px' }}
                            >
                              {isExpanded ? 'Hide' : 'View'}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={7} style={cellStyle}>
                              <div
                                style={{
                                  background: 'rgba(255,255,255,0.03)',
                                  borderRadius: '12px',
                                  padding: '20px',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '24px',
                                    marginBottom: '16px',
                                  }}
                                >
                                  <div>
                                    <div style={{ fontSize: '13px', color: '#A0A0A0', marginBottom: '6px' }}>
                                      Staff
                                    </div>
                                    {order.staff ? (
                                      <>
                                        <div style={{ fontWeight: 600 }}>{order.staff.name}</div>
                                        <div style={{ fontSize: '13px', color: '#A0A0A0' }}>{order.staff.email}</div>
                                      </>
                                    ) : (
                                      <div style={{ color: '#A0A0A0' }}>Unassigned</div>
                                    )}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '13px', color: '#A0A0A0', marginBottom: '6px' }}>
                                      Notes
                                    </div>
                                    <div style={{ fontSize: '14px' }}>
                                      {(expandedOrderData[order.id]?.notes ?? order.notes) ?? '—'}
                                    </div>
                                  </div>
                                </div>

                                {loadingDetail === order.id ? (
                                  <div style={{ color: '#A0A0A0', fontSize: '13px' }}>Loading items...</div>
                                ) : (
                                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                    <thead>
                                      <tr style={{ textAlign: 'left', color: '#A0A0A0' }}>
                                        <th style={{ padding: '8px 16px 8px 0' }}>Item</th>
                                        <th style={{ padding: '8px 16px 8px 0' }}>Qty</th>
                                        <th style={{ padding: '8px 16px 8px 0' }}>Unit Price</th>
                                        <th style={{ padding: '8px 0' }}>Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {detailItems.length === 0 ? (
                                        <tr>
                                          <td colSpan={4} style={{ color: '#A0A0A0', padding: '12px 0' }}>
                                            No item details available.
                                          </td>
                                        </tr>
                                      ) : (
                                        detailItems.map((item) => (
                                          <tr key={item.menu_item_id}>
                                            <td style={{ padding: '8px 16px 8px 0', fontWeight: 600 }}>
                                              {item.name}
                                            </td>
                                            <td style={{ padding: '8px 16px 8px 0', color: '#A0A0A0' }}>
                                              {item.quantity}
                                            </td>
                                            <td style={{ padding: '8px 16px 8px 0', color: '#A0A0A0' }}>
                                              LKR {item.unit_price.toLocaleString()}
                                            </td>
                                            <td style={{ padding: '8px 0', color: '#FF6B35' }}>
                                              LKR {item.subtotal.toLocaleString()}
                                            </td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>

              {paginated.length === 0 && (
                <div className="text-muted" style={{ textAlign: 'center', padding: '40px 20px' }}>
                  No orders found.
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginTop: '20px',
            }}
          >
            <div style={{ fontSize: '14px', color: '#A0A0A0' }}>
              Showing {showingFrom}-{showingTo} of {total} orders
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setPage((currentPage) => currentPage - 1);
                  setExpandedOrderId(null);
                }}
                disabled={page === 0}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  opacity: page === 0 ? 0.4 : 1,
                  cursor: page === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setPage((currentPage) => currentPage + 1);
                  setExpandedOrderId(null);
                }}
                disabled={page >= totalPages - 1}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  opacity: page >= totalPages - 1 ? 0.4 : 1,
                  cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default AdminOrdersPanel;
