"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface EstimateRequest {
  id: string;
  cleaningType: string;
  address: string;
  areaSize: number | null;
  budget: number | null;
  status: string;
  desiredDate: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
  _count: { estimates: number };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const statusTabs = [
  { key: "", label: "전체" },
  { key: "OPEN", label: "진행중" },
  { key: "CLOSED", label: "마감" },
  { key: "EXPIRED", label: "만료" },
];

const cleaningTypeLabels: Record<string, string> = {
  MOVE_IN: "입주청소",
  MOVE_OUT: "이사청소",
  FULL: "전체청소",
  OFFICE: "사무실청소",
  STORE: "상가청소",
  AIRCON: "에어컨청소",
  CARPET: "카펫청소",
  EXTERIOR: "외부청소",
};

export default function AdminEstimateRequestsPage() {
  const [requests, setRequests] = useState<EstimateRequest[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [cleaningTypeFilter, setCleaningTypeFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (cleaningTypeFilter) params.cleaningType = cleaningTypeFilter;
      const { data } = await api.get("/admin/estimate-requests", { params });
      setRequests(data.data.data);
      setMeta(data.data.meta);
    } catch {
      // 에러 무시
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, cleaningTypeFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const formatDate = (d?: string | null) => d ? new Date(d).toLocaleDateString("ko-KR") : "-";

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; style: string }> = {
      OPEN: { label: "진행중", style: "bg-green-50 text-green-700" },
      CLOSED: { label: "마감", style: "bg-gray-200 text-gray-500" },
      EXPIRED: { label: "만료", style: "bg-red-50 text-red-600" },
    };
    const info = map[status] || { label: status, style: "bg-gray-100 text-gray-600" };
    return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", info.style)}>{info.label}</span>;
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">견적요청 관리</h1>
      <p className="mt-1 text-sm text-gray-500">전체 견적요청 현황을 모니터링합니다.</p>

      {/* 상태 탭 */}
      <div className="mt-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setPage(1); }}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
              statusFilter === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 청소 유형 필터 */}
      <div className="mt-3">
        <select
          value={cleaningTypeFilter}
          onChange={(e) => { setCleaningTypeFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none"
        >
          <option value="">전체 청소 유형</option>
          {Object.entries(cleaningTypeLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
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
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">작성자</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">청소 유형</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">주소</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">예산</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">견적 수</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">상태</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                        견적요청이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-3 text-[13px] text-gray-700">{req.user?.name || "-"}</td>
                        <td className="px-4 py-3 text-[13px] text-gray-600">
                          {cleaningTypeLabels[req.cleaningType] || req.cleaningType}
                        </td>
                        <td className="max-w-[200px] px-4 py-3 text-[12px] text-gray-600 truncate">
                          {req.address}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-700">
                          {req.budget ? `${req.budget.toLocaleString()}원` : "-"}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-600">{req._count?.estimates || 0}건</td>
                        <td className="px-4 py-3">{statusBadge(req.status)}</td>
                        <td className="px-4 py-3 text-[13px] text-gray-500">{formatDate(req.createdAt)}</td>
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
