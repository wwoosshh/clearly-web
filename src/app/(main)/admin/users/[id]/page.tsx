"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface UserDetail {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  isActive: boolean;
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
    async function fetchUser() {
      try {
        const { data } = await api.get(`/admin/users/${userId}`);
        setUser(data.data);
      } catch {
        alert("사용자 정보를 불러올 수 없습니다.");
        router.push("/admin/users");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [userId, router]);

  const handleToggleActive = async () => {
    if (!user) return;
    if (!confirm(`이 사용자를 ${user.isActive ? "비활성화" : "활성화"}하시겠습니까?`)) return;
    setTogglingActive(true);
    try {
      await api.patch(`/admin/users/${userId}/toggle-active`);
      setUser((prev) => prev ? { ...prev, isActive: !prev.isActive } : prev);
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
      USER: { label: "일반", style: "bg-gray-100 text-gray-700" },
      COMPANY: { label: "업체", style: "bg-blue-50 text-blue-700" },
      ADMIN: { label: "관리자", style: "bg-red-50 text-red-700" },
    };
    const info = map[role] || { label: role, style: "bg-gray-100 text-gray-600" };
    return (
      <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", info.style)}>
        {info.label}
      </span>
    );
  };

  const estimateStatusBadge = (status: string) => {
    const map: Record<string, { label: string; style: string }> = {
      SUBMITTED: { label: "대기중", style: "bg-gray-100 text-gray-700" },
      ACCEPTED: { label: "수락됨", style: "bg-green-50 text-green-700" },
      REJECTED: { label: "거절됨", style: "bg-red-50 text-red-600" },
    };
    const info = map[status] || { label: status, style: "bg-gray-100 text-gray-600" };
    return (
      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", info.style)}>
        {info.label}
      </span>
    );
  };

  const matchingStatusBadge = (status: string) => {
    const map: Record<string, { label: string; style: string }> = {
      REQUESTED: { label: "요청", style: "bg-gray-100 text-gray-700" },
      ACCEPTED: { label: "수락", style: "bg-blue-50 text-blue-700" },
      COMPLETED: { label: "완료", style: "bg-green-50 text-green-700" },
      CANCELLED: { label: "취소", style: "bg-gray-200 text-gray-500" },
      REJECTED: { label: "거절", style: "bg-red-50 text-red-600" },
    };
    const info = map[status] || { label: status, style: "bg-gray-100 text-gray-600" };
    return (
      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", info.style)}>
        {info.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <button
        onClick={() => router.push("/admin/users")}
        className="text-[13px] text-gray-500 hover:text-gray-700"
      >
        &larr; 사용자 목록으로
      </button>

      {/* 사용자 정보 카드 */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            <p className="mt-1 text-[13px] text-gray-500">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {roleBadge(user.role)}
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                user.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
              )}
            >
              {user.isActive ? "활성" : "비활성"}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-4">
          <div>
            <p className="text-gray-500">전화번호</p>
            <p className="mt-0.5 font-medium text-gray-900">{user.phone || "-"}</p>
          </div>
          <div>
            <p className="text-gray-500">가입일</p>
            <p className="mt-0.5 font-medium text-gray-900">{formatDate(user.createdAt)}</p>
          </div>
          <div>
            <p className="text-gray-500">역할</p>
            <p className="mt-0.5">{roleBadge(user.role)}</p>
          </div>
          {user.company && (
            <div>
              <p className="text-gray-500">연결 업체</p>
              <Link
                href={`/admin/companies/${user.company.id}`}
                className="mt-0.5 text-[13px] font-medium text-blue-600 hover:underline"
              >
                {user.company.businessName}
              </Link>
            </div>
          )}
        </div>

        {user.role !== "ADMIN" && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <button
              onClick={handleToggleActive}
              disabled={togglingActive}
              className={cn(
                "rounded-lg px-4 py-2 text-[13px] font-medium text-white transition-colors disabled:opacity-50",
                user.isActive ? "bg-gray-600 hover:bg-gray-700" : "bg-green-600 hover:bg-green-700"
              )}
            >
              {user.isActive ? "비활성화" : "활성화"}
            </button>
          </div>
        )}
      </div>

      {/* 탭 */}
      <div className="mt-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setTab("activity")}
          className={cn(
            "flex-1 rounded-md py-2 text-[13px] font-medium transition-colors",
            tab === "activity" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          활동내역
        </button>
        <button
          onClick={() => setTab("reports")}
          className={cn(
            "flex-1 rounded-md py-2 text-[13px] font-medium transition-colors",
            tab === "reports" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          신고내역
        </button>
      </div>

      {tab === "activity" ? (
        <div className="mt-4 space-y-6">
          {/* 매칭 내역 */}
          <div>
            <h3 className="text-[14px] font-bold text-gray-900">최근 매칭 ({user.recentMatchings.length}건)</h3>
            {user.recentMatchings.length === 0 ? (
              <p className="mt-2 text-[13px] text-gray-400">매칭 내역이 없습니다.</p>
            ) : (
              <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">
                        {user.role === "COMPANY" ? "사용자" : "업체"}
                      </th>
                      <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">청소유형</th>
                      <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">상태</th>
                      <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.recentMatchings.map((m: any) => (
                      <tr key={m.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-2 text-[12px] text-gray-700">
                          {user.role === "COMPANY"
                            ? (m.user?.name || "-")
                            : (m.company?.businessName || "-")}
                        </td>
                        <td className="px-3 py-2 text-[12px] text-gray-600">{m.cleaningType}</td>
                        <td className="px-3 py-2">{matchingStatusBadge(m.status)}</td>
                        <td className="px-3 py-2 text-[12px] text-gray-500">{formatDate(m.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 리뷰 내역 */}
          <div>
            <h3 className="text-[14px] font-bold text-gray-900">
              {user.role === "COMPANY" ? "받은 리뷰" : "최근 리뷰"} ({user.recentReviews.length}건)
            </h3>
            {user.recentReviews.length === 0 ? (
              <p className="mt-2 text-[13px] text-gray-400">리뷰 내역이 없습니다.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {user.recentReviews.map((r: any) => (
                  <div key={r.id} className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-gray-900">
                        {user.role === "COMPANY"
                          ? (r.user?.name || "-")
                          : (r.company?.businessName || "-")}
                      </span>
                      <span className="text-[12px] text-gray-500">
                        {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-gray-600 line-clamp-2">{r.content}</p>
                    <p className="mt-1 text-[11px] text-gray-400">{formatDate(r.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 업체: 최근 견적 작성 */}
          {user.role === "COMPANY" && user.recentEstimates && user.recentEstimates.length > 0 && (
            <div>
              <h3 className="text-[14px] font-bold text-gray-900">최근 견적 작성 ({user.recentEstimates.length}건)</h3>
              <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">요청자</th>
                      <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">청소유형</th>
                      <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">견적금액</th>
                      <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">상태</th>
                      <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.recentEstimates.map((est: any) => (
                      <tr key={est.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-2 text-[12px] text-gray-700">
                          {est.estimateRequest?.user?.name || "-"}
                        </td>
                        <td className="px-3 py-2 text-[12px] text-gray-600">
                          {est.estimateRequest?.cleaningType || "-"}
                        </td>
                        <td className="px-3 py-2 text-[12px] font-medium text-gray-900">
                          {est.price?.toLocaleString()}원
                        </td>
                        <td className="px-3 py-2">
                          {estimateStatusBadge(est.status)}
                        </td>
                        <td className="px-3 py-2 text-[12px] text-gray-500">{formatDate(est.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 일반사용자: 견적요청 */}
          {user.role !== "COMPANY" && user.estimateRequests.length > 0 && (
            <div>
              <h3 className="text-[14px] font-bold text-gray-900">견적요청 ({user.estimateRequests.length}건)</h3>
              <div className="mt-2 space-y-2">
                {user.estimateRequests.map((er: any) => (
                  <div key={er.id} className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-gray-900">{er.cleaningType}</span>
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        er.status === "OPEN" ? "bg-green-50 text-green-700" :
                        er.status === "CLOSED" ? "bg-gray-100 text-gray-500" :
                        "bg-red-50 text-red-600"
                      )}>
                        {er.status === "OPEN" ? "진행중" : er.status === "CLOSED" ? "마감" : "만료"}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-gray-600">{er.address}</p>
                    <p className="mt-1 text-[11px] text-gray-400">{formatDate(er.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <h3 className="text-[14px] font-bold text-gray-900">신고 내역 ({user.recentReports.length}건)</h3>
          {user.recentReports.length === 0 ? (
            <p className="mt-2 text-[13px] text-gray-400">신고 내역이 없습니다.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {user.recentReports.map((report: any) => (
                <Link
                  key={report.id}
                  href={`/admin/reports/${report.id}`}
                  className="block rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        report.reporterId === userId
                          ? "bg-blue-50 text-blue-700"
                          : "bg-red-50 text-red-700"
                      )}>
                        {report.reporterId === userId ? "신고함" : "신고당함"}
                      </span>
                      <span className="text-[12px] text-gray-600">{report.reason}</span>
                    </div>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      report.status === "PENDING" ? "bg-amber-50 text-amber-700" :
                      report.status === "RESOLVED" ? "bg-green-50 text-green-700" :
                      report.status === "DISMISSED" ? "bg-gray-100 text-gray-500" :
                      "bg-blue-50 text-blue-700"
                    )}>
                      {report.status === "PENDING" ? "대기" :
                       report.status === "REVIEWED" ? "검토중" :
                       report.status === "RESOLVED" ? "해결" : "기각"}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-gray-600 line-clamp-2">{report.description}</p>
                  <p className="mt-1 text-[11px] text-gray-400">{formatDate(report.createdAt)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
