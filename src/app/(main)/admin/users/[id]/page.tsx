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

interface UserDetail {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  isActive: boolean;
  deactivatedAt: string | null;
  createdAt: string;
  company: any | null;
  recentMatchings: any[];
  recentReviews: any[];
  recentReports: any[];
  estimateRequests: any[];
  recentEstimates: any[];
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<"activity" | "reports">("activity");
  const [togglingActive, setTogglingActive] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function fetchUser() {
      try {
        const { data } = await api.get(`/admin/users/${userId}`);
        if (!cancelled) setUser(data.data);
      } catch {
        if (!cancelled) {
          alert("사용자 정보를 불러올 수 없습니다.");
          router.push("/admin/users");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchUser();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const getDeactivationDaysLeft = () => {
    if (!user?.deactivatedAt) return null;
    const deactivatedDate = new Date(user.deactivatedAt);
    const deleteDate = new Date(deactivatedDate);
    deleteDate.setDate(deleteDate.getDate() + 7);
    const now = new Date();
    const diffMs = deleteDate.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    return daysLeft;
  };

  const handleToggleActive = async () => {
    if (!user) return;
    const actionLabel = user.isActive
      ? "비활성화"
      : user.deactivatedAt
        ? "복구 (탈퇴 취소)"
        : "활성화";
    if (!confirm(`이 사용자를 ${actionLabel}하시겠습니까?`)) return;
    setTogglingActive(true);
    try {
      await api.patch(`/admin/users/${userId}/toggle-active`);
      setUser((prev) => {
        if (!prev) return prev;
        const newIsActive = !prev.isActive;
        return {
          ...prev,
          isActive: newIsActive,
          deactivatedAt: newIsActive ? null : prev.deactivatedAt,
        };
      });
    } catch {
      alert("상태 변경에 실패했습니다.");
    } finally {
      setTogglingActive(false);
    }
  };

  const formatDate = (d?: string) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("ko-KR");
  };

  const roleBadge = (role: string) => {
    const map: Record<string, { label: string; style: string }> = {
      USER: { label: "일반", style: "bg-[#f0ede8] text-[#72706a]" },
      COMPANY: { label: "업체", style: "bg-[#eef7f3] text-[#2d6a4f]" },
      ADMIN: { label: "관리자", style: "bg-red-50 text-red-600" },
    };
    const info = map[role] || { label: role, style: "bg-[#f0ede8] text-[#72706a]" };
    return (
      <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", info.style)}>
        {info.label}
      </span>
    );
  };

  const estimateStatusBadge = (status: string) => {
    const map: Record<string, { label: string; style: string }> = {
      SUBMITTED: { label: "대기중", style: "bg-[#fef9ee] text-[#b45309]" },
      ACCEPTED: { label: "수락됨", style: "bg-[#eef7f3] text-[#2d6a4f]" },
      REJECTED: { label: "거절됨", style: "bg-red-50 text-red-600" },
    };
    const info = map[status] || { label: status, style: "bg-[#f0ede8] text-[#72706a]" };
    return (
      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", info.style)}>
        {info.label}
      </span>
    );
  };

  const matchingStatusBadge = (status: string) => {
    const map: Record<string, { label: string; style: string }> = {
      REQUESTED: { label: "요청", style: "bg-[#fef9ee] text-[#b45309]" },
      ACCEPTED: { label: "수락", style: "bg-[#eef7f3] text-[#2d6a4f]" },
      COMPLETED: { label: "완료", style: "bg-[#eef7f3] text-[#2d6a4f]" },
      CANCELLED: { label: "취소", style: "bg-red-50 text-red-600" },
      REJECTED: { label: "거절", style: "bg-red-50 text-red-600" },
    };
    const info = map[status] || { label: status, style: "bg-[#f0ede8] text-[#72706a]" };
    return (
      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", info.style)}>
        {info.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#2d6a4f]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.button
        variants={fadeUp}
        onClick={() => router.push("/admin/users")}
        className="flex items-center gap-1.5 text-[13px] text-[#72706a] hover:text-[#1a1918] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        사용자 목록으로
      </motion.button>

      {/* 사용자 정보 카드 */}
      <motion.div variants={fadeUp} className="mt-4 rounded-xl border border-[#e2ddd6] bg-white p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#141412]">{user.name}</h1>
            <p className="mt-1 text-[13px] text-[#72706a]">{user.email}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {roleBadge(user.role)}
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                user.isActive ? "bg-[#eef7f3] text-[#2d6a4f]" : "bg-red-50 text-red-600"
              )}
            >
              {user.isActive ? "활성" : "비활성"}
            </span>
            {user.deactivatedAt && (() => {
              const daysLeft = getDeactivationDaysLeft();
              return (
                <span className="rounded-full bg-[#fef9ee] px-2.5 py-0.5 text-[11px] font-semibold text-[#b45309]">
                  탈퇴 예정 (D-{daysLeft}일)
                </span>
              );
            })()}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-4">
          <div>
            <p className="text-[#72706a]">전화번호</p>
            <p className="mt-0.5 font-medium text-[#1a1918]">{user.phone || "-"}</p>
          </div>
          <div>
            <p className="text-[#72706a]">가입일</p>
            <p className="mt-0.5 font-medium text-[#1a1918]">{formatDate(user.createdAt)}</p>
          </div>
          <div>
            <p className="text-[#72706a]">역할</p>
            <p className="mt-0.5">{roleBadge(user.role)}</p>
          </div>
          {user.company && (
            <div>
              <p className="text-[#72706a]">연결 업체</p>
              <Link
                href={`/admin/companies/${user.company.id}`}
                className="mt-0.5 text-[13px] font-medium text-[#2d6a4f] hover:underline"
              >
                {user.company.businessName}
              </Link>
            </div>
          )}
        </div>

        {user.role !== "ADMIN" && (
          <div className="mt-4 border-t border-[#e2ddd6] pt-4">
            <button
              onClick={handleToggleActive}
              disabled={togglingActive}
              className={cn(
                "rounded-lg px-4 py-2 text-[13px] font-medium transition-colors disabled:opacity-50",
                user.isActive
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-[#2d6a4f] text-[#f5f3ee] hover:bg-[#4a8c6a]"
              )}
            >
              {user.isActive
                ? "비활성화"
                : user.deactivatedAt
                  ? "복구 (탈퇴 취소)"
                  : "활성화"}
            </button>
          </div>
        )}
      </motion.div>

      {/* 탭 */}
      <motion.div variants={fadeUp} className="mt-6 flex gap-1 rounded-lg bg-[#f0ede8] p-1">
        <button
          onClick={() => setTab("activity")}
          className={cn(
            "flex-1 rounded-md py-2 text-[13px] font-medium transition-colors",
            tab === "activity" ? "bg-white text-[#141412] shadow-sm" : "text-[#72706a] hover:text-[#1a1918]"
          )}
        >
          활동내역
        </button>
        <button
          onClick={() => setTab("reports")}
          className={cn(
            "flex-1 rounded-md py-2 text-[13px] font-medium transition-colors",
            tab === "reports" ? "bg-white text-[#141412] shadow-sm" : "text-[#72706a] hover:text-[#1a1918]"
          )}
        >
          신고내역
        </button>
      </motion.div>

      {tab === "activity" ? (
        <motion.div variants={stagger} initial="hidden" animate="show" className="mt-4 space-y-6">
          {/* 매칭 내역 */}
          <motion.div variants={fadeUp}>
            <h3 className="text-[14px] font-semibold text-[#141412]">최근 매칭 ({user.recentMatchings.length}건)</h3>
            {user.recentMatchings.length === 0 ? (
              <p className="mt-2 text-[13px] text-[#72706a]">매칭 내역이 없습니다.</p>
            ) : (
              <div className="mt-2 overflow-hidden rounded-xl border border-[#e2ddd6] bg-white">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#e2ddd6] bg-[#f0ede8]">
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">
                        {user.role === "COMPANY" ? "사용자" : "업체"}
                      </th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">청소유형</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">상태</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.recentMatchings.map((m: any) => (
                      <tr key={m.id} className="border-b border-[#e2ddd6] last:border-0">
                        <td className="px-3 py-2.5 text-[12px] text-[#1a1918]">
                          {user.role === "COMPANY"
                            ? (m.user?.name || "-")
                            : (m.company?.businessName || "-")}
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-[#72706a]">{m.cleaningType}</td>
                        <td className="px-3 py-2.5">{matchingStatusBadge(m.status)}</td>
                        <td className="px-3 py-2.5 text-[12px] text-[#72706a]">{formatDate(m.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* 리뷰 내역 */}
          <motion.div variants={fadeUp}>
            <h3 className="text-[14px] font-semibold text-[#141412]">
              {user.role === "COMPANY" ? "받은 리뷰" : "최근 리뷰"} ({user.recentReviews.length}건)
            </h3>
            {user.recentReviews.length === 0 ? (
              <p className="mt-2 text-[13px] text-[#72706a]">리뷰 내역이 없습니다.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {user.recentReviews.map((r: any) => (
                  <div key={r.id} className="rounded-xl border border-[#e2ddd6] bg-white p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-[#1a1918]">
                        {user.role === "COMPANY"
                          ? (r.user?.name || "-")
                          : (r.company?.businessName || "-")}
                      </span>
                      <span className="text-[12px] text-[#72706a]">
                        {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-[#72706a] line-clamp-2">{r.content}</p>
                    <p className="mt-1 text-[11px] text-[#72706a]">{formatDate(r.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* 업체: 최근 견적 작성 */}
          {user.role === "COMPANY" && user.recentEstimates && user.recentEstimates.length > 0 && (
            <motion.div variants={fadeUp}>
              <h3 className="text-[14px] font-semibold text-[#141412]">최근 견적 작성 ({user.recentEstimates.length}건)</h3>
              <div className="mt-2 overflow-hidden rounded-xl border border-[#e2ddd6] bg-white">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#e2ddd6] bg-[#f0ede8]">
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">요청자</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">청소유형</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">견적금액</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">상태</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-[#72706a]">날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.recentEstimates.map((est: any) => (
                      <tr key={est.id} className="border-b border-[#e2ddd6] last:border-0">
                        <td className="px-3 py-2.5 text-[12px] text-[#1a1918]">
                          {est.estimateRequest?.user?.name || "-"}
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-[#72706a]">
                          {est.estimateRequest?.cleaningType || "-"}
                        </td>
                        <td className="px-3 py-2.5 text-[12px] font-medium text-[#1a1918]">
                          {est.price?.toLocaleString()}원
                        </td>
                        <td className="px-3 py-2.5">
                          {estimateStatusBadge(est.status)}
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-[#72706a]">{formatDate(est.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* 일반사용자: 견적요청 */}
          {user.role !== "COMPANY" && user.estimateRequests.length > 0 && (
            <motion.div variants={fadeUp}>
              <h3 className="text-[14px] font-semibold text-[#141412]">견적요청 ({user.estimateRequests.length}건)</h3>
              <div className="mt-2 space-y-2">
                {user.estimateRequests.map((er: any) => (
                  <div key={er.id} className="rounded-xl border border-[#e2ddd6] bg-white p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-[#1a1918]">{er.cleaningType}</span>
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        er.status === "OPEN" ? "bg-[#eef7f3] text-[#2d6a4f]" :
                        er.status === "CLOSED" ? "bg-[#f0ede8] text-[#72706a]" :
                        "bg-red-50 text-red-600"
                      )}>
                        {er.status === "OPEN" ? "진행중" : er.status === "CLOSED" ? "마감" : "만료"}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-[#72706a]">{er.address}</p>
                    <p className="mt-1 text-[11px] text-[#72706a]">{formatDate(er.createdAt)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="mt-4">
          <h3 className="text-[14px] font-semibold text-[#141412]">신고 내역 ({user.recentReports.length}건)</h3>
          {user.recentReports.length === 0 ? (
            <p className="mt-2 text-[13px] text-[#72706a]">신고 내역이 없습니다.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {user.recentReports.map((report: any) => (
                <Link
                  key={report.id}
                  href={`/admin/reports/${report.id}`}
                  className="block rounded-xl border border-[#e2ddd6] bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        report.reporterId === userId
                          ? "bg-[#eef7f3] text-[#2d6a4f]"
                          : "bg-red-50 text-red-600"
                      )}>
                        {report.reporterId === userId ? "신고함" : "신고당함"}
                      </span>
                      <span className="text-[12px] text-[#72706a]">{report.reason}</span>
                    </div>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      report.status === "PENDING" ? "bg-[#fef9ee] text-[#b45309]" :
                      report.status === "RESOLVED" ? "bg-[#eef7f3] text-[#2d6a4f]" :
                      report.status === "DISMISSED" ? "bg-[#f0ede8] text-[#72706a]" :
                      "bg-[#eef7f3] text-[#2d6a4f]"
                    )}>
                      {report.status === "PENDING" ? "대기" :
                       report.status === "REVIEWED" ? "검토중" :
                       report.status === "RESOLVED" ? "해결" : "기각"}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#72706a] line-clamp-2">{report.description}</p>
                  <p className="mt-1 text-[11px] text-[#72706a]">{formatDate(report.createdAt)}</p>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
