import { create } from "zustand";
import type { Notification } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  page: number;

  fetchNotifications: (reset?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  reset: () => void;
}

function getToken(): string | null {
  return typeof window !== "undefined"
    ? localStorage.getItem("accessToken")
    : null;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  hasMore: true,
  page: 1,

  fetchNotifications: async (reset = false) => {
    const token = getToken();
    if (!token) return;

    const page = reset ? 1 : get().page;
    set({ isLoading: true });

    try {
      const res = await fetch(
        `${API_URL}/notifications?page=${page}&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return;

      const json = await res.json();
      const newNotifications: Notification[] = json.data;
      const hasMore = page < json.meta.totalPages;

      set((state) => ({
        notifications: reset
          ? newNotifications
          : [...state.notifications, ...newNotifications],
        unreadCount: json.unreadCount ?? state.unreadCount,
        hasMore,
        page: page + 1,
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const json = await res.json();
      set({ unreadCount: json.unreadCount });
    } catch {
      // silent
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: async (id) => {
    const token = getToken();
    if (!token) return;

    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {
      // silent
    }
  },

  markAllAsRead: async () => {
    const token = getToken();
    if (!token) return;

    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          isRead: true,
        })),
        unreadCount: 0,
      }));
    } catch {
      // silent
    }
  },

  reset: () => {
    set({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      hasMore: true,
      page: 1,
    });
  },
}));
