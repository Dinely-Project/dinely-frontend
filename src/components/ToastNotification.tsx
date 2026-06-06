import React, { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastNotificationProps {
  message: string;
  type?: ToastType;
  /** Duration in ms before auto-dismiss. Default: 3500 */
  duration?: number;
  onClose: () => void;
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'i',
};

const COLORS: Record<ToastType, { border: string; bg: string; icon: string; text: string }> = {
  success: {
    border: 'rgba(0, 201, 167, 0.4)',
    bg: 'rgba(0, 201, 167, 0.12)',
    icon: '#00C9A7',
    text: '#fff',
  },
  error: {
    border: 'rgba(255, 76, 106, 0.4)',
    bg: 'rgba(255, 76, 106, 0.12)',
    icon: '#FF4C6A',
    text: '#fff',
  },
  info: {
    border: 'rgba(255, 107, 53, 0.4)',
    bg: 'rgba(255, 107, 53, 0.12)',
    icon: '#FF6B35',
    text: '#fff',
  },
};

const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  type = 'success',
  duration = 3500,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);
  const colors = COLORS[type];

  // Animate in
  useEffect(() => {
    const showTimer = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(showTimer);
  }, []);

  // Auto-dismiss
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      // Allow fade-out animation before unmounting
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        background: colors.bg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        color: colors.text,
        fontSize: '14px',
        fontWeight: 500,
        maxWidth: '360px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        fontFamily: "'Inter', sans-serif",
      }}
      role="status"
      aria-live="polite"
    >
      <span
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: colors.icon,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {ICONS[type]}
      </span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.5)',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '0',
          lineHeight: 1,
          flexShrink: 0,
        }}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
};

export default ToastNotification;
