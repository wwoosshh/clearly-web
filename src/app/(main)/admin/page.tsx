"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";

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
  href?: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "totalUsers",
    label: "전체 사용자",
    href: "/admin/users",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    key: "totalCompanies",
    label: "전체 업체",
    href: "/admin/companies",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: "pendingCompanies",
    label: "승인 대기 업체",
    href: "/admin/companies",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    key: "totalMatchings",
    label: "전체 매칭",
    href: "/admin/matchings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "pendingReports",
    label: "미처리 신고",
    href: "/admin/reports",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    key: "completedMatchings",
    label: "완료 매칭",
    href: "/admin/matchings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    key: "totalReviews",
    label: "전체 리뷰",
    href: "/admin/reviews",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    key: "openEstimateRequests",
    label: "진행중 견적요청",
    href: "/admin/estimate-requests",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    key: "activeChatRooms",
    label: "활성 채팅방",
    href: "/admin/chat-rooms",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    key: "pendingInquiries",
    label: "미답변 문의",
    href: "/admin/inquiries",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    key: "activeSubscriptions",
    label: "활성 구독",
    href: "/admin/subscriptions",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    key: "trialSubscriptions",
    label: "체험 구독",
    href: "/admin/subscriptions",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    key: "expiredSubscriptions",
    label: "만료 구독",
    href: "/admin/subscriptions",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
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
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-bold text-[#1a1918]">대시보드</h1>
        <p className="mt-1 text-sm text-[#72706a]">서비스 전체 현황을 확인하세요.</p>
      </motion.div>

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#2d6a4f]" />
        </div>
      ) : stats ? (
        <>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3"
          >
            {statCards.map((card) => (
              <motion.div key={card.key} variants={fadeUp}>
                <Link
                  href={card.href || "/admin"}
                  className="group flex flex-col rounded-xl border border-[#e2ddd6] bg-white p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-medium text-[#72706a]">{card.label}</p>
                    <span className="text-[#d4ede4] transition-colors group-hover:text-[#2d6a4f]">
                      {card.icon}
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-[#2d6a4f]">
                    {(stats[card.key] ?? 0).toLocaleString()}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* 긴급 처리 필요 */}
          {(stats.pendingReports > 0 ||
            stats.pendingCompanies > 0 ||
            stats.pendingInquiries > 0) && (
            <motion.div variants={fadeUp} className="mt-8">
              <h2 className="text-[15px] font-bold text-[#1a1918]">긴급 처리 필요</h2>
              <motion.div variants={stagger} className="mt-3 flex flex-col gap-3">
                {stats.pendingReports > 0 && (
                  <motion.div variants={fadeUp}>
                    <Link
                      href="/admin/reports"
                      className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 transition-colors hover:bg-red-100"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                        </span>
                        <div>
                          <p className="text-[14px] font-semibold text-red-800">
                            미처리 신고 {stats.pendingReports}건
                          </p>
                          <p className="text-[12px] text-red-600">
                            확인이 필요한 신고가 있습니다
                          </p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 text-[13px] font-medium text-red-700">
                        바로가기
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </span>
                    </Link>
                  </motion.div>
                )}
                {stats.pendingCompanies > 0 && (
                  <motion.div variants={fadeUp}>
                    <Link
                      href="/admin/companies"
                      className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 transition-colors hover:bg-amber-100"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                        </span>
                        <div>
                          <p className="text-[14px] font-semibold text-amber-800">
                            승인 대기 업체 {stats.pendingCompanies}건
                          </p>
                          <p className="text-[12px] text-amber-600">
                            업체 승인 처리가 필요합니다
                          </p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 text-[13px] font-medium text-amber-700">
                        바로가기
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </span>
                    </Link>
                  </motion.div>
                )}
                {stats.pendingInquiries > 0 && (
                  <motion.div variants={fadeUp}>
                    <Link
                      href="/admin/inquiries"
                      className="flex items-center justify-between rounded-xl border border-[#e2ddd6] bg-[#eef7f3] p-4 transition-colors hover:bg-[#d4ede4]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#d4ede4] text-[#2d6a4f]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        </span>
                        <div>
                          <p className="text-[14px] font-semibold text-[#2d6a4f]">
                            미답변 문의 {stats.pendingInquiries}건
                          </p>
                          <p className="text-[12px] text-[#4a8c6a]">
                            답변 대기 중인 문의가 있습니다
                          </p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 text-[13px] font-medium text-[#2d6a4f]">
                        바로가기
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </span>
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div variants={fadeUp} className="mt-8 text-center text-sm text-[#72706a]">
          데이터를 불러올 수 없습니다.
        </motion.div>
      )}
    </motion.div>
  );
}
