"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "@/stores/notification.store";
import type { NotificationType } from "@/types";

const TYPE_ICONS: Record<NotificationType, string> = {
  ESTIMATE_SUBMITTED: "📩",
  ESTIMATE_ACCEPTED: "✅",
  ESTIMATE_REJECTED: "❌",
  NEW_ESTIMATE_REQUEST: "📋",
  NEW_MESSAGE: "💬",
  NEW_REVIEW: "⭐",
  POINT_CHANGE: "💰",
  MATCHING_REQUEST: "🔔",
  MATCHING_ACCEPTED: "✅",
  MATCHING_REJECTED: "❌",
  SUBSCRIPTION: "📢",
  SYSTEM: "🔔",
};

function getNotificationLink(
  type: NotificationType,
  data?: Record<string, any>
): string | null {
  switch (type) {
    case "ESTIMATE_SUBMITTED":
      return "/matching";
    case "ESTIMATE_ACCEPTED":
      return data?.chatRoomId ? `/chat?roomId=${data.chatRoomId}` : "/chat";
    case "ESTIMATE_REJECTED":
      return "/estimates/submitted";
    case "NEW_ESTIMATE_REQUEST":
      return "/estimates";
    case "NEW_MESSAGE":
      return data?.roomId ? `/chat?roomId=${data.roomId}` : "/chat";
    case "NEW_REVIEW":
      return data?.companyId ? `/companies/${data.companyId}` : null;
    default:
      return null;
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR");
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      fetchNotifications(true);
    }
  };

  const handleNotificationClick = (notification: {
    id: string;
    type: NotificationType;
    data?: Record<string, any>;
    isRead: boolean;
  }) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    const link = getNotificationLink(notification.type, notification.data);
    if (link) {
      router.push(link);
    }
    setIsOpen(false);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchNotifications();
    }
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={handleToggle}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100"
        aria-label="알림"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed left-4 right-4 top-[68px] sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-[380px] rounded-xl border border-gray-200 bg-white shadow-lg shadow-gray-200/50 overflow-hidden z-[60]">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">알림</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                모두 읽음
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <p className="mt-2 text-sm">알림이 없습니다</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                      !notification.isRead ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <span className="mt-0.5 text-base shrink-0">
                      {TYPE_ICONS[notification.type] || "🔔"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                        )}
                      </div>
                      {notification.content && (
                        <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                          {notification.content}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-gray-400">
                        {timeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                ))}

                {hasMore && (
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="flex w-full items-center justify-center py-3 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {isLoading ? "로딩 중..." : "더보기"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
