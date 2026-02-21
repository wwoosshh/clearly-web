import { create } from "zustand";
import type { Notification } from "@/types";
import api from "@/lib/api";
import { unwrapNotificationResponse, unwrapResponse } from "@/lib/apiHelpers";

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

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  hasMore: true,
  page: 1,

  fetchNotifications: async (reset = false) => {
    const { isLoading } = get();
    if (isLoading) return;

    const page = reset ? 1 : get().page;
    set({ isLoading: true });

    try {
      const response = await api.get("/notifications", {
        params: { page, limit: 20 },
      });

      const { data: newNotifications, meta, unreadCount } =
        unwrapNotificationResponse<Notification>(response);
      const totalPages = meta?.totalPages ?? 1;
      const hasMore = page < totalPages;

      set((state) => ({
        notifications: reset
          ? newNotifications
          : [...state.notifications, ...newNotifications],
        unreadCount: unreadCount ?? state.unreadCount,
        hasMore,
        page: page + 1,
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      const result = unwrapResponse<{ unreadCount: number }>(response);
      const count = result?.unreadCount ?? 0;
      set({ unreadCount: typeof count === "number" ? count : 0 });
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
    try {
      await api.patch(`/notifications/${id}/read`);

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
    try {
      await api.patch("/notifications/read-all");

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
