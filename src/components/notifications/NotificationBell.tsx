import React, { useEffect, useRef, useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatTime = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const TYPE_ICONS: Record<string, string> = {
  ORDER_READY: '🍽️',
  REQUEST_DECISION: '📋',
};

// ── Component ─────────────────────────────────────────────────────────────────

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    listLoading,
    error,
    fetchAll,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (open) void fetchAll();
  }, [open, fetchAll]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* ── Bell button ─────────────────────────────────────────────────── */}
      <button
        type="button"
        aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: 'relative',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.1)',
          background: open ? 'rgba(255,107,53,0.1)' : 'rgba(255,255,255,0.04)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          transition: 'background 0.2s, border-color 0.2s',
          flexShrink: 0,
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              minWidth: '18px',
              height: '18px',
              borderRadius: '50px',
              background: '#f85149',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid #0a0a0a',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ────────────────────────────────────────────────────── */}
      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '360px',
            maxHeight: '480px',
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '14px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 500,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 700 }}>
              Notifications
              {unreadCount > 0 && (
                <span
                  style={{
                    marginLeft: '8px',
                    background: 'rgba(248,81,73,0.15)',
                    color: '#f85149',
                    borderRadius: '50px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FF6B35',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {listLoading && (
              <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: '3px solid rgba(255,107,53,0.2)',
                    borderTopColor: '#FF6B35',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {error && !listLoading && (
              <div style={{ padding: '20px', color: '#f85149', fontSize: '13px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            {!listLoading && !error && notifications.length === 0 && (
              <div
                style={{
                  padding: '40px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#6e7681',
                }}
              >
                <span style={{ fontSize: '28px' }}>🔕</span>
                <span style={{ fontSize: '14px' }}>No notifications yet</span>
              </div>
            )}

            {!listLoading &&
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    if (!n.is_read) void markAsRead(n.id);
                  }}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    background: n.is_read ? 'transparent' : 'rgba(255,107,53,0.05)',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    cursor: n.is_read ? 'default' : 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      flexShrink: 0,
                    }}
                  >
                    {TYPE_ICONS[n.type] ?? '🔔'}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '13px',
                        color: n.is_read ? '#A0A0A0' : '#fff',
                        lineHeight: '1.5',
                        margin: 0,
                        marginBottom: '4px',
                      }}
                    >
                      {n.message}
                    </p>
                    <span style={{ fontSize: '11px', color: '#6e7681' }}>
                      {formatTime(n.created_at)}
                    </span>
                  </div>

                  {/* Unread dot */}
                  {!n.is_read && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#FF6B35',
                        flexShrink: 0,
                        marginTop: '4px',
                      }}
                    />
                  )}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
