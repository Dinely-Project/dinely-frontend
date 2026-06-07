import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import { getApiErrorMessage } from '../api/errors';

// ── Types ────────────────────────────────────────────────────────────────────

export type NotificationType = 'ORDER_READY' | 'REQUEST_DECISION' | string;

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  message: string;
  is_read: boolean;
  reference_id: string | null;
  created_at: string;
}

interface NotificationsApiResponse {
  data?: {
    notifications?: Notification[];
    unread_count?: number;
  };
}

// ── Normalise ────────────────────────────────────────────────────────────────

const normalizeResponse = (
  payload: unknown,
): { notifications: Notification[]; unread_count: number } => {
  if (payload && typeof payload === 'object') {
    const p = payload as NotificationsApiResponse;
    if (p.data && typeof p.data === 'object') {
      return {
        notifications: Array.isArray(p.data.notifications) ? p.data.notifications : [],
        unread_count: typeof p.data.unread_count === 'number' ? p.data.unread_count : 0,
      };
    }
  }
  return { notifications: [], unread_count: 0 };
};

// ── useNotifications ─────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 30_000;

/**
 * Polls GET /api/notifications?is_read=false every 30 s for the unread badge
 * count. When the bell is opened, fetches the full list. Exposes mark-one and
 * mark-all actions.
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Poll unread count ──────────────────────────────────────────────────────
  const pollUnread = useCallback(async () => {
    try {
      const res = await api.get('/api/notifications', { params: { is_read: 'false' } });
      const { unread_count } = normalizeResponse(res.data);
      setUnreadCount(unread_count);
    } catch {
      // Silent — badge failure should not disrupt the rest of the UI
    }
  }, []);

  useEffect(() => {
    void pollUnread();
    intervalRef.current = setInterval(() => void pollUnread(), POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pollUnread]);

  // ── Fetch full list (called when bell opens) ───────────────────────────────
  const fetchAll = useCallback(async () => {
    setListLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/notifications');
      const { notifications: list, unread_count } = normalizeResponse(res.data);
      setNotifications(list);
      setUnreadCount(unread_count);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load notifications.'));
    } finally {
      setListLoading(false);
    }
  }, []);

  // ── Mark one as read ───────────────────────────────────────────────────────
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await api.patch(`/api/notifications/${notificationId}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Silent — UX already reflects the intent
      }
    },
    [],
  );

  // ── Mark all as read ───────────────────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to mark all as read.'));
    }
  }, []);

  return {
    notifications,
    unreadCount,
    listLoading,
    error,
    fetchAll,
    markAsRead,
    markAllAsRead,
  };
};
