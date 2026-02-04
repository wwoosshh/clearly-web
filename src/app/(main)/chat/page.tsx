"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui/Spinner";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { getSocket, connectSocket, disconnectSocket } from "@/lib/socket";
import { chatCache } from "@/lib/chatCache";
import { uploadImage } from "@/lib/upload";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import type { ChatRoomDetail, ChatMessageDetail } from "@/types";

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-60px)] items-center justify-center">
          <Spinner size="lg" className="text-gray-400" />
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}

// ─── 임시 메시지 헬퍼 ───────────────────────────────
let tempSeq = 0;
function createTempMessage(
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

function isTempId(id: string) {
  return id.startsWith("temp-");
}

// ─── 메인 컴포넌트 ─────────────────────────────────
function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const companyIdParam = searchParams.get("companyId");
  const { user } = useAuthStore();

  const [rooms, setRooms] = useState<ChatRoomDetail[]>(() => {
    // 캐시에서 즉시 로드
    return chatCache.getRooms() || [];
  });
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessageDetail[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(() => {
    // 캐시가 있으면 로딩 없이 바로 표시
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const selectedRoomRef = useRef<ChatRoomDetail | null>(null);

  // selectedRoom이 바뀔 때 ref도 동기화 (소켓 콜백 내에서 최신값 참조용)
  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  // ─── 서버에서 방 목록 가져오기 (백그라운드) ──────────
  const syncRooms = useCallback(async () => {
    try {
      const { data } = await api.get("/chat/rooms");
      const result = (data as any)?.data ?? data;
      const serverRooms: ChatRoomDetail[] = Array.isArray(result) ? result : [];
      setRooms(serverRooms);
      chatCache.setRooms(serverRooms);
    } catch {
      // 캐시 데이터 유지
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── 서버에서 메시지 가져오기 (백그라운드) ────────────
  const syncMessages = useCallback(async (roomId: string) => {
    try {
      const { data } = await api.get(`/chat/rooms/${roomId}/messages`);
      const result = (data as any)?.data ?? data;
      const serverMessages: ChatMessageDetail[] =
        result?.data ?? (Array.isArray(result) ? result : []);
      setMessages((prev) => {
        // 전송중인 temp 메시지는 유지
        const pending = prev.filter((m) => isTempId(m.id));
        const merged = [...serverMessages];
        for (const p of pending) {
          if (!merged.some((m) => m.content === p.content && m.senderId === p.senderId)) {
            merged.push(p);
          }
        }
        return merged;
      });
      chatCache.setMessages(roomId, serverMessages);
    } catch {
      // 캐시 데이터 유지
    }
  }, []);

  // ─── 초기 로드 + companyId 자동 채팅방 생성 ──────────
  useEffect(() => {
    if (!user) return;

    if (companyIdParam) {
      (async () => {
        try {
          const { data } = await api.post("/chat/rooms", {
            companyId: companyIdParam,
          });
          const room = (data as any)?.data ?? data;
          setSelectedRoom(room);
          setShowMobileChat(true);
          // 캐시에서 메시지 즉시 로드
          const cached = chatCache.getMessages(room.id);
          if (cached?.length) setMessages(cached);
          syncMessages(room.id);
        } catch {
          // silent
        }
        syncRooms();
      })();
    } else {
      syncRooms();
    }
  }, [companyIdParam, user, syncRooms, syncMessages]);

  // ─── 소켓 연결 ──────────────────────────────────
  useEffect(() => {
    if (!user) return;

    connectSocket();
    const socket = getSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Chat] 소켓 연결 성공");
      if (selectedRoomRef.current) {
        socket.emit("joinRoom", selectedRoomRef.current.id);
      }
    });

    socket.on("connect_error", (err) => {
      console.warn("[Chat] 소켓 연결 실패:", err.message);
    });

    socket.on("newMessage", (message: ChatMessageDetail) => {
      setMessages((prev) => {
        // 내가 보낸 temp 메시지를 서버 메시지로 교체
        const replaced = prev.map((m) => {
          if (
            isTempId(m.id) &&
            m.senderId === message.senderId &&
            m.content === message.content
          ) {
            return message;
          }
          return m;
        });
        // 이미 있으면 무시
        if (replaced.some((m) => m.id === message.id)) return replaced;
        return [...replaced, message];
      });

      // 방 목록 업데이트
      setRooms((prev) =>
        prev.map((r) =>
          r.id === message.roomId
            ? { ...r, lastMessage: message.content, lastSentAt: message.createdAt }
            : r
        )
      );

      // 캐시 업데이트
      if (selectedRoomRef.current?.id === message.roomId) {
        chatCache.replaceTempMessage(
          message.roomId,
          message.senderId,
          message.content,
          message,
        );
      }

      // 현재 보고있는 방의 새 메시지이고 상대방이 보낸 경우 자동 읽음 처리
      if (
        selectedRoomRef.current?.id === message.roomId &&
        message.senderId !== user?.id
      ) {
        api.patch(`/chat/rooms/${message.roomId}/read`).catch(() => {});
      }
    });

    socket.on("messageRead", (data: { roomId: string; readBy: string }) => {
      // 상대방이 읽었을 때만 내 메시지를 읽음 처리
      if (data.readBy === user?.id) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId === user?.id ? { ...m, isRead: true } : m
        )
      );
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("newMessage");
      socket.off("messageRead");
      disconnectSocket();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ─── 방 선택 시: 캐시 먼저, 서버 동기화는 백그라운드 ─
  useEffect(() => {
    if (!selectedRoom) return;

    // 0) 안읽은 카운트 즉시 0으로 초기화
    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoom.id ? { ...r, unreadCount: 0 } : r
      )
    );

    // 1) 캐시에서 즉시 로드
    const cached = chatCache.getMessages(selectedRoom.id);
    if (cached?.length) {
      setMessages(cached);
    }

    // 2) 소켓 방 입장 + 읽음 처리
    if (socketRef.current) {
      socketRef.current.emit("joinRoom", selectedRoom.id);
      socketRef.current.emit("markRead", selectedRoom.id);
    }

    // 3) 서버에서 최신 데이터 동기화 (백그라운드)
    syncMessages(selectedRoom.id);
    api.patch(`/chat/rooms/${selectedRoom.id}/read`).catch(() => {});

    return () => {
      if (selectedRoom && socketRef.current) {
        socketRef.current.emit("leaveRoom", selectedRoom.id);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom]);

  // ─── 메시지 전송 (Optimistic) ──────────────────────
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedRoom || !user || isSending) return;
    const content = newMessage.trim();
    setIsSending(true);
    setNewMessage("");

    // 1) Optimistic: 즉시 화면에 추가
    const tempMsg = createTempMessage(
      selectedRoom.id,
      user.id,
      user.name,
      content,
    );
    setMessages((prev) => [...prev, tempMsg]);
    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoom.id
          ? { ...r, lastMessage: content, lastSentAt: tempMsg.createdAt }
          : r
      )
    );

    // 2) 서버에 전송 (백그라운드)
    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit("sendMessage", {
          roomId: selectedRoom.id,
          content,
        });
      } else {
        // REST 폴백
        const { data } = await api.post(
          `/chat/rooms/${selectedRoom.id}/messages`,
          { content },
        );
        const real = (data as any)?.data ?? data;
        // temp → real 교체
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempMsg.id ? real : m,
          ),
        );
        chatCache.replaceTempMessage(
          selectedRoom.id,
          user.id,
          content,
          real,
        );
      }
    } catch {
      // 전송 실패: temp 메시지에 실패 표시 가능 (현재는 유지)
      setNewMessage(content);
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
    } finally {
      setIsSending(false);
    }
  };

  // ─── 이미지 전송 ──────────────────────────────────
  const handleImageSend = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRoom || !user || isUploadingImage) return;
    e.target.value = "";

    setIsUploadingImage(true);
    try {
      const result = await uploadImage(file, "chat");
      // Optimistic 메시지
      const tempMsg = createTempMessage(
        selectedRoom.id,
        user.id,
        user.name,
        "[이미지]",
      );
      tempMsg.messageType = "IMAGE";
      tempMsg.fileUrl = result.url;
      setMessages((prev) => [...prev, tempMsg]);

      if (socketRef.current?.connected) {
        socketRef.current.emit("sendMessage", {
          roomId: selectedRoom.id,
          content: "[이미지]",
          messageType: "IMAGE",
          fileUrl: result.url,
        });
      } else {
        const { data } = await api.post(
          `/chat/rooms/${selectedRoom.id}/messages`,
          { content: "[이미지]", messageType: "IMAGE", fileUrl: result.url },
        );
        const real = (data as any)?.data ?? data;
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMsg.id ? real : m)),
        );
      }
    } catch {
      // silent
    } finally {
      setIsUploadingImage(false);
    }
  };

  // ─── 거래 취소 (Optimistic) ────────────────────────
  const handleDecline = async () => {
    if (!selectedRoom || isDeclining) return;
    setIsDeclining(true);

    // Optimistic: 모달 즉시 닫기 + 상태 업데이트
    setShowDeclineModal(false);
    const isCompany = user?.role === "COMPANY";
    const declinePatch = isCompany
      ? { companyDeclined: true }
      : { userDeclined: true };

    setSelectedRoom((prev) => prev ? { ...prev, ...declinePatch } : prev);
    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoom.id ? { ...r, ...declinePatch } : r
      )
    );

    try {
      const { data } = await api.patch(`/chat/rooms/${selectedRoom.id}/decline`);
      const result = (data as any)?.data ?? data;
      // 서버 응답으로 정확한 상태 동기화 (양측 취소 여부 반영)
      if (result.bothDeclined) {
        setSelectedRoom((prev) =>
          prev ? { ...prev, userDeclined: true, companyDeclined: true, refundStatus: "REQUESTED" as const } : prev
        );
      }
      syncRooms();
      syncMessages(selectedRoom.id);
    } catch {
      // 실패 시 롤백
      const rollbackPatch = isCompany
        ? { companyDeclined: false }
        : { userDeclined: false };
      setSelectedRoom((prev) => prev ? { ...prev, ...rollbackPatch } : prev);
      setRooms((prev) =>
        prev.map((r) =>
          r.id === selectedRoom.id ? { ...r, ...rollbackPatch } : r
        )
      );
    } finally {
      setIsDeclining(false);
    }
  };

  // ─── 신고 ──────────────────────────────────────
  const handleReport = async () => {
    if (!selectedRoom || !reportReason || isReporting) return;
    setIsReporting(true);
    setReportError("");

    // 상대방 결정: 내가 USER면 COMPANY 신고, 내가 COMPANY면 USER 신고
    const isCompanyUser = user?.role === "COMPANY";
    const targetType = isCompanyUser ? "USER" : "COMPANY";
    const targetId = isCompanyUser ? selectedRoom.userId : selectedRoom.companyId;

    try {
      await api.post("/reports", {
        targetType,
        targetId,
        reason: reportReason,
        description: reportDescription || undefined,
      });
      setReportSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "신고 접수에 실패했습니다.";
      setReportError(msg);
    } finally {
      setIsReporting(false);
    }
  };

  const resetReportModal = () => {
    setShowReportModal(false);
    setReportReason("");
    setReportDescription("");
    setReportError("");
    setReportSuccess(false);
  };

  // ─── 거래완료 ────────────────────────────────────
  const handleComplete = async () => {
    if (!selectedRoom || isCompleting) return;
    setIsCompleting(true);
    setShowCompleteModal(false);

    try {
      const { data } = await api.patch(`/chat/rooms/${selectedRoom.id}/complete`);
      const result = (data as any)?.data ?? data;
      syncMessages(selectedRoom.id);
      // 리뷰 작성 페이지로 이동
      router.push(`/review/write?matchingId=${result.matchingId}&companyId=${result.companyId}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "거래완료 처리에 실패했습니다.";
      alert(msg);
    } finally {
      setIsCompleting(false);
    }
  };

  // ─── 유틸 ──────────────────────────────────────
  const getRoomDisplayName = (room: ChatRoomDetail) => {
    if (!user) return "";
    if (user.role === "COMPANY") return room.user.name;
    return room.company.businessName;
  };

  const getRoomAvatar = (room: ChatRoomDetail) => {
    return getRoomDisplayName(room).charAt(0);
  };

  const getRoomProfileImage = (room: ChatRoomDetail) => {
    if (!user) return undefined;
    if (user.role === "COMPANY") return room.user.profileImage;
    return room.company.user?.profileImage;
  };

  const formatTime = (dateStr?: string) => {
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
  };

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-60px)] items-center justify-center">
        <p className="text-[15px] text-gray-500">로그인이 필요합니다</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-60px)] items-center justify-center">
        <Spinner size="lg" className="text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-60px)]">
      {/* 좌측: 채팅방 목록 */}
      <div
        className={cn(
          "w-full border-r border-gray-200 bg-white md:w-80 md:flex-shrink-0",
          showMobileChat ? "hidden md:block" : "block"
        )}
      >
        <div className="flex h-14 items-center border-b border-gray-200 px-5">
          <h2 className="text-[16px] font-bold text-gray-900">채팅</h2>
        </div>

        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="mt-3 text-[14px] text-gray-500">채팅 내역이 없습니다</p>
            <p className="mt-1 text-[13px] text-gray-400">업체에 채팅 상담을 시작해보세요</p>
          </div>
        ) : (
          <div className="overflow-y-auto">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => {
                  setSelectedRoom(room);
                  setShowMobileChat(true);
                }}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-gray-100 px-5 py-4 text-left transition-colors",
                  selectedRoom?.id === room.id ? "bg-gray-50" : "hover:bg-gray-50"
                )}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-white overflow-hidden">
                  {getRoomProfileImage(room) ? (
                    <img src={getRoomProfileImage(room)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[14px] font-semibold">{getRoomAvatar(room)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold text-gray-900 truncate">
                      {getRoomDisplayName(room)}
                    </span>
                    <span className="flex-shrink-0 text-[12px] text-gray-400">
                      {formatTime(room.lastSentAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[13px] text-gray-500 truncate">
                      {room.lastMessage || "대화를 시작해보세요"}
                    </p>
                    {room.unreadCount > 0 && (
                      <span className="ml-2 flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-gray-900 px-1.5 text-[11px] font-bold text-white">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 우측: 대화 영역 */}
      <div
        className={cn(
          "flex flex-1 flex-col bg-gray-50",
          !showMobileChat && !selectedRoom ? "hidden md:flex" : "flex"
        )}
      >
        {selectedRoom ? (
          <>
            <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-5">
              <div className="flex items-center gap-3">
                <button
                  className="md:hidden text-gray-500"
                  onClick={() => {
                    setShowMobileChat(false);
                    setSelectedRoom(null);
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <span className="text-[15px] font-semibold text-gray-900">
                  {getRoomDisplayName(selectedRoom)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setReportSuccess(false);
                    setReportError("");
                    setShowReportModal(true);
                  }}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-red-500 transition-colors hover:bg-red-50"
                >
                  신고
                </button>
                {!(selectedRoom.userDeclined && selectedRoom.companyDeclined) && user?.role === "USER" && (
                  <button
                    onClick={() => setShowCompleteModal(true)}
                    disabled={isCompleting}
                    className="rounded-lg border border-gray-900 bg-gray-900 px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                  >
                    거래완료
                  </button>
                )}
                {!(selectedRoom.userDeclined && selectedRoom.companyDeclined) && (
                  <button
                    onClick={() => setShowDeclineModal(true)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors hover:bg-gray-50"
                  >
                    거래안함
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                const isSystem = msg.messageType === "SYSTEM";
                const isTemp = isTempId(msg.id);

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-3">
                      <span className="rounded-full bg-gray-200 px-3 py-1 text-[12px] text-gray-500">
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={cn("mb-3 flex gap-2", isMe ? "justify-end" : "justify-start")}>
                    {!isMe && msg.sender && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600 overflow-hidden mt-5">
                        {msg.sender.profileImage ? (
                          <img src={msg.sender.profileImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[12px] font-semibold">{msg.sender.name.charAt(0)}</span>
                        )}
                      </div>
                    )}
                    <div className={cn("max-w-[70%]", isMe ? "items-end" : "items-start")}>
                      {!isMe && msg.sender && (
                        <p className="mb-1 text-[12px] text-gray-500">{msg.sender.name}</p>
                      )}
                      {msg.messageType === "IMAGE" && msg.fileUrl ? (
                        <img
                          src={msg.fileUrl}
                          alt="전송된 이미지"
                          className={cn(
                            "max-w-[200px] max-h-[200px] rounded-xl object-cover cursor-pointer border border-gray-200 transition-opacity",
                            isTemp && "opacity-60"
                          )}
                          onClick={() => {
                            setLightboxImages([msg.fileUrl!]);
                            setLightboxIndex(0);
                          }}
                        />
                      ) : (
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-[14px] transition-opacity",
                            isMe
                              ? "bg-gray-900 text-white rounded-br-md"
                              : "bg-white text-gray-900 border border-gray-200 rounded-bl-md",
                            isTemp && "opacity-60"
                          )}
                        >
                          {msg.content}
                        </div>
                      )}
                      <div className={cn("flex items-center gap-1 mt-1", isMe ? "flex-row-reverse" : "flex-row")}>
                        {isMe && !isTemp && !msg.isRead && (
                          <span className="text-[11px] font-semibold text-blue-500">1</span>
                        )}
                        <span className="text-[11px] text-gray-400">
                          {isTemp
                            ? "전송중..."
                            : new Date(msg.createdAt).toLocaleTimeString("ko-KR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedRoom.userDeclined && selectedRoom.companyDeclined ? (
              <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
                <p className="text-center text-[13px] text-gray-400">
                  양쪽 모두 거래를 취소하여 대화가 종료되었습니다.
                </p>
              </div>
            ) : (
            <div className="border-t border-gray-200 bg-white p-4">
              {isUploadingImage && (
                <div className="mb-2 text-center text-[12px] text-gray-500">이미지 업로드 중...</div>
              )}
              <div className="flex gap-2">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageSend}
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="메시지를 입력하세요"
                  className="h-[44px] flex-1 rounded-lg border border-gray-200 px-4 text-[14px] placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || isSending}
                  className="flex h-[44px] w-[44px] items-center justify-center rounded-lg bg-gray-900 text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
            )}
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="mt-4 text-[15px] text-gray-500">채팅방을 선택해주세요</p>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        title="거래 취소"
        size="sm"
      >
        <p className="text-[14px] text-gray-600">거래 취소를 요청하시겠습니까?</p>
        <p className="mt-2 text-[13px] text-gray-500">
          양쪽 모두 거래 취소를 요청하면 환불 절차가 진행됩니다.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => setShowDeclineModal(false)}
            className="flex h-[38px] flex-1 items-center justify-center rounded-lg border border-gray-200 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleDecline}
            disabled={isDeclining}
            className="flex h-[38px] flex-1 items-center justify-center rounded-lg bg-gray-900 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            거래 취소 요청
          </button>
        </div>
      </Modal>

      {/* 거래완료 확인 모달 */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="거래 완료"
        size="sm"
      >
        <p className="text-[14px] text-gray-600">거래를 완료 처리하시겠습니까?</p>
        <p className="mt-2 text-[13px] text-gray-500">
          거래 완료 후 리뷰를 작성할 수 있습니다.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => setShowCompleteModal(false)}
            className="flex h-[38px] flex-1 items-center justify-center rounded-lg border border-gray-200 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="flex h-[38px] flex-1 items-center justify-center rounded-lg bg-gray-900 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {isCompleting ? "처리중..." : "거래 완료"}
          </button>
        </div>
      </Modal>

      {/* 신고 모달 */}
      <Modal
        isOpen={showReportModal}
        onClose={resetReportModal}
        title="상대방 신고"
        size="md"
      >
        {reportSuccess ? (
          <div className="text-center py-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="mt-3 text-[15px] font-medium text-gray-900">신고가 접수되었습니다</p>
            <p className="mt-1 text-[13px] text-gray-500">관리자가 검토 후 조치하겠습니다.</p>
            <button
              onClick={resetReportModal}
              className="mt-5 flex h-[38px] w-full items-center justify-center rounded-lg bg-gray-900 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
            >
              확인
            </button>
          </div>
        ) : (
          <div>
            <p className="text-[14px] text-gray-600">
              <span className="font-semibold">{selectedRoom ? getRoomDisplayName(selectedRoom) : ""}</span>
              님을 신고합니다.
            </p>

            {reportError && (
              <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600">
                {reportError}
              </div>
            )}

            <div className="mt-4">
              <label className="text-[13px] font-medium text-gray-800 mb-2 block">
                신고 사유 <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col gap-2">
                {[
                  { value: "FRAUD", label: "사기 / 허위 정보" },
                  { value: "INAPPROPRIATE", label: "부적절한 언행" },
                  { value: "NO_SHOW", label: "연락 두절 / 노쇼" },
                  { value: "POOR_QUALITY", label: "서비스 품질 불량" },
                  { value: "OTHER", label: "기타" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setReportReason(opt.value)}
                    className={cn(
                      "flex items-center rounded-lg border px-4 py-3 text-[14px] text-left transition-colors",
                      reportReason === opt.value
                        ? "border-gray-900 bg-gray-50 font-medium text-gray-900"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <span className={cn(
                      "mr-3 flex h-5 w-5 items-center justify-center rounded-full border-2",
                      reportReason === opt.value
                        ? "border-gray-900 bg-gray-900"
                        : "border-gray-300"
                    )}>
                      {reportReason === opt.value && (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-[13px] font-medium text-gray-800 mb-1.5 block">
                상세 설명 (선택)
              </label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="구체적인 상황을 설명해주세요"
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-3 text-[14px] resize-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 focus:outline-none"
              />
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={resetReportModal}
                className="flex h-[38px] flex-1 items-center justify-center rounded-lg border border-gray-200 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason || isReporting}
                className="flex h-[38px] flex-1 items-center justify-center rounded-lg bg-red-600 text-[13px] font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isReporting ? "접수중..." : "신고 접수"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {lightboxImages.length > 0 && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxImages([])}
        />
      )}
    </div>
  );
}
