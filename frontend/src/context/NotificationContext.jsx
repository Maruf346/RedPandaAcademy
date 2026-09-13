import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api, getWsBase, loadTokens } from "../lib/api.js";
import { useAuth } from "./AuthContext.jsx";

const NotificationContext = createContext(null);

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [ready, setReady] = useState(false);
  const socketRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setReady(true);
      return;
    }

    const [listPayload, countPayload] = await Promise.all([
      api("/notifications/?page_size=20"),
      api("/notifications/unread-count/")
    ]);
    setNotifications(normalizeList(listPayload));
    setUnreadCount(Number(countPayload?.unread_count || 0));
    setReady(true);
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    refresh().catch(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    if (!user) return undefined;
    const token = loadTokens()?.access;
    if (!token) return undefined;

    const socket = new WebSocket(`${getWsBase()}/ws/notifications/?token=${encodeURIComponent(token)}`);
    socketRef.current = socket;

    socket.addEventListener("message", (event) => {
      let message = null;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }

      if (message.type === "unread_count") {
        setUnreadCount(Number(message.count || 0));
      }
      if (message.type === "notification") {
        setNotifications((items) => [
          {
            id: message.notification_id,
            notification_type: message.notification_type,
            title: message.title,
            body: message.body,
            data: message.data || {},
            priority: message.priority || "normal",
            is_read: false,
            created_at: message.created_at
          },
          ...items
        ].slice(0, 20));
      }
    });

    return () => {
      socket.close();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [user]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    ready,
    refresh,
    async markRead(id) {
      const updated = await api(`/notifications/${id}/mark-read/`, { method: "POST" });
      setNotifications((items) => items.map((item) => item.id === id ? updated : item));
      setUnreadCount((count) => Math.max(0, count - 1));
      return updated;
    },
    async markAllRead() {
      await api("/notifications/mark-all-read/", { method: "POST" });
      setNotifications((items) => items.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    },
    async clearRead() {
      await api("/notifications/clear-read/", { method: "DELETE" });
      setNotifications((items) => items.filter((item) => !item.is_read));
    }
  }), [notifications, ready, refresh, unreadCount]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const value = useContext(NotificationContext);
  if (!value) throw new Error("useNotifications must be used inside NotificationProvider");
  return value;
}
