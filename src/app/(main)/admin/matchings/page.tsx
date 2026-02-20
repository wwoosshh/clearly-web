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
      REQUESTED: { label: "요청", style: "bg-[#fef9ee] text-[#b45309]" },
      ACCEPTED: { label: "수락", style: "bg-[#eef7f3] text-[#2d6a4f]" },
      COMPLETED: { label: "완료", style: "bg-[#eef7f3] text-[#2d6a4f]" },
      CANCELLED: { label: "취소", style: "bg-red-50 text-red-600" },
      REJECTED: { label: "거절", style: "bg-red-50 text-red-600" },
    };
    const info = map[status] || { label: status, style: "bg-[#f0ede8] text-[#72706a]" };
    return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", info.style)}>{info.label}</span>;
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-bold text-[#141412]">매칭 관리</h1>
        <p className="mt-1 text-sm text-[#72706a]">전체 매칭 현황을 모니터링합니다.</p>
      </motion.div>

      {/* 상태 탭 */}
      <motion.div variants={fadeUp} className="mt-6 flex gap-1 overflow-x-auto rounded-lg bg-[#f0ede8] p-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setPage(1); }}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
              statusFilter === tab.key
                ? "bg-white text-[#141412] shadow-sm"
                : "text-[#72706a] hover:text-[#1a1918]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#2d6a4f]" />
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div variants={fadeUp} className="mt-4 overflow-hidden rounded-xl border border-[#e2ddd6] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#e2ddd6] bg-[#f0ede8]">
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">사용자</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">업체</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">청소 유형</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">상태</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">예상 가격</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {matchings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#72706a]">
                        매칭이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    matchings.map((matching) => (
                      <tr key={matching.id} className="border-b border-[#e2ddd6] last:border-0 hover:bg-[#f5f3ee]">
                        <td className="px-4 py-3 text-[13px] text-[#1a1918]">{matching.user?.name || "-"}</td>
                        <td className="px-4 py-3 text-[13px] text-[#1a1918]">{matching.company?.businessName || "-"}</td>
                        <td className="px-4 py-3 text-[13px] text-[#72706a]">
                          {cleaningTypeLabels[matching.cleaningType] || matching.cleaningType}
                        </td>
                        <td className="px-4 py-3">{statusBadge(matching.status)}</td>
                        <td className="px-4 py-3 text-[13px] text-[#1a1918]">
                          {matching.estimatedPrice ? `${matching.estimatedPrice.toLocaleString()}원` : "-"}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#72706a]">{formatDate(matching.createdAt)}</td>
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
