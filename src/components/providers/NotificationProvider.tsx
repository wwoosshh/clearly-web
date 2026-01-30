"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
  getNotificationSocket,
} from "@/lib/notificationSocket";
import { showToast } from "@/components/ui/Toast";
import type { Notification } from "@/types";

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const { addNotification, fetchUnreadCount, reset } =
    useNotificationStore();
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!isInitialized) return;

    if (isAuthenticated) {
      if (connectedRef.current) return;
      connectedRef.current = true;

      connectNotificationSocket();
      fetchUnreadCount();

      const socket = getNotificationSocket();

      const handleNewNotification = (notification: Notification) => {
        addNotification(notification);
        showToast(notification.title, notification.content || "");
      };

      socket.on("newNotification", handleNewNotification);

      return () => {
        socket.off("newNotification", handleNewNotification);
      };
    } else {
      if (connectedRef.current) {
        connectedRef.current = false;
        disconnectNotificationSocket();
        reset();
      }
    }
  }, [isAuthenticated, isInitialized, addNotification, fetchUnreadCount, reset]);

  return <>{children}</>;
}
