"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

interface Report {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
  reporter: { id: string; email: string; name: string };
  target: any;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const statusTabs = [
  { key: "", label: "전체" },
  { key: "PENDING", label: "대기" },
  { key: "REVIEWED", label: "검토중" },
  { key: "RESOLVED", label: "해결" },
  { key: "DISMISSED", label: "기각" },
];

const targetTypeOptions = [
  { key: "", label: "전체 유형" },
  { key: "USER", label: "유저" },
  { key: "COMPANY", label: "업체" },
  { key: "REVIEW", label: "리뷰" },
];

const reasonLabels: Record<string, string> = {
  FRAUD: "사기",
  INAPPROPRIATE: "부적절",
  NO_SHOW: "노쇼",
  POOR_QUALITY: "품질불량",
  OTHER: "기타",
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (targetTypeFilter) params.targetType = targetTypeFilter;
      const { data } = await api.get("/admin/reports", { params });
      setReports(data.data.data);
      setMeta(data.data.meta);
    } catch {
      // 에러 무시
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, targetTypeFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString("ko-KR") : "-";

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; style: string }> = {
      PENDING: { label: "대기", style: "bg-[#fef9ee] text-[#b45309]" },
      REVIEWED: { label: "검토중", style: "bg-[#fef9ee] text-[#b45309]" },
      RESOLVED: { label: "해결", style: "bg-[#eef7f3] text-[#2d6a4f]" },
      DISMISSED: { label: "기각", style: "bg-[#f0ede8] text-[#72706a]" },
    };
    const info = map[s] || { label: s, style: "bg-[#f0ede8] text-[#72706a]" };
    return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", info.style)}>{info.label}</span>;
  };

  const targetTypeBadge = (t: string) => {
    const map: Record<string, { label: string; style: string }> = {
      USER: { label: "유저", style: "bg-[#eef7f3] text-[#2d6a4f]" },
      COMPANY: { label: "업체", style: "bg-[#eef7f3] text-[#2d6a4f]" },
      REVIEW: { label: "리뷰", style: "bg-[#fef9ee] text-[#b45309]" },
    };
    const info = map[t] || { label: t, style: "bg-[#f0ede8] text-[#72706a]" };
    return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", info.style)}>{info.label}</span>;
  };

  const getTargetName = (report: Report) => {
    if (!report.target) return "-";
    if (report.targetType === "USER") return report.target.name || report.target.email;
    if (report.targetType === "COMPANY") return report.target.businessName;
    if (report.targetType === "REVIEW") return `리뷰 (${report.target.rating}점)`;
    return "-";
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-bold text-[#141412]">신고 관리</h1>
        <p className="mt-1 text-sm text-[#72706a]">사용자 신고를 관리합니다.</p>
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

      {/* 대상 타입 필터 */}
      <motion.div variants={fadeUp} className="mt-3 flex gap-2">
        {targetTypeOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => { setTargetTypeFilter(opt.key); setPage(1); }}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors",
              targetTypeFilter === opt.key
                ? "border-[#2d6a4f] bg-[#2d6a4f] text-[#f5f3ee]"
                : "border-[#e2ddd6] text-[#72706a] hover:bg-[#f0ede8]"
            )}
          >
            {opt.label}
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
              <table className="w-full text-left text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#e2ddd6] bg-[#f0ede8]">
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">신고자</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">대상</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">유형</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">사유</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">상태</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">날짜</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#72706a]">
                        신고가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <tr key={report.id} className="border-b border-[#e2ddd6] last:border-0 hover:bg-[#f5f3ee]">
                        <td className="px-4 py-3 text-[13px] text-[#1a1918]">{report.reporter?.name || "-"}</td>
                        <td className="px-4 py-3 text-[13px] text-[#1a1918]">{getTargetName(report)}</td>
                        <td className="px-4 py-3">{targetTypeBadge(report.targetType)}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-[#f0ede8] px-2 py-0.5 text-[11px] font-medium text-[#72706a]">
                            {reasonLabels[report.reason] || report.reason}
                          </span>
                        </td>
                        <td className="px-4 py-3">{statusBadge(report.status)}</td>
                        <td className="px-4 py-3 text-[13px] text-[#72706a]">{formatDate(report.createdAt)}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/reports/${report.id}`}
                            className="rounded-md border border-[#e2ddd6] bg-[#f0ede8] px-2.5 py-1 text-[11px] font-semibold text-[#1a1918] transition-colors hover:bg-[#e2ddd6]"
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
