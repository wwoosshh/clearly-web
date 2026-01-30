"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui/Spinner";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { getSocket, connectSocket, disconnectSocket } from "@/lib/socket";
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

function ChatPageContent() {
  const searchParams = useSearchParams();
  const companyIdParam = searchParams.get("companyId");
  const { user } = useAuthStore();

  const [rooms, setRooms] = useState<ChatRoomDetail[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessageDetail[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  const loadRooms = useCallback(async () => {
    try {
      const { data } = await api.get("/chat/rooms");
      const result = (data as any)?.data ?? data;
      setRooms(Array.isArray(result) ? result : []);
    } catch {
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (roomId: string) => {
    try {
      const { data } = await api.get(`/chat/rooms/${roomId}/messages`);
      const result = (data as any)?.data ?? data;
      setMessages(result?.data ?? (Array.isArray(result) ? result : []));
    } catch {
      setMessages([]);
    }
  }, []);

  // companyId 쿼리로 자동 채팅방 생성
  useEffect(() => {
    if (companyIdParam && user) {
      (async () => {
        try {
          const { data } = await api.post("/chat/rooms", {
            companyId: companyIdParam,
          });
          const room = (data as any)?.data ?? data;
          await loadRooms();
          setSelectedRoom(room);
          setShowMobileChat(true);
          await loadMessages(room.id);
        } catch {
          await loadRooms();
        }
      })();
    } else {
      loadRooms();
    }
  }, [companyIdParam, user, loadRooms, loadMessages]);

  // 소켓 연결
  useEffect(() => {
    if (!user) return;

    connectSocket();
    const socket = getSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Chat] 소켓 연결 성공");
      // 현재 선택된 방이 있으면 다시 join
      if (selectedRoom) {
        socket.emit("joinRoom", selectedRoom.id);
      }
    });

    socket.on("connect_error", (err) => {
      console.warn("[Chat] 소켓 연결 실패:", err.message);
    });

    socket.on("newMessage", (message: ChatMessageDetail) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });

      setRooms((prev) =>
        prev.map((r) =>
          r.id === message.roomId
            ? { ...r, lastMessage: message.content, lastSentAt: message.createdAt }
            : r
        )
      );
    });

    socket.on("messageRead", () => {
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
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

  // 방 선택 시
  useEffect(() => {
    if (selectedRoom && socketRef.current) {
      socketRef.current.emit("joinRoom", selectedRoom.id);
      loadMessages(selectedRoom.id);
      api.patch(`/chat/rooms/${selectedRoom.id}/read`).catch(() => {});
    }

    return () => {
      if (selectedRoom && socketRef.current) {
        socketRef.current.emit("leaveRoom", selectedRoom.id);
      }
    };
  }, [selectedRoom, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedRoom || isSending) return;
    const content = newMessage.trim();
    setIsSending(true);
    setNewMessage("");

    try {
      if (socketRef.current?.connected) {
        // 소켓 연결 시 실시간 전송
        socketRef.current.emit("sendMessage", {
          roomId: selectedRoom.id,
          content,
        });
      } else {
        // 소켓 미연결 시 REST API 폴백
        const { data } = await api.post(`/chat/rooms/${selectedRoom.id}/messages`, {
          content,
        });
        const msg = (data as any)?.data ?? data;
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setRooms((prev) =>
          prev.map((r) =>
            r.id === selectedRoom.id
              ? { ...r, lastMessage: content, lastSentAt: msg.createdAt }
              : r
          )
        );
      }
    } catch {
      setNewMessage(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleDecline = async () => {
    if (!selectedRoom) return;
    try {
      await api.patch(`/chat/rooms/${selectedRoom.id}/decline`);
      setShowDeclineModal(false);
      await loadRooms();
    } catch {
      // silent
    }
  };

  const getRoomDisplayName = (room: ChatRoomDetail) => {
    if (!user) return "";
    if (user.role === "company") return room.user.name;
    return room.company.businessName;
  };

  const getRoomAvatar = (room: ChatRoomDetail) => {
    return getRoomDisplayName(room).charAt(0);
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
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-white">
                  <span className="text-[14px] font-semibold">{getRoomAvatar(room)}</span>
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
              <button
                onClick={() => setShowDeclineModal(true)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors hover:bg-gray-50"
              >
                거래안함
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                const isSystem = msg.messageType === "SYSTEM";

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
                  <div key={msg.id} className={cn("mb-3 flex", isMe ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[70%]", isMe ? "items-end" : "items-start")}>
                      {!isMe && msg.sender && (
                        <p className="mb-1 text-[12px] text-gray-500">{msg.sender.name}</p>
                      )}
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 text-[14px]",
                          isMe
                            ? "bg-gray-900 text-white rounded-br-md"
                            : "bg-white text-gray-900 border border-gray-200 rounded-bl-md"
                        )}
                      >
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[11px] text-gray-400">
                          {new Date(msg.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {isMe && msg.isRead && (
                          <span className="text-[11px] text-gray-400">읽음</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 bg-white p-4">
              <div className="flex gap-2">
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
            className="flex h-[38px] flex-1 items-center justify-center rounded-lg bg-gray-900 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
          >
            거래 취소 요청
          </button>
        </div>
      </Modal>
    </div>
  );
}
