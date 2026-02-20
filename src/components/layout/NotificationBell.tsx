"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "@/stores/notification.store";
import type { NotificationType } from "@/types";

function TypeIcon({ type }: { type: NotificationType }) {
  const base = "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5";

  switch (type) {
    // 견적 제출됨 — 문서 + 화살표 (파랑)
    case "ESTIMATE_SUBMITTED":
      return (
        <span className={`${base} bg-blue-50`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <polyline points="9 15 12 18 15 15" />
          </svg>
        </span>
      );

    // 견적 수락됨 — 원형 체크 (초록)
    case "ESTIMATE_ACCEPTED":
    case "MATCHING_ACCEPTED":
      return (
        <span className={`${base} bg-emerald-50`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </span>
      );

    // 견적 거절됨 — 원형 X (빨강)
    case "ESTIMATE_REJECTED":
    case "MATCHING_REJECTED":
      return (
        <span className={`${base} bg-red-50`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </span>
      );

    // 새 견적 요청 — 클립보드 + 돋보기 (인디고)
    case "NEW_ESTIMATE_REQUEST":
      return (
        <span className={`${base} bg-indigo-50`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <line x1="9" y1="12" x2="15" y2="12" />
            <line x1="9" y1="16" x2="12" y2="16" />
          </svg>
        </span>
      );

    // 새 메시지 — 말풍선 (하늘)
    case "NEW_MESSAGE":
      return (
        <span className={`${base} bg-sky-50`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
      );

    // 새 리뷰 — 별 (황금)
    case "NEW_REVIEW":
      return (
        <span className={`${base} bg-amber-50`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </span>
      );

    // 구독 생성됨 — 신용카드 (보라)
    case "SUBSCRIPTION_CREATED":
      return (
        <span className={`${base} bg-violet-50`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        </span>
      );

    // 구독 만료 예정 — 시계 (주황)
    case "SUBSCRIPTION_EXPIRING":
      return (
        <span className={`${base} bg-orange-50`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </span>
      );

    // 구독 만료됨 — 경고 삼각형 (빨강)
    case "SUBSCRIPTION_EXPIRED":
      return (
        <span className={`${base} bg-red-50`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </span>
      );

    // 매칭 요청 — 사람 + 화살표 (포레스트 그린)
    case "MATCHING_REQUEST":
      return (
        <span className={`${base} bg-[#eef7f3]`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </span>
      );

    // 구독 알림 — 스피커/메가폰 (보라)
    case "SUBSCRIPTION":
      return (
        <span className={`${base} bg-violet-50`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        </span>
      );

    // 시스템 — 정보 원형 (회색)
    case "SYSTEM":
    default:
      return (
        <span className={`${base} bg-gray-100`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </span>
      );
  }
}

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

export const NotificationBell = React.memo(function NotificationBell() {
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

      <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed left-4 right-4 top-[68px] sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-[380px] rounded-xl border border-gray-200 bg-white shadow-lg shadow-gray-200/50 overflow-hidden z-[60]"
        >
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
                    <TypeIcon type={notification.type} />
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
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
});
