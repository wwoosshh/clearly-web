"use client";

import { useEffect, useRef } from "react";
import type { ChatRoomDetail, ChatMessageDetail, User } from "@/types";
import { getSocket, connectSocket, disconnectSocket } from "@/lib/socket";
import { chatCache } from "@/lib/chatCache";
import { isTempId } from "./useChatState";

interface UseChatSocketParams {
  user: User | null;
  selectedRoomRef: React.MutableRefObject<ChatRoomDetail | null>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageDetail[]>>;
  setRooms: React.Dispatch<React.SetStateAction<ChatRoomDetail[]>>;
}

export function useChatSocket({
  user,
  selectedRoomRef,
  setMessages,
  setRooms,
}: UseChatSocketParams) {
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

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
        socket.emit("markRead", message.roomId);
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

  return socketRef;
}
