import React, { useEffect, useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import type { CustomerOrder } from '../../../hooks/useCustomerOrders';

interface OrderReadyBannerProps {
  readyOrders: CustomerOrder[];
}

const formatPrice = (price: number) =>
  `LKR ${Number.isFinite(price) ? price.toLocaleString() : '—'}`;

/**
 * Animated "Your order is ready!" banner.
 * Pulses the green border to attract attention.
 * Shows once per ready order — dismissed per-order via local state.
 */
const OrderReadyBanner: React.FC<OrderReadyBannerProps> = ({ readyOrders }) => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = readyOrders.filter((o) => !dismissed.has(o.id));

  // Re-add order if it becomes ready again (edge case: status reverted)
  useEffect(() => {
    if (readyOrders.length > 0) {
      setDismissed((prev) => {
        const next = new Set(prev);
        // Only keep dismissed IDs that are still in readyOrders
        // (clean up stale dismissed entries)
        for (const id of next) {
          if (!readyOrders.find((o) => o.id === id)) next.delete(id);
        }
        return next;
      });
    }
  }, [readyOrders]);

  if (visible.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
      <style>{`
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(63,185,80,0.4); }
          50%        { box-shadow: 0 0 0 8px rgba(63,185,80,0); }
        }
      `}</style>

      {visible.map((order) => {
        const shortId = order.id.slice(0, 8).toUpperCase();

        return (
          <div
            key={order.id}
            role="alert"
            style={{
              padding: '20px 24px',
              background: 'rgba(63,185,80,0.08)',
              border: '1px solid rgba(63,185,80,0.4)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              animation: 'pulse-border 2s ease-in-out infinite',
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'rgba(63,185,80,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                flexShrink: 0,
              }}
            >
              <UtensilsCrossed size={20} />
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#3fb950',
                  margin: '0 0 4px',
                }}
              >
                Your order is ready for pickup!
              </p>
              <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>
                Order #{shortId} · {order.item_count} {order.item_count === 1 ? 'item' : 'items'} ·{' '}
                {formatPrice(order.total_price)}
              </p>
            </div>

            {/* Dismiss */}
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setDismissed((prev) => new Set([...prev, order.id]))}
              style={{
                background: 'none',
                border: 'none',
                color: '#6e7681',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px',
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default OrderReadyBanner;
