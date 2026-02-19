"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { useSubscriptionStore } from "@/stores/subscription.store";
import SubscriptionBadge from "@/components/subscription/SubscriptionBadge";
import { Spinner } from "@/components/ui/Spinner";
import api from "@/lib/api";
import { uploadImage } from "@/lib/upload";

interface UserStats {
  estimateRequests: number;
  estimates: number;
  completedMatchings: number;
  reviews: number;
}

interface CompanyStats {
  submittedEstimates: number;
  receivedReviews: number;
  completedMatchings: number;
}

const ROLE_LABELS: Record<string, string> = {
  USER: "일반회원",
  COMPANY: "업체회원",
  ADMIN: "관리자",
};

export default function MyPage() {
  const { user, setUser, logout } = useAuthStore();
  const router = useRouter();
  const isCompany = user?.role === "COMPANY";
  const { subscription, fetchSubscription } = useSubscriptionStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [userStats, setUserStats] = useState<UserStats>({
    estimateRequests: 0,
    estimates: 0,
    completedMatchings: 0,
    reviews: 0,
  });
  const [companyStats, setCompanyStats] = useState<CompanyStats>({
    submittedEstimates: 0,
    receivedReviews: 0,
    completedMatchings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (isCompany) {
      loadCompanyStats();
      fetchSubscription();
    } else {
      loadUserStats();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const extractTotal = (result: PromiseSettledResult<any>): number => {
    if (result.status !== "fulfilled") return 0;
    const d = result.value?.data;
    const inner = d?.data ?? d;
    return inner?.meta?.total ?? (Array.isArray(inner?.data) ? inner.data.length : 0);
  };

  const loadUserStats = async () => {
    setIsLoading(true);
    const results = await Promise.allSettled([
      api.get("/estimates/requests", { params: { page: 1, limit: 1 } }),
      api.get("/estimates/my", { params: { page: 1, limit: 1 } }),
      api.get("/matchings/requests", { params: { page: 1, limit: 1 } }),
      api.get("/reviews/my", { params: { page: 1, limit: 1 } }),
    ]);
    setUserStats({
      estimateRequests: extractTotal(results[0]),
      estimates: extractTotal(results[1]),
      completedMatchings: extractTotal(results[2]),
      reviews: extractTotal(results[3]),
    });
    setIsLoading(false);
  };

  const loadCompanyStats = async () => {
    setIsLoading(true);
    const results = await Promise.allSettled([
      api.get("/estimates/company-estimates", { params: { page: 1, limit: 1 } }),
      api.get("/reviews/my", { params: { page: 1, limit: 1 } }),
      api.get("/matchings/requests", { params: { page: 1, limit: 1 } }),
    ]);
    setCompanyStats({
      submittedEstimates: extractTotal(results[0]),
      receivedReviews: extractTotal(results[1]),
      completedMatchings: extractTotal(results[2]),
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

  const handleLogout = () => {
    if (!confirm("로그아웃 하시겠습니까?")) return;
    logout();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("정말 탈퇴하시겠습니까?")) return;
    if (!confirm("탈퇴 후 7일 이내 복구 가능합니다. 정말 진행하시겠습니까?")) return;

    setIsDeletingAccount(true);
    try {
      await api.delete("/users/me");
      logout();
      router.push("/login");
    } catch {
      alert("회원탈퇴 처리 중 오류가 발생했습니다.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await uploadImage(file, "profiles");
      await api.patch("/users/me", { profileImage: result.url });
      setUser({ ...user!, profileImage: result.url });
    } catch {
      // 업로드 실패 시 무시
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <p className="text-[15px] text-gray-500">로그인이 필요합니다</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
      {/* 프로필 영역 */}
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleProfileImageChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-[22px] font-bold text-white overflow-hidden group"
        >
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt="프로필"
              className="h-full w-full object-cover"
            />
          ) : (
            getInitial(user.name)
          )}
          {/* 카메라 아이콘 오버레이 */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            {isUploading ? (
              <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            )}
          </div>
        </button>
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
        ) : isCompany ? (
          /* 업체 전용 활동 요약 */
          <>
          {subscription && (() => {
            const start = new Date(subscription.currentPeriodStart).getTime();
            const end = new Date(subscription.currentPeriodEnd).getTime();
            const now = Date.now();
            const totalDays = Math.max(1, Math.ceil((end - start) / 86400000));
            const remainingDays = Math.max(0, Math.ceil((end - now) / 86400000));
            const remainingPercent = Math.min(100, Math.round((remainingDays / totalDays) * 100));
            const fillColor = remainingPercent >= 50 ? "#22c55e" : remainingPercent >= 20 ? "#eab308" : "#ef4444";
            return (
              <div className="mt-3 mb-3 relative rounded-xl border border-gray-200 overflow-hidden p-4"
                style={{ background: `linear-gradient(to right, ${fillColor}20 ${remainingPercent}%, white ${remainingPercent}%)` }}
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-gray-700">구독 상태</span>
                    <SubscriptionBadge tier={subscription.tier} />
                    {subscription.isTrial && (
                      <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700">체험</span>
                    )}
                  </div>
                  <span className="text-[12px] text-gray-500">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString("ko-KR")}까지
                  </span>
                </div>
                <div className="relative z-10 mt-1.5 text-[11px] font-medium text-gray-500">
                  {remainingDays}일 남음 / 총 {totalDays}일
                </div>
              </div>
            );
          })()}
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Link
              href="/estimates/submitted"
              className="rounded-xl border border-gray-200 bg-white p-4 text-center transition-colors hover:bg-gray-50"
            >
              <p className="text-[22px] font-bold text-gray-900">{companyStats.submittedEstimates}</p>
              <p className="mt-1 text-[13px] text-gray-500">제출 견적</p>
            </Link>
            <Link
              href="/mypage/reviews"
              className="rounded-xl border border-gray-200 bg-white p-4 text-center transition-colors hover:bg-gray-50"
            >
              <p className="text-[22px] font-bold text-gray-900">{companyStats.receivedReviews}</p>
              <p className="mt-1 text-[13px] text-gray-500">받은 리뷰</p>
            </Link>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-[22px] font-bold text-gray-900">{companyStats.completedMatchings}</p>
              <p className="mt-1 text-[13px] text-gray-500">완료 매칭</p>
            </div>
          </div>
          </>
        ) : (
          /* 일반 유저 활동 요약 */
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Link
              href="/matching"
              className="rounded-xl border border-gray-200 bg-white p-4 text-center transition-colors hover:bg-gray-50"
            >
              <p className="text-[22px] font-bold text-gray-900">{userStats.estimateRequests}</p>
              <p className="mt-1 text-[13px] text-gray-500">견적요청</p>
            </Link>
            <Link
              href="/matching"
              className="rounded-xl border border-gray-200 bg-white p-4 text-center transition-colors hover:bg-gray-50"
            >
              <p className="text-[22px] font-bold text-gray-900">{userStats.estimates}</p>
              <p className="mt-1 text-[13px] text-gray-500">받은 견적</p>
            </Link>
            <Link
              href="/matching"
              className="rounded-xl border border-gray-200 bg-white p-4 text-center transition-colors hover:bg-gray-50"
            >
              <p className="text-[22px] font-bold text-gray-900">{userStats.completedMatchings}</p>
              <p className="mt-1 text-[13px] text-gray-500">완료 매칭</p>
            </Link>
            <Link
              href="/mypage/reviews"
              className="rounded-xl border border-gray-200 bg-white p-4 text-center transition-colors hover:bg-gray-50"
            >
              <p className="text-[22px] font-bold text-gray-900">{userStats.reviews}</p>
              <p className="mt-1 text-[13px] text-gray-500">작성 리뷰</p>
            </Link>
          </div>
        )}
      </div>

      {/* 바로가기 메뉴 */}
      <div className="mt-10">
        <h2 className="text-[15px] font-semibold text-gray-900">바로가기</h2>
        <div className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {/* 리뷰 - 공통 (역할에 따라 라벨만 다름) */}
          <Link
            href="/mypage/reviews"
            className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className="text-[14px] font-medium text-gray-800">
                {isCompany ? "받은 리뷰 확인" : "내 리뷰 관리"}
              </span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>

          {isCompany ? (
            /* 업체 전용 바로가기 */
            <>
              <Link
                href="/mypage/company-edit"
                className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span className="text-[14px] font-medium text-gray-800">프로필 편집</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
              <Link
                href="/estimates"
                className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="text-[14px] font-medium text-gray-800">견적 리스트</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
              <Link
                href="/estimates/submitted"
                className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  <span className="text-[14px] font-medium text-gray-800">내 견적</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
              <Link
                href="/pricing"
                className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                  <span className="text-[14px] font-medium text-gray-800">요금제</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </>
          ) : (
            /* 일반 유저 전용 바로가기 */
            <>
              <Link
                href="/mypage/user-edit"
                className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span className="text-[14px] font-medium text-gray-800">내 정보 수정</span>
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
            </>
          )}

          {/* 채팅 - 공통 */}
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
        </div>
      </div>

      {/* 계정 관리 */}
      <div className="mt-10">
        <h2 className="text-[15px] font-semibold text-gray-900">계정 관리</h2>
        <div className="mt-3 flex gap-3">
          <button
            onClick={handleLogout}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-5 py-3 text-[14px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            로그아웃
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={isDeletingAccount}
            className="flex-1 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-[14px] font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            {isDeletingAccount ? "처리 중..." : "회원탈퇴"}
          </button>
        </div>
      </div>
    </div>
  );
}
