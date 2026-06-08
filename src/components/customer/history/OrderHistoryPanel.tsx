import React, { useState } from 'react';
import { useOrderHistory } from '../../../hooks/useCustomerOrders';
import { STATUS_COLORS, STATUS_BG } from '../../../constants/colors';
import type { CustomerOrderStatus } from '../../../hooks/useCustomerOrders';
import { downloadInvoice } from '../../../services/invoice.api';
import { getApiErrorMessage } from '../../../api/errors';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatPrice = (price: number) =>
  `LKR ${Number.isFinite(price) ? price.toLocaleString() : '—'}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// ── Spinner ───────────────────────────────────────────────────────────────────

const Spinner: React.FC = () => (
  <div className="flex justify-center py-12">
    <div className="w-10 h-10 rounded-full border-[3px] border-[rgba(255,107,53,0.2)] border-t-[#FF6B35] animate-spin" />
  </div>
);

// ── Status badge ──────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: CustomerOrderStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
  <span
    style={{
      padding: '4px 12px',
      borderRadius: '50px',
      fontSize: '12px',
      fontWeight: 700,
      background: STATUS_BG[status] ?? 'rgba(255,255,255,0.05)',
      color: STATUS_COLORS[status] ?? '#A0A0A0',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}
  >
    {status}
  </span>
);

// ── OrderHistoryPanel ─────────────────────────────────────────────────────────

const OrderHistoryPanel: React.FC = () => {
  const { history, loading, error, refetch } = useOrderHistory();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloadingInvoiceOrderId, setDownloadingInvoiceOrderId] = useState<string | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDownloadInvoice = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setDownloadingInvoiceOrderId(orderId);
    setInvoiceError(null);
    try {
      const { blob, invoiceNumber } = await downloadInvoice(orderId);
      const url = window.URL.createObjectURL(blob);
      
      // 1. Open in new tab
      window.open(url, '_blank');

      // 2. Trigger automatic download
      const link = document.createElement('a');
      link.href = url;
      link.download = `DINELY-INVOICE-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up object URL after a short delay so the new tab has time to render
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (err: unknown) {
      setInvoiceError(getApiErrorMessage(err, 'Failed to download invoice.'));
    } finally {
      setDownloadingInvoiceOrderId(null);
    }
  };

  return (
    <section>
      {/* Header */}
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
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
            Order History
          </h1>
          <p className="text-muted" style={{ fontSize: '15px' }}>
            Your completed and cancelled orders.
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

      {/* Loading */}
      {loading && <Spinner />}

      {/* Error */}
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

      {/* Invoice Error */}
      {invoiceError && (
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
          {invoiceError}
        </div>
      )}

      {/* Empty state */}
      {!loading && history.length === 0 && (
        <div
          className="glass-card"
          style={{
            padding: '60px 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '40px' }}>📋</span>
          <p style={{ fontSize: '16px', fontWeight: 600 }}>No past orders yet.</p>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Once you've completed an order it will appear here.
          </p>
        </div>
      )}

      {/* History list */}
      {!loading && history.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.map((order) => {
            const shortId = order.id.slice(0, 8).toUpperCase();
            const isExpanded = expandedId === order.id;

            return (
              <div
                key={order.id}
                className="glass-card"
                style={{
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                }}
              >
                {/* Row */}
                <button
                  type="button"
                  onClick={() => toggleExpand(order.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px 24px',
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    textAlign: 'left',
                  }}
                >
                  {/* Order info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <p style={{ fontSize: '15px', fontWeight: 700 }}>
                        Order #{shortId}
                      </p>
                      {order.status === 'FINISHED' && (
                        <span style={{ fontSize: '11px', background: 'rgba(0,201,167,0.1)', color: '#00C9A7', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          Invoice Available
                        </span>
                      )}
                    </div>
                    <p className="text-muted" style={{ fontSize: '13px' }}>
                      {formatDate(order.created_at)} · {order.item_count}{' '}
                      {order.item_count === 1 ? 'item' : 'items'}
                    </p>
                  </div>

                  {/* Total */}
                  <span style={{ fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>
                    {formatPrice(order.total_price)}
                  </span>

                  {/* Status badge */}
                  <StatusBadge status={order.status} />

                  {/* Chevron */}
                  <span
                    style={{
                      color: '#A0A0A0',
                      fontSize: '14px',
                      transform: isExpanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                      flexShrink: 0,
                    }}
                  >
                    ▾
                  </span>
                </button>

                {/* Expanded breakdown */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      padding: '16px 24px 20px',
                      background: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#6e7681',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: '12px',
                      }}
                    >
                      Items
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '14px',
                          }}
                        >
                          <span>
                            {item.name}{' '}
                            <span className="text-muted">×{item.quantity}</span>
                          </span>
                          <span className="text-muted">{formatPrice(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                    {order.notes && (
                      <p
                        style={{
                          marginTop: '14px',
                          padding: '10px 14px',
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#A0A0A0',
                          fontStyle: 'italic',
                        }}
                      >
                        "{order.notes}"
                      </p>
                    )}

                    {order.status === 'FINISHED' && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <button
                          type="button"
                          onClick={(e) => handleDownloadInvoice(e, order.id)}
                          disabled={downloadingInvoiceOrderId === order.id}
                          className="btn-ghost"
                          style={{ fontSize: '13px', padding: '8px 16px' }}
                        >
                          {downloadingInvoiceOrderId === order.id ? 'Generating PDF...' : '📄 Download Invoice'}
                        </button>
                      </div>
                    )}
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

export default OrderHistoryPanel;
