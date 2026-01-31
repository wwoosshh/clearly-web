"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui/Spinner";
import api from "@/lib/api";

interface ActivityStats {
  estimateRequests: number;
  estimates: number;
  completedMatchings: number;
  reviews: number;
}

const ROLE_LABELS: Record<string, string> = {
  USER: "일반회원",
  COMPANY: "업체회원",
  ADMIN: "관리자",
};

export default function MyPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<ActivityStats>({
    estimateRequests: 0,
    estimates: 0,
    completedMatchings: 0,
    reviews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadStats();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStats = async () => {
    setIsLoading(true);

    const results = await Promise.allSettled([
      api.get("/estimates/requests", { params: { page: 1, limit: 1 } }),
      api.get("/estimates/my", { params: { page: 1, limit: 1 } }),
      api.get("/matchings/requests", { params: { page: 1, limit: 1 } }),
      api.get("/reviews/my", { params: { page: 1, limit: 1 } }),
    ]);

    const extractTotal = (result: PromiseSettledResult<any>): number => {
      if (result.status !== "fulfilled") return 0;
      const d = result.value?.data;
      const inner = d?.data ?? d;
      return inner?.meta?.total ?? (Array.isArray(inner?.data) ? inner.data.length : 0);
    };

    setStats({
      estimateRequests: extractTotal(results[0]),
      estimates: extractTotal(results[1]),
      completedMatchings: extractTotal(results[2]),
      reviews: extractTotal(results[3]),
    });
    setIsLoading(false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitial = (name?: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-[15px] text-gray-500">로그인이 필요합니다</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* 프로필 영역 */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-[22px] font-bold text-white">
          {getInitial(user.name)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-bold text-gray-900">{user.name}</h1>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[12px] font-medium text-gray-600">
              {ROLE_LABELS[user.role] || user.role}
            </span>
          </div>
          <p className="mt-0.5 text-[14px] text-gray-500">{user.email}</p>
          <div className="mt-1 flex items-center gap-3 text-[13px] text-gray-400">
            {user.phone && <span>{user.phone}</span>}
            <span>가입일 {formatDate(user.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* 활동 요약 */}
      <div className="mt-8">
        <h2 className="text-[15px] font-semibold text-gray-900">활동 요약</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" className="text-gray-400" />
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Link
              href="/estimate/request"
              className="rounded-xl border border-gray-200 bg-white p-4 text-center transition-colors hover:bg-gray-50"
            >
              <p className="text-[22px] font-bold text-gray-900">{stats.estimateRequests}</p>
              <p className="mt-1 text-[13px] text-gray-500">견적요청</p>
            </Link>
            <Link
              href="/matching"
              className="rounded-xl border border-gray-200 bg-white p-4 text-center transition-colors hover:bg-gray-50"
            >
              <p className="text-[22px] font-bold text-gray-900">{stats.estimates}</p>
              <p className="mt-1 text-[13px] text-gray-500">받은 견적</p>
            </Link>
            <Link
              href="/matching"
              className="rounded-xl border border-gray-200 bg-white p-4 text-center transition-colors hover:bg-gray-50"
            >
              <p className="text-[22px] font-bold text-gray-900">{stats.completedMatchings}</p>
              <p className="mt-1 text-[13px] text-gray-500">완료 매칭</p>
            </Link>
            <Link
              href="/mypage/reviews"
              className="rounded-xl border border-gray-200 bg-white p-4 text-center transition-colors hover:bg-gray-50"
            >
              <p className="text-[22px] font-bold text-gray-900">{stats.reviews}</p>
              <p className="mt-1 text-[13px] text-gray-500">작성 리뷰</p>
            </Link>
          </div>
        )}
      </div>

      {/* 바로가기 메뉴 */}
      <div className="mt-10">
        <h2 className="text-[15px] font-semibold text-gray-900">바로가기</h2>
        <div className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          <Link
            href="/mypage/reviews"
            className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className="text-[14px] font-medium text-gray-800">내 리뷰 관리</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
          <Link
            href="/matching"
            className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="text-[14px] font-medium text-gray-800">매칭 내역</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
          <Link
            href="/chat"
            className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="text-[14px] font-medium text-gray-800">채팅</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
          <Link
            href="/search"
            className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="text-[14px] font-medium text-gray-800">업체 찾기</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
