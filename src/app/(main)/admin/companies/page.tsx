"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

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
      PENDING: "bg-amber-50 text-amber-700",
      APPROVED: "bg-green-50 text-green-700",
      REJECTED: "bg-red-50 text-red-700",
      SUSPENDED: "bg-gray-100 text-gray-600",
    };
    const labels: Record<string, string> = {
      PENDING: "대기",
      APPROVED: "승인",
      REJECTED: "반려",
      SUSPENDED: "정지",
    };
    return (
      <span
        className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${styles[s] || "bg-gray-100 text-gray-600"}`}
      >
        {labels[s] || s}
      </span>
    );
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">업체 관리</h1>
      <p className="mt-1 text-sm text-gray-500">
        업체 승인 및 관리를 수행합니다.
      </p>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-lg bg-gray-100 p-1">
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
              <table className="w-full text-left text-sm min-w-[750px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">업체명</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">대표자</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">이메일</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">사업자번호</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">상태</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">등록일</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                        업체가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    companies.map((company) => (
                      <tr key={company.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-3 text-[13px] font-medium text-gray-900">
                          {company.businessName}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-600">
                          {company.user.name}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-600">
                          {company.user.email}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-600">
                          {company.businessNumber || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {statusBadge(company.verificationStatus)}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-500">
                          {new Date(company.createdAt).toLocaleDateString("ko-KR")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <Link
                              href={`/admin/companies/${company.id}`}
                              className="rounded-md border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                            >
                              상세
                            </Link>
                            {company.verificationStatus === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleApprove(company.id)}
                                  disabled={actionLoading === company.id}
                                  className="rounded-md bg-green-600 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
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
                                className="rounded-md bg-gray-600 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
                              >
                                정지
                              </button>
                            )}
                            {company.verificationStatus === "SUSPENDED" && (
                              <button
                                onClick={() => handleReactivate(company.id)}
                                disabled={actionLoading === company.id}
                                className="rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
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
              <span className="text-[13px] text-gray-500">
                {page} / {meta.totalPages}
              </span>
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
