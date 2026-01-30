"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (!isInitialized || !isAuthenticated) {
      disconnectNotificationSocket();
      useNotificationStore.getState().reset();
      return;
    }

    connectNotificationSocket();
    useNotificationStore.getState().fetchUnreadCount();

    const socket = getNotificationSocket();

    const handleConnect = () => {
      console.log("[Notification] 소켓 연결 성공");
      useNotificationStore.getState().fetchUnreadCount();
    };

    const handleConnectError = (err: Error) => {
      console.warn("[Notification] 소켓 연결 실패:", err.message);
    };

    const handleNewNotification = (notification: Notification) => {
      useNotificationStore.getState().addNotification(notification);
      showToast(notification.title, notification.content || "");
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("newNotification", handleNewNotification);
      disconnectNotificationSocket();
    };
  }, [isAuthenticated, isInitialized]);

  return <>{children}</>;
}
