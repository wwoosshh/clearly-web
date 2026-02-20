"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

interface Company {
  id: string;
  businessName: string;
  businessNumber: string;
  verificationStatus: string;
  rejectionReason: string | null;
  approvedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    phone: string;
    isActive: boolean;
  };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const tabs = [
  { key: "", label: "전체" },
  { key: "PENDING", label: "대기" },
  { key: "APPROVED", label: "승인" },
  { key: "REJECTED", label: "반려" },
  { key: "SUSPENDED", label: "정지" },
];

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 20 };
      if (status) params.status = status;
      const { data } = await api.get("/admin/companies", { params });
      setCompanies(data.data.data);
      setMeta(data.data.meta);
    } catch {
      // 에러 무시
    } finally {
      setIsLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleApprove = async (companyId: string) => {
    if (!confirm("이 업체를 승인하시겠습니까?")) return;
    setActionLoading(companyId);
    try {
      await api.patch(`/admin/companies/${companyId}/approve`);
      await fetchCompanies();
    } catch {
      alert("승인 처리에 실패했습니다.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (companyId: string) => {
    const reason = prompt("반려 사유를 입력해주세요:");
    if (!reason) return;
    setActionLoading(companyId);
    try {
      await api.patch(`/admin/companies/${companyId}/reject`, {
        rejectionReason: reason,
      });
      await fetchCompanies();
    } catch {
      alert("반려 처리에 실패했습니다.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (companyId: string) => {
    const reason = prompt("정지 사유를 입력해주세요:");
    if (!reason) return;
    setActionLoading(companyId);
    try {
      await api.patch(`/admin/companies/${companyId}/suspend`, { reason });
      await fetchCompanies();
    } catch {
      alert("정지 처리에 실패했습니다.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (companyId: string) => {
    if (!confirm("이 업체의 정지를 해제하시겠습니까?")) return;
    setActionLoading(companyId);
    try {
      await api.patch(`/admin/companies/${companyId}/reactivate`);
      await fetchCompanies();
    } catch {
      alert("정지 해제에 실패했습니다.");
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (s: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-[#fef9ee] text-[#b45309]",
      APPROVED: "bg-[#eef7f3] text-[#2d6a4f]",
      REJECTED: "bg-red-50 text-red-600",
      SUSPENDED: "bg-[#f0ede8] text-[#72706a]",
    };
    const labels: Record<string, string> = {
      PENDING: "대기",
      APPROVED: "승인",
      REJECTED: "반려",
      SUSPENDED: "정지",
    };
    return (
      <span
        className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${styles[s] || "bg-[#f0ede8] text-[#72706a]"}`}
      >
        {labels[s] || s}
      </span>
    );
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-bold text-[#1a1918]">업체 관리</h1>
        <p className="mt-1 text-sm text-[#72706a]">업체 승인 및 관리를 수행합니다.</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="mt-6 flex gap-1 rounded-lg bg-[#f0ede8] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatus(tab.key);
              setPage(1);
            }}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
              status === tab.key
                ? "bg-white text-[#1a1918] shadow-sm"
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
        <>
          <motion.div variants={fadeUp} className="mt-4 overflow-hidden rounded-xl border border-[#e2ddd6] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e2ddd6] bg-[#f0ede8]">
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">업체명</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">대표자</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">이메일</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">사업자번호</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">상태</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">등록일</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#72706a]">
                        업체가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    companies.map((company) => (
                      <tr
                        key={company.id}
                        className="border-b border-[#e2ddd6] bg-white transition-colors last:border-0 hover:bg-[#f5f3ee]"
                      >
                        <td className="px-4 py-3 text-[13px] font-medium text-[#1a1918]">
                          {company.businessName}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#72706a]">
                          {company.user.name}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#72706a]">
                          {company.user.email}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#72706a]">
                          {company.businessNumber || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {statusBadge(company.verificationStatus)}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#72706a]">
                          {new Date(company.createdAt).toLocaleDateString("ko-KR")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <Link
                              href={`/admin/companies/${company.id}`}
                              className="rounded-md border border-[#e2ddd6] bg-[#f0ede8] px-2.5 py-1 text-[11px] font-semibold text-[#72706a] transition-colors hover:bg-[#e2ddd6]"
                            >
                              상세
                            </Link>
                            {company.verificationStatus === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleApprove(company.id)}
                                  disabled={actionLoading === company.id}
                                  className="rounded-md bg-[#2d6a4f] px-2.5 py-1 text-[11px] font-semibold text-[#f5f3ee] transition-colors hover:bg-[#4a8c6a] disabled:opacity-50"
                                >
                                  승인
                                </button>
                                <button
                                  onClick={() => handleReject(company.id)}
                                  disabled={actionLoading === company.id}
                                  className="rounded-md bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                                >
                                  반려
                                </button>
                              </>
                            )}
                            {company.verificationStatus === "APPROVED" && (
                              <button
                                onClick={() => handleSuspend(company.id)}
                                disabled={actionLoading === company.id}
                                className="rounded-md bg-[#72706a] px-2.5 py-1 text-[11px] font-semibold text-[#f5f3ee] transition-colors hover:bg-[#1a1918] disabled:opacity-50"
                              >
                                정지
                              </button>
                            )}
                            {company.verificationStatus === "SUSPENDED" && (
                              <button
                                onClick={() => handleReactivate(company.id)}
                                disabled={actionLoading === company.id}
                                className="rounded-md bg-[#2d6a4f] px-2.5 py-1 text-[11px] font-semibold text-[#f5f3ee] transition-colors hover:bg-[#4a8c6a] disabled:opacity-50"
                              >
                                정지해제
                              </button>
                            )}
                          </div>
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
                className="rounded-lg border border-[#e2ddd6] bg-white px-3 py-1.5 text-[13px] font-medium text-[#72706a] transition-colors hover:bg-[#f0ede8] disabled:opacity-40"
              >
                이전
              </button>
              <span className="text-[13px] text-[#72706a]">
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="rounded-lg border border-[#e2ddd6] bg-white px-3 py-1.5 text-[13px] font-medium text-[#72706a] transition-colors hover:bg-[#f0ede8] disabled:opacity-40"
              >
                다음
              </button>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
