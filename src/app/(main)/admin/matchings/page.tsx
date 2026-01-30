"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface Matching {
  id: string;
  cleaningType: string;
  status: string;
  estimatedPrice: number | null;
  address: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  company: { id: string; businessName: string } | null;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const statusTabs = [
  { key: "", label: "전체" },
  { key: "REQUESTED", label: "요청" },
  { key: "ACCEPTED", label: "수락" },
  { key: "COMPLETED", label: "완료" },
  { key: "CANCELLED", label: "취소" },
  { key: "REJECTED", label: "거절" },
];

const cleaningTypeLabels: Record<string, string> = {
  MOVE_IN: "입주청소",
  MOVE_OUT: "이사청소",
  FULL: "전체청소",
  OFFICE: "사무실청소",
  STORE: "상가청소",
  CONSTRUCTION: "준공청소",
  AIRCON: "에어컨청소",
  CARPET: "카펫청소",
  EXTERIOR: "외부청소",
};

export default function AdminMatchingsPage() {
  const [matchings, setMatchings] = useState<Matching[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchMatchings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/admin/matchings", { params });
      setMatchings(data.data.data);
      setMeta(data.data.meta);
    } catch {
      // 에러 무시
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchMatchings();
  }, [fetchMatchings]);

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString("ko-KR") : "-";

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; style: string }> = {
      REQUESTED: { label: "요청", style: "bg-gray-100 text-gray-700" },
      ACCEPTED: { label: "수락", style: "bg-blue-50 text-blue-700" },
      COMPLETED: { label: "완료", style: "bg-green-50 text-green-700" },
      CANCELLED: { label: "취소", style: "bg-gray-200 text-gray-500" },
      REJECTED: { label: "거절", style: "bg-red-50 text-red-600" },
    };
    const info = map[status] || { label: status, style: "bg-gray-100 text-gray-600" };
    return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", info.style)}>{info.label}</span>;
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">매칭 관리</h1>
      <p className="mt-1 text-sm text-gray-500">전체 매칭 현황을 모니터링합니다.</p>

      {/* 상태 탭 */}
      <div className="mt-6 flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setPage(1); }}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
              statusFilter === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">사용자</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">업체</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">청소 유형</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">상태</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">예상 가격</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {matchings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                        매칭이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    matchings.map((matching) => (
                      <tr key={matching.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-3 text-[13px] text-gray-700">{matching.user?.name || "-"}</td>
                        <td className="px-4 py-3 text-[13px] text-gray-700">{matching.company?.businessName || "-"}</td>
                        <td className="px-4 py-3 text-[13px] text-gray-600">
                          {cleaningTypeLabels[matching.cleaningType] || matching.cleaningType}
                        </td>
                        <td className="px-4 py-3">{statusBadge(matching.status)}</td>
                        <td className="px-4 py-3 text-[13px] text-gray-700">
                          {matching.estimatedPrice ? `${matching.estimatedPrice.toLocaleString()}원` : "-"}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-500">{formatDate(matching.createdAt)}</td>
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
