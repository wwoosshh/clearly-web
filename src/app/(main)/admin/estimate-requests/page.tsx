"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

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
      OPEN: { label: "진행중", style: "bg-[#eef7f3] text-[#2d6a4f]" },
      CLOSED: { label: "마감", style: "bg-[#f0ede8] text-[#72706a]" },
      EXPIRED: { label: "만료", style: "bg-red-50 text-red-600" },
    };
    const info = map[status] || { label: status, style: "bg-[#f0ede8] text-[#72706a]" };
    return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", info.style)}>{info.label}</span>;
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-bold text-[#141412]">견적요청 관리</h1>
        <p className="mt-1 text-sm text-[#72706a]">전체 견적요청 현황을 모니터링합니다.</p>
      </motion.div>

      {/* 상태 탭 */}
      <motion.div variants={fadeUp} className="mt-6 flex gap-1 rounded-lg bg-[#f0ede8] p-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setPage(1); }}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
              statusFilter === tab.key
                ? "bg-white text-[#141412] shadow-sm"
                : "text-[#72706a] hover:text-[#1a1918]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* 청소 유형 필터 */}
      <motion.div variants={fadeUp} className="mt-3">
        <select
          value={cleaningTypeFilter}
          onChange={(e) => { setCleaningTypeFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-[#e2ddd6] bg-white px-3 py-2 text-[13px] text-[#1a1918] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10"
        >
          <option value="">전체 청소 유형</option>
          {Object.entries(cleaningTypeLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </motion.div>

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#2d6a4f]" />
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div variants={fadeUp} className="mt-4 overflow-hidden rounded-xl border border-[#e2ddd6] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#e2ddd6] bg-[#f0ede8]">
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">작성자</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">청소 유형</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">주소</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">예산</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">견적 수</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">상태</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#72706a]">
                        견적요청이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.id} className="border-b border-[#e2ddd6] last:border-0 hover:bg-[#f5f3ee]">
                        <td className="px-4 py-3 text-[13px] text-[#1a1918]">{req.user?.name || "-"}</td>
                        <td className="px-4 py-3 text-[13px] text-[#72706a]">
                          {cleaningTypeLabels[req.cleaningType] || req.cleaningType}
                        </td>
                        <td className="max-w-[200px] px-4 py-3 text-[12px] text-[#72706a] truncate">
                          {req.address}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#1a1918]">
                          {req.budget ? `${req.budget.toLocaleString()}원` : "-"}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#72706a]">{req._count?.estimates || 0}건</td>
                        <td className="px-4 py-3">{statusBadge(req.status)}</td>
                        <td className="px-4 py-3 text-[13px] text-[#72706a]">{formatDate(req.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {meta && meta.totalPages > 1 && (
            <motion.div variants={fadeUp} className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-[#e2ddd6] bg-[#f0ede8] px-3 py-1.5 text-[13px] font-medium text-[#1a1918] transition-colors hover:bg-[#e2ddd6] disabled:opacity-40"
              >
                이전
              </button>
              <span className="text-[13px] text-[#72706a]">{page} / {meta.totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="rounded-lg border border-[#e2ddd6] bg-[#f0ede8] px-3 py-1.5 text-[13px] font-medium text-[#1a1918] transition-colors hover:bg-[#e2ddd6] disabled:opacity-40"
              >
                다음
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
