"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  messageType: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    role: string;
    profileImage: string | null;
  };
}

export default function AdminChatRoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageMeta, setMessageMeta] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    async function fetchRoom() {
      try {
        const { data } = await api.get(`/admin/chat-rooms/${roomId}`);
        setRoom(data.data);
      } catch {
        alert("채팅방 정보를 불러올 수 없습니다.");
        router.push("/admin/chat-rooms");
      } finally {
        setIsLoading(false);
      }
    }
    fetchRoom();
  }, [roomId, router]);

  useEffect(() => {
    async function fetchMessages() {
      setIsLoadingMessages(true);
      try {
        const { data } = await api.get(`/admin/chat-rooms/${roomId}/messages`, {
          params: { page, limit: 50 },
        });
        if (page === 1) {
          setMessages(data.data.data);
        } else {
          setMessages((prev) => [...data.data.data, ...prev]);
        }
        setMessageMeta(data.data.meta);
      } catch {
        // 에러 무시
      } finally {
        setIsLoadingMessages(false);
      }
    }
    if (roomId) fetchMessages();
  }, [roomId, page]);

  const formatDateTime = (d?: string) => {
    if (!d) return "-";
    const date = new Date(d);
    return `${date.toLocaleDateString("ko-KR")} ${date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  if (!room) return null;

  return (
    <div>
      <button onClick={() => router.push("/admin/chat-rooms")} className="text-[13px] text-gray-500 hover:text-gray-700">
        &larr; 채팅방 목록으로
      </button>

      {/* 상단 정보 */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between">
          <h1 className="text-lg font-bold text-gray-900">채팅방 상세</h1>
          <div className="flex gap-1">
            <span className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              room.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
            )}>
              {room.isActive ? "활성" : "종료"}
            </span>
            {room.refundStatus !== "NONE" && (
              <span className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                room.refundStatus === "REQUESTED" ? "bg-amber-50 text-amber-700" :
                room.refundStatus === "APPROVED" ? "bg-blue-50 text-blue-700" :
                "bg-red-50 text-red-600"
              )}>
                환불 {room.refundStatus === "REQUESTED" ? "요청" : room.refundStatus === "APPROVED" ? "승인" : "거절"}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-4">
          <div>
            <p className="text-gray-500">사용자</p>
            <Link href={`/admin/users/${room.user?.id}`} className="mt-0.5 text-[13px] font-medium text-blue-600 hover:underline">
              {room.user?.name}
            </Link>
          </div>
          <div>
            <p className="text-gray-500">업체</p>
            <Link href={`/admin/companies/${room.company?.id}`} className="mt-0.5 text-[13px] font-medium text-blue-600 hover:underline">
              {room.company?.businessName}
            </Link>
          </div>
          <div>
            <p className="text-gray-500">메시지 수</p>
            <p className="mt-0.5 font-medium text-gray-900">{room._count?.messages || 0}건</p>
          </div>
          <div>
            <p className="text-gray-500">생성일</p>
            <p className="mt-0.5 font-medium text-gray-900">{formatDateTime(room.createdAt)}</p>
          </div>
        </div>

        {/* 연결 정보 */}
        <div className="mt-3 flex flex-wrap gap-2">
          {room.matching && (
            <span className="rounded-lg bg-purple-50 px-3 py-1 text-[12px] text-purple-700">
              매칭: {room.matching.cleaningType} ({room.matching.status})
              {room.matching.estimatedPrice && ` - ${room.matching.estimatedPrice.toLocaleString()}원`}
            </span>
          )}
          {room.estimate && (
            <span className="rounded-lg bg-blue-50 px-3 py-1 text-[12px] text-blue-700">
              견적: {room.estimate.price?.toLocaleString()}원 ({room.estimate.status})
            </span>
          )}
        </div>
      </div>

      {/* 대화 내용 */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-[14px] font-bold text-gray-900">대화 내용</h2>
          <p className="text-[11px] text-gray-400">읽기 전용 - 관리자는 메시지를 전송할 수 없습니다</p>
        </div>

        {/* 이전 메시지 불러오기 */}
        {messageMeta && page < messageMeta.totalPages && (
          <div className="border-b border-gray-50 px-5 py-2 text-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={isLoadingMessages}
              className="text-[12px] text-blue-600 hover:underline disabled:opacity-50"
            >
              {isLoadingMessages ? "불러오는 중..." : "이전 메시지 불러오기"}
            </button>
          </div>
        )}

        <div className="max-h-[600px] overflow-y-auto p-5">
          {messages.length === 0 ? (
            <p className="py-12 text-center text-[13px] text-gray-400">메시지가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isSystem = msg.messageType === "SYSTEM";
                const isCompany = msg.sender?.role === "COMPANY";

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="rounded-full bg-gray-100 px-4 py-1.5 text-[11px] text-gray-500">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={cn("flex", isCompany ? "justify-end" : "justify-start")}
                  >
                    <div className={cn("max-w-[70%]", isCompany ? "items-end" : "items-start")}>
                      <p className={cn("mb-0.5 text-[11px]", isCompany ? "text-right text-blue-600" : "text-gray-500")}>
                        {msg.sender?.name}
                        <span className="ml-1 text-[10px] text-gray-400">
                          ({isCompany ? "업체" : "사용자"})
                        </span>
                      </p>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 text-[13px]",
                          isCompany
                            ? "rounded-tr-md bg-blue-500 text-white"
                            : "rounded-tl-md bg-gray-100 text-gray-900"
                        )}
                      >
                        {msg.messageType === "IMAGE" ? (
                          <span className="text-[12px] italic opacity-70">[이미지]</span>
                        ) : msg.messageType === "FILE" ? (
                          <span className="text-[12px] italic opacity-70">[파일]</span>
                        ) : (
                          <span className="whitespace-pre-wrap">{msg.content}</span>
                        )}
                      </div>
                      <p className={cn("mt-0.5 text-[10px] text-gray-400", isCompany ? "text-right" : "")}>
                        {formatDateTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
