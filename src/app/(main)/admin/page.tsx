"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  pendingCompanies: number;
  totalMatchings: number;
  pendingReports: number;
  completedMatchings: number;
  totalReviews: number;
  openEstimateRequests: number;
  activeChatRooms: number;
  pendingInquiries: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  expiredSubscriptions: number;
}

const statCards: {
  key: keyof DashboardStats;
  label: string;
  color: string;
  href?: string;
}[] = [
  { key: "totalUsers", label: "전체 사용자", color: "bg-blue-50 text-blue-700", href: "/admin/users" },
  { key: "totalCompanies", label: "전체 업체", color: "bg-green-50 text-green-700", href: "/admin/companies" },
  { key: "pendingCompanies", label: "승인 대기 업체", color: "bg-amber-50 text-amber-700", href: "/admin/companies" },
  { key: "totalMatchings", label: "전체 매칭", color: "bg-purple-50 text-purple-700", href: "/admin/matchings" },
  { key: "pendingReports", label: "미처리 신고", color: "bg-red-50 text-red-700", href: "/admin/reports" },
  { key: "completedMatchings", label: "완료 매칭", color: "bg-emerald-50 text-emerald-700", href: "/admin/matchings" },
  { key: "totalReviews", label: "전체 리뷰", color: "bg-indigo-50 text-indigo-700", href: "/admin/reviews" },
  { key: "openEstimateRequests", label: "진행중 견적요청", color: "bg-orange-50 text-orange-700", href: "/admin/estimate-requests" },
  { key: "activeChatRooms", label: "활성 채팅방", color: "bg-cyan-50 text-cyan-700", href: "/admin/chat-rooms" },
  { key: "pendingInquiries", label: "미답변 문의", color: "bg-pink-50 text-pink-700", href: "/admin/inquiries" },
  { key: "activeSubscriptions", label: "활성 구독", color: "bg-teal-50 text-teal-700", href: "/admin/subscriptions" },
  { key: "trialSubscriptions", label: "체험 구독", color: "bg-violet-50 text-violet-700", href: "/admin/subscriptions" },
  { key: "expiredSubscriptions", label: "만료 구독", color: "bg-stone-100 text-stone-700", href: "/admin/subscriptions" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await api.get("/admin/dashboard");
        setStats(data.data);
      } catch {
        // 에러 무시
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">대시보드</h1>
      <p className="mt-1 text-sm text-gray-500">서비스 전체 현황을 확인하세요.</p>

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      ) : stats ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
            {statCards.map((card) => (
              <Link
                key={card.key}
                href={card.href || "/admin"}
                className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
              >
                <p className="text-[12px] font-medium text-gray-500">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {stats[card.key].toLocaleString()}
                </p>
                <span
                  className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${card.color}`}
                >
                  {card.label}
                </span>
              </Link>
            ))}
          </div>

          {/* 긴급 처리 필요 */}
          {(stats.pendingReports > 0 || stats.pendingCompanies > 0 || stats.pendingInquiries > 0) && (
            <div className="mt-8">
              <h2 className="text-[15px] font-bold text-gray-900">
                긴급 처리 필요
              </h2>
              <div className="mt-3 flex flex-col gap-3">
                {stats.pendingReports > 0 && (
                  <Link
                    href="/admin/reports"
                    className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 transition-colors hover:bg-red-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🚨</span>
                      <div>
                        <p className="text-[14px] font-semibold text-red-800">
                          미처리 신고 {stats.pendingReports}건
                        </p>
                        <p className="text-[12px] text-red-600">
                          확인이 필요한 신고가 있습니다
                        </p>
                      </div>
                    </div>
                    <span className="text-[13px] font-medium text-red-700">
                      바로가기 →
                    </span>
                  </Link>
                )}
                {stats.pendingCompanies > 0 && (
                  <Link
                    href="/admin/companies"
                    className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 transition-colors hover:bg-amber-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🏢</span>
                      <div>
                        <p className="text-[14px] font-semibold text-amber-800">
                          승인 대기 업체 {stats.pendingCompanies}건
                        </p>
                        <p className="text-[12px] text-amber-600">
                          업체 승인 처리가 필요합니다
                        </p>
                      </div>
                    </div>
                    <span className="text-[13px] font-medium text-amber-700">
                      바로가기 →
                    </span>
                  </Link>
                )}
                {stats.pendingInquiries > 0 && (
                  <Link
                    href="/admin/inquiries"
                    className="flex items-center justify-between rounded-xl border border-pink-200 bg-pink-50 p-4 transition-colors hover:bg-pink-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📩</span>
                      <div>
                        <p className="text-[14px] font-semibold text-pink-800">
                          미답변 문의 {stats.pendingInquiries}건
                        </p>
                        <p className="text-[12px] text-pink-600">
                          답변 대기 중인 문의가 있습니다
                        </p>
                      </div>
                    </div>
                    <span className="text-[13px] font-medium text-pink-700">
                      바로가기 →
                    </span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="mt-8 text-center text-sm text-gray-500">
          데이터를 불러올 수 없습니다.
        </div>
      )}
    </div>
  );
}
