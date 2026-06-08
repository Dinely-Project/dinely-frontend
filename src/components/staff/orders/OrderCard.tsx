import React, { useState } from 'react';
import type { OrderSummary, OrderStatus } from '../../../hooks/useOrders';
import { STATUS_COLORS, STATUS_BG } from '../../../constants/colors';
import OrderStatusBadge from './OrderStatusBadge';
import OrderActionButtons from './OrderActionButtons';
import ElapsedTime from './ElapsedTime';
import { downloadInvoice } from '../../../services/invoice.api';
import { getApiErrorMessage } from '../../../api/errors';

interface OrderCardProps {
  order: OrderSummary;
  onUpdate: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  onNavigate: (orderId: string) => void;
  onError: (msg: string) => void;
}

const formatPrice = (price: number) =>
  `LKR ${Number.isFinite(price) ? price.toLocaleString() : '—'}`;

const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdate, onNavigate, onError }) => {
  const borderColor = STATUS_COLORS[order.status] ?? '#6e7681';
  const bgColor = STATUS_BG[order.status] ?? 'rgba(110,118,129,0.06)';
  const shortId = order.id.slice(0, 8).toUpperCase();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      const { blob, invoiceNumber } = await downloadInvoice(order.id);
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
      onError(getApiErrorMessage(err, 'Failed to download invoice.'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${borderColor}33`,
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: '12px',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* ── Row 1: ID / name / elapsed / badge ───────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
        {/* Order ID avatar */}
        <div
          style={{
            minWidth: '44px',
            height: '44px',
            borderRadius: '10px',
            background: bgColor,
            border: `1px solid ${borderColor}33`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1.1,
          }}
        >
          <span style={{ fontSize: '9px', color: '#6e7681', fontWeight: 600, letterSpacing: '0.05em' }}>
            ORD
          </span>
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: 700 }}>
            #{shortId.slice(0, 6)}
          </span>
        </div>

        {/* Customer + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span
              style={{ fontSize: '15px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {order.customer_name}
            </span>
            <OrderStatusBadge status={order.status} size="sm" />
            {order.status === 'FINISHED' && (
              <span style={{ fontSize: '11px', background: 'rgba(0,201,167,0.1)', color: '#00C9A7', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                Invoice Available
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="text-muted" style={{ fontSize: '13px' }}>
              {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#FF6B35' }}>
              {formatPrice(order.total_price)}
            </span>
            <ElapsedTime createdAt={order.created_at} />
          </div>
        </div>
      </div>

      {/* ── Row 2: Notes (if present) ────────────────────────────────────── */}
      {order.notes && (
        <div
          style={{
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#A0A0A0',
            fontStyle: 'italic',
          }}
        >
          "{order.notes}"
        </div>
      )}

      {/* ── Row 3: Action buttons + View detail link ──────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <OrderActionButtons
          orderId={order.id}
          customerName={order.customer_name}
          status={order.status}
          onUpdate={onUpdate}
          onError={onError}
          compact
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {order.status === 'FINISHED' && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="btn-ghost"
              style={{ fontSize: '12px', padding: '4px 12px' }}
            >
              {isDownloading ? 'Generating...' : '📄 Download Invoice'}
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate(order.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#A0A0A0',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '4px 0',
              transition: 'color 0.15s',
              fontFamily: "'Inter', sans-serif",
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
