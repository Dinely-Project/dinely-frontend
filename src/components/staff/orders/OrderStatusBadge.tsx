import React from 'react';
import { STATUS_COLORS, STATUS_BG } from '../../../constants/colors';
import type { OrderStatus } from '../../../hooks/useOrders';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  RECEIVED: 'Received',
  PREPARING: 'Preparing',
  READY: 'Ready',
  FINISHED: 'Finished',
  CANCELLED: 'Cancelled',
};

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = 'md' }) => {
  const color = STATUS_COLORS[status] ?? '#6e7681';
  const bg = STATUS_BG[status] ?? 'rgba(110,118,129,0.12)';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: size === 'sm' ? '3px 10px' : '5px 14px',
        borderRadius: '50px',
        fontSize: size === 'sm' ? '11px' : '13px',
        fontWeight: 700,
        letterSpacing: '0.03em',
        color,
        background: bg,
        border: `1px solid ${color}33`,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: size === 'sm' ? '6px' : '7px',
          height: size === 'sm' ? '6px' : '7px',
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
};

export default OrderStatusBadge;
