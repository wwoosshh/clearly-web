"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface ChatRoom {
  id: string;
  isActive: boolean;
  refundStatus: string;
  createdAt: string;
  lastMessage: string | null;
  lastSentAt: string | null;
  user: { id: string; name: string; email: string };
  company: { id: string; businessName: string };
  messages: { content: string; createdAt: string }[];
  _count: { messages: number };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminChatRoomsPage() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");
  const [refundFilter, setRefundFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchChatRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 20 };
      if (search) params.search = search;
      if (isActiveFilter) params.isActive = isActiveFilter;
      if (refundFilter) params.refundStatus = refundFilter;
      const { data } = await api.get("/admin/chat-rooms", { params });
      setChatRooms(data.data.data);
      setMeta(data.data.meta);
    } catch {
      // 에러 무시
    } finally {
      setIsLoading(false);
    }
  }, [page, search, isActiveFilter, refundFilter]);

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const formatDate = (d?: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("ko-KR");
  };

  const formatTime = (d?: string | null) => {
    if (!d) return "";
    return new Date(d).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">채팅 모니터링</h1>
      <p className="mt-1 text-sm text-gray-500">전체 채팅방을 모니터링합니다.</p>

      {/* 검색 + 필터 */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input
            type="text"
            placeholder="참여자 이름으로 검색..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-gray-400"
          />
          <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-gray-800">
            검색
          </button>
        </form>
        <select
          value={isActiveFilter}
          onChange={(e) => { setIsActiveFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none"
        >
          <option value="">전체 상태</option>
          <option value="true">활성</option>
          <option value="false">비활성</option>
        </select>
        <select
          value={refundFilter}
          onChange={(e) => { setRefundFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none"
        >
          <option value="">환불 상태</option>
          <option value="NONE">없음</option>
          <option value="REQUESTED">요청</option>
          <option value="APPROVED">승인</option>
          <option value="REJECTED">거절</option>
        </select>
      </div>

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">사용자</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">업체</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">마지막 메시지</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">메시지 수</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">상태</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">최근 활동</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {chatRooms.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                        채팅방이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    chatRooms.map((room) => (
                      <tr key={room.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-3 text-[13px] text-gray-700">{room.user?.name || "-"}</td>
                        <td className="px-4 py-3 text-[13px] text-gray-700">{room.company?.businessName || "-"}</td>
                        <td className="max-w-[200px] px-4 py-3 text-[12px] text-gray-600 truncate">
                          {room.messages?.[0]?.content || room.lastMessage || "-"}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-600">{room._count?.messages || 0}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <span className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              room.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                            )}>
                              {room.isActive ? "활성" : "종료"}
                            </span>
                            {room.refundStatus !== "NONE" && (
                              <span className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                room.refundStatus === "REQUESTED" ? "bg-amber-50 text-amber-700" :
                                room.refundStatus === "APPROVED" ? "bg-blue-50 text-blue-700" :
                                "bg-red-50 text-red-600"
                              )}>
                                환불{room.refundStatus === "REQUESTED" ? "요청" : room.refundStatus === "APPROVED" ? "승인" : "거절"}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-gray-500">
                          {formatDate(room.messages?.[0]?.createdAt || room.lastSentAt)} {formatTime(room.messages?.[0]?.createdAt || room.lastSentAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/chat-rooms/${room.id}`}
                            className="rounded-md border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                          >
                            상세
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                이전
              </button>
              <span className="text-[13px] text-gray-500">{page} / {meta.totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
