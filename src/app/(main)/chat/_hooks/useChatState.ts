"use client";

import { useState, useRef } from "react";
import type { ChatRoomDetail, ChatMessageDetail, User } from "@/types";
import { chatCache } from "@/lib/chatCache";

// ─── Temp message helpers ───────────────────────────────
let tempSeq = 0;
export function createTempMessage(
  roomId: string,
  senderId: string,
  senderName: string,
  content: string,
): ChatMessageDetail {
  return {
    id: `temp-${Date.now()}-${++tempSeq}`,
    roomId,
    senderId,
    content,
    messageType: "TEXT",
    isRead: false,
    createdAt: new Date().toISOString(),
    sender: { id: senderId, name: senderName },
  };
}

export function isTempId(id: string) {
  return id.startsWith("temp-");
}

// ─── Utility functions ──────────────────────────────────
export function getRoomDisplayName(room: ChatRoomDetail, user: User | null) {
  if (!user) return "";
  if (user.role === "COMPANY") return room.user.name;
  return room.company.businessName;
}

export function getRoomAvatar(room: ChatRoomDetail, user: User | null) {
  return getRoomDisplayName(room, user).charAt(0);
}

export function getRoomProfileImage(room: ChatRoomDetail, user: User | null) {
  if (!user) return undefined;
  if (user.role === "COMPANY") return room.user.profileImage;
  return room.company.user?.profileImage;
}

export function formatTime(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}일 전`;
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}시간 전`;
  const minutes = Math.floor(diff / 60000);
  if (minutes > 0) return `${minutes}분 전`;
  return "방금";
}

// ─── Chat state hook ────────────────────────────────────
export function useChatState() {
  const [rooms, setRooms] = useState<ChatRoomDetail[]>(() => {
    return chatCache.getRooms() || [];
  });
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessageDetail[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(() => {
    return !chatCache.getRooms();
  });
  const [isSending, setIsSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState("");
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  // 완료보고 (업체용)
  const [showCompletionReportModal, setShowCompletionReportModal] = useState(false);
  const [completionImages, setCompletionImages] = useState<string[]>([]);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isUploadingCompletionImage, setIsUploadingCompletionImage] = useState(false);
  const completionImageInputRef = useRef<HTMLInputElement>(null);
  // 완료확인 (사용자용)
  const [showCompletionConfirmModal, setShowCompletionConfirmModal] = useState(false);
  const [isConfirmingCompletion, setIsConfirmingCompletion] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  return {
    rooms, setRooms,
    selectedRoom, setSelectedRoom,
    messages, setMessages,
    newMessage, setNewMessage,
    isLoading, setIsLoading,
    isSending, setIsSending,
    showMobileChat, setShowMobileChat,
    showDeclineModal, setShowDeclineModal,
    isDeclining, setIsDeclining,
    showReportModal, setShowReportModal,
    reportReason, setReportReason,
    reportDescription, setReportDescription,
    isReporting, setIsReporting,
    reportSuccess, setReportSuccess,
    reportError, setReportError,
    showCompleteModal, setShowCompleteModal,
    isCompleting, setIsCompleting,
    isLoadingMessages, setIsLoadingMessages,
    isUploadingImage, setIsUploadingImage,
    lightboxImages, setLightboxImages,
    lightboxIndex, setLightboxIndex,
    showCompletionReportModal, setShowCompletionReportModal,
    completionImages, setCompletionImages,
    isSubmittingReport, setIsSubmittingReport,
    isUploadingCompletionImage, setIsUploadingCompletionImage,
    completionImageInputRef,
    showCompletionConfirmModal, setShowCompletionConfirmModal,
    isConfirmingCompletion, setIsConfirmingCompletion,
    imageInputRef,
    chatScrollRef,
  };
}
