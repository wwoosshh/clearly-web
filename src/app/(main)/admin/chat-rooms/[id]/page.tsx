"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#2d6a4f]" />
      </div>
    );
  }

  if (!room) return null;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.button
        variants={fadeUp}
        onClick={() => router.push("/admin/chat-rooms")}
        className="flex items-center gap-1.5 text-[13px] text-[#72706a] hover:text-[#1a1918] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        채팅방 목록으로
      </motion.button>

      {/* 상단 정보 */}
      <motion.div variants={fadeUp} className="mt-4 rounded-xl border border-[#e2ddd6] bg-white p-5">
        <div className="flex items-start justify-between">
          <h1 className="text-lg font-bold text-[#141412]">채팅방 상세</h1>
          <div className="flex gap-1">
            <span className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              room.isActive ? "bg-[#eef7f3] text-[#2d6a4f]" : "bg-red-50 text-red-600"
            )}>
              {room.isActive ? "활성" : "종료"}
            </span>
            {room.refundStatus !== "NONE" && (
              <span className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                room.refundStatus === "REQUESTED" ? "bg-[#fef9ee] text-[#b45309]" :
                room.refundStatus === "APPROVED" ? "bg-[#eef7f3] text-[#2d6a4f]" :
                "bg-red-50 text-red-600"
              )}>
                환불 {room.refundStatus === "REQUESTED" ? "요청" : room.refundStatus === "APPROVED" ? "승인" : "거절"}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-4">
          <div>
            <p className="text-[#72706a]">사용자</p>
            <Link href={`/admin/users/${room.user?.id}`} className="mt-0.5 text-[13px] font-medium text-[#2d6a4f] hover:underline">
              {room.user?.name}
            </Link>
          </div>
          <div>
            <p className="text-[#72706a]">업체</p>
            <Link href={`/admin/companies/${room.company?.id}`} className="mt-0.5 text-[13px] font-medium text-[#2d6a4f] hover:underline">
              {room.company?.businessName}
            </Link>
          </div>
          <div>
            <p className="text-[#72706a]">메시지 수</p>
            <p className="mt-0.5 font-medium text-[#1a1918]">{room._count?.messages || 0}건</p>
          </div>
          <div>
            <p className="text-[#72706a]">생성일</p>
            <p className="mt-0.5 font-medium text-[#1a1918]">{formatDateTime(room.createdAt)}</p>
          </div>
        </div>

        {/* 연결 정보 */}
        <div className="mt-3 flex flex-wrap gap-2">
          {room.matching && (
            <span className="rounded-lg bg-[#eef7f3] px-3 py-1 text-[12px] text-[#2d6a4f]">
              매칭: {room.matching.cleaningType} ({room.matching.status})
              {room.matching.estimatedPrice && ` - ${room.matching.estimatedPrice.toLocaleString()}원`}
            </span>
          )}
          {room.estimate && (
            <span className="rounded-lg bg-[#f5f3ee] px-3 py-1 text-[12px] text-[#72706a]">
              견적: {room.estimate.price?.toLocaleString()}원 ({room.estimate.status})
            </span>
          )}
        </div>
      </motion.div>

      {/* 대화 내용 */}
      <motion.div variants={fadeUp} className="mt-4 rounded-xl border border-[#e2ddd6] bg-white">
        <div className="border-b border-[#e2ddd6] px-5 py-3">
          <h2 className="text-[14px] font-semibold text-[#141412]">대화 내용</h2>
          <p className="text-[11px] text-[#72706a]">읽기 전용 - 관리자는 메시지를 전송할 수 없습니다</p>
        </div>

        {/* 이전 메시지 불러오기 */}
        {messageMeta && page < messageMeta.totalPages && (
          <div className="border-b border-[#e2ddd6] px-5 py-2 text-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={isLoadingMessages}
              className="text-[12px] text-[#2d6a4f] hover:underline disabled:opacity-50"
            >
              {isLoadingMessages ? "불러오는 중..." : "이전 메시지 불러오기"}
            </button>
          </div>
        )}

        <div className="max-h-[600px] overflow-y-auto p-5">
          {messages.length === 0 ? (
            <p className="py-12 text-center text-[13px] text-[#72706a]">메시지가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isSystem = msg.messageType === "SYSTEM";
                const isCompany = msg.sender?.role === "COMPANY";

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="rounded-full bg-[#f0ede8] px-4 py-1.5 text-[11px] text-[#72706a]">
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
                      <p className={cn("mb-0.5 text-[11px]", isCompany ? "text-right text-[#2d6a4f]" : "text-[#72706a]")}>
                        {msg.sender?.name}
                        <span className="ml-1 text-[10px] text-[#72706a]">
                          ({isCompany ? "업체" : "사용자"})
                        </span>
                      </p>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 text-[13px]",
                          isCompany
                            ? "rounded-tr-md bg-[#2d6a4f] text-white"
                            : "rounded-tl-md bg-[#f0ede8] text-[#1a1918]"
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
                      <p className={cn("mt-0.5 text-[10px] text-[#72706a]", isCompany ? "text-right" : "")}>
                        {formatDateTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
