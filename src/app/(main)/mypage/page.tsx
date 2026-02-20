"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth.store";
import { useSubscriptionStore } from "@/stores/subscription.store";
import { useCacheStore, fetchWithCache } from "@/stores/cache.store";
import SubscriptionBadge from "@/components/subscription/SubscriptionBadge";
import { Spinner } from "@/components/ui/Spinner";
import api from "@/lib/api";
import { uploadImage } from "@/lib/upload";
import FadeIn from "@/components/animation/FadeIn";
import ScrollReveal from "@/components/animation/ScrollReveal";

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

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export default function MyPage() {
  const { user, setUser, logout, isLoading: isAuthLoading } = useAuthStore();
  const router = useRouter();
  const isCompany = user?.role === "COMPANY";
  const { subscription, subscriptionStack, fetchSubscription, fetchSubscriptionStack } = useSubscriptionStore();
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
      fetchSubscriptionStack();
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
    const cache = useCacheStore.getState();
    const cached = cache.get<UserStats>("mypage:userStats", 3 * 60 * 1000);
    if (cached) {
      setUserStats(cached);
      setIsLoading(false);
      fetchUserStatsFromApi().then((stats) => {
        cache.set("mypage:userStats", stats);
        setUserStats(stats);
      });
      return;
    }
    setIsLoading(true);
    const stats = await fetchUserStatsFromApi();
    cache.set("mypage:userStats", stats);
    setUserStats(stats);
    setIsLoading(false);
  };

  const fetchUserStatsFromApi = async (): Promise<UserStats> => {
    const results = await Promise.allSettled([
      api.get("/estimates/requests", { params: { page: 1, limit: 1 } }),
      api.get("/estimates/my", { params: { page: 1, limit: 1 } }),
      api.get("/matchings/requests", { params: { page: 1, limit: 1 } }),
      api.get("/reviews/my", { params: { page: 1, limit: 1 } }),
    ]);
    return {
      estimateRequests: extractTotal(results[0]),
      estimates: extractTotal(results[1]),
      completedMatchings: extractTotal(results[2]),
      reviews: extractTotal(results[3]),
    };
  };

  const loadCompanyStats = async () => {
    const cache = useCacheStore.getState();
    const cached = cache.get<CompanyStats>("mypage:companyStats", 3 * 60 * 1000);
    if (cached) {
      setCompanyStats(cached);
      setIsLoading(false);
      fetchCompanyStatsFromApi().then((stats) => {
        cache.set("mypage:companyStats", stats);
        setCompanyStats(stats);
      });
      return;
    }
    setIsLoading(true);
    const stats = await fetchCompanyStatsFromApi();
    cache.set("mypage:companyStats", stats);
    setCompanyStats(stats);
    setIsLoading(false);
  };

  const fetchCompanyStatsFromApi = async (): Promise<CompanyStats> => {
    const results = await Promise.allSettled([
      api.get("/estimates/company-estimates", { params: { page: 1, limit: 1 } }),
      api.get("/reviews/my", { params: { page: 1, limit: 1 } }),
      api.get("/matchings/requests", { params: { page: 1, limit: 1 } }),
    ]);
    return {
      submittedEstimates: extractTotal(results[0]),
      receivedReviews: extractTotal(results[1]),
      completedMatchings: extractTotal(results[2]),
    };
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
        <p className="text-[15px] text-[#72706a]">로그인이 필요합니다</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
      {/* 프로필 영역 */}
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.div variants={fadeUp} className="flex items-center gap-4">
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
            className="relative flex h-16 w-16 items-center justify-center rounded-full text-[22px] font-bold text-[#f5f3ee] overflow-hidden group"
            style={{ backgroundColor: "#2d6a4f" }}
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
              <h1 className="text-[20px] font-bold text-[#141412]">{user.name}</h1>
              <span className="rounded-full bg-[#eef7f3] px-2.5 py-0.5 text-[12px] font-medium text-[#2d6a4f]">
                {ROLE_LABELS[user.role] || user.role}
              </span>
            </div>
            <p className="mt-0.5 text-[14px] text-[#72706a]">{user.email}</p>
            <div className="mt-1 flex items-center gap-3 text-[13px] text-[#a8a49c]">
              {isAuthLoading ? (
                <span className="inline-block h-4 w-40 animate-pulse rounded bg-[#e2ddd6]" />
              ) : (
                <>
                  {user.phone && <span>{user.phone}</span>}
                  <span>가입일 {formatDate(user.createdAt)}</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 활동 요약 */}
      <ScrollReveal>
        <div className="mt-8">
          <h2 className="text-[15px] font-semibold text-[#1a1918]">활동 요약</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="md" className="text-[#4a8c6a]" />
            </div>
          ) : isCompany ? (
            <>
              {subscription && (() => {
                const start = new Date(subscription.currentPeriodStart).getTime();
                const end = new Date(subscription.currentPeriodEnd).getTime();
                const now = Date.now();
                const totalDays = Math.max(1, Math.ceil((end - start) / 86400000));
                const remainingDays = Math.max(0, Math.ceil((end - now) / 86400000));
                const remainingPercent = Math.min(100, Math.round((remainingDays / totalDays) * 100));
                const fillColor = remainingPercent >= 50 ? "#2d6a4f" : remainingPercent >= 20 ? "#eab308" : "#ef4444";
                return (
                  <div
                    className="mt-3 mb-3 relative rounded-xl border border-[#e2ddd6] overflow-hidden p-4"
                    style={{ background: `linear-gradient(to right, ${fillColor}18 ${remainingPercent}%, white ${remainingPercent}%)` }}
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-[#1a1918]">구독 상태</span>
                        <SubscriptionBadge tier={subscription.tier} />
                        {subscription.isTrial && (
                          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700">체험</span>
                        )}
                      </div>
                      <span className="text-[12px] text-[#72706a]">
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString("ko-KR")}까지
                      </span>
                    </div>
                    <div className="relative z-10 mt-1.5 text-[11px] font-medium text-[#72706a]">
                      {remainingDays}일 남음 / 총 {totalDays}일
                    </div>
                  </div>
                );
              })()}
              {subscriptionStack.filter((s) => s.status === "PAUSED" || s.status === "QUEUED").length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-[12px] font-medium text-[#72706a]">대기 중인 구독</p>
                  {subscriptionStack
                    .filter((s) => s.status === "PAUSED" || s.status === "QUEUED")
                    .map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded-lg border border-[#e2ddd6] bg-white px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            s.plan.tier === "BASIC" ? "bg-[#f0ede8] text-[#72706a]" :
                            s.plan.tier === "PRO" ? "bg-[#eef7f3] text-[#2d6a4f]" :
                            "bg-[#141412] text-[#f5f3ee]"
                          }`}>
                            {s.plan.tier}
                          </span>
                          <span className="text-[13px] font-medium text-[#1a1918]">{s.plan.name}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            s.status === "PAUSED" ? "bg-yellow-50 text-yellow-700" : "bg-[#eef7f3] text-[#2d6a4f]"
                          }`}>
                            {s.status === "PAUSED" ? "일시정지" : "대기"}
                          </span>
                          {s.isTrial && (
                            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700">체험</span>
                          )}
                        </div>
                        <span className="text-[12px] text-[#a8a49c]">
                          {new Date(s.projectedStart || s.currentPeriodStart).toLocaleDateString("ko-KR")} ~ {new Date(s.projectedEnd || s.currentPeriodEnd).toLocaleDateString("ko-KR")} (예상)
                        </span>
                      </div>
                    ))}
                </div>
              )}
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Link
                  href="/estimates/submitted"
                  className="hover-lift rounded-xl border border-[#e2ddd6] bg-white p-4 text-center"
                >
                  <p className="text-[22px] font-bold text-[#2d6a4f]">{companyStats.submittedEstimates}</p>
                  <p className="mt-1 text-[13px] text-[#72706a]">제출 견적</p>
                </Link>
                <Link
                  href="/mypage/reviews"
                  className="hover-lift rounded-xl border border-[#e2ddd6] bg-white p-4 text-center"
                >
                  <p className="text-[22px] font-bold text-[#2d6a4f]">{companyStats.receivedReviews}</p>
                  <p className="mt-1 text-[13px] text-[#72706a]">받은 리뷰</p>
                </Link>
                <div className="rounded-xl border border-[#e2ddd6] bg-white p-4 text-center">
                  <p className="text-[22px] font-bold text-[#2d6a4f]">{companyStats.completedMatchings}</p>
                  <p className="mt-1 text-[13px] text-[#72706a]">완료 매칭</p>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Link
                href="/matching"
                className="hover-lift rounded-xl border border-[#e2ddd6] bg-white p-4 text-center"
              >
                <p className="text-[22px] font-bold text-[#2d6a4f]">{userStats.estimateRequests}</p>
                <p className="mt-1 text-[13px] text-[#72706a]">견적요청</p>
              </Link>
              <Link
                href="/matching"
                className="hover-lift rounded-xl border border-[#e2ddd6] bg-white p-4 text-center"
              >
                <p className="text-[22px] font-bold text-[#2d6a4f]">{userStats.estimates}</p>
                <p className="mt-1 text-[13px] text-[#72706a]">받은 견적</p>
              </Link>
              <Link
                href="/matching"
                className="hover-lift rounded-xl border border-[#e2ddd6] bg-white p-4 text-center"
              >
                <p className="text-[22px] font-bold text-[#2d6a4f]">{userStats.completedMatchings}</p>
                <p className="mt-1 text-[13px] text-[#72706a]">완료 매칭</p>
              </Link>
              <Link
                href="/mypage/reviews"
                className="hover-lift rounded-xl border border-[#e2ddd6] bg-white p-4 text-center"
              >
                <p className="text-[22px] font-bold text-[#2d6a4f]">{userStats.reviews}</p>
                <p className="mt-1 text-[13px] text-[#72706a]">작성 리뷰</p>
              </Link>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* 바로가기 메뉴 */}
      <ScrollReveal delay={0.1}>
        <div className="mt-10">
          <h2 className="text-[15px] font-semibold text-[#1a1918]">바로가기</h2>
          <div className="mt-3 divide-y divide-[#f0ede8] rounded-xl border border-[#e2ddd6] bg-white overflow-hidden">
            <Link
              href="/mypage/reviews"
              className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#f0ede8]"
            >
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a8c6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="text-[14px] font-medium text-[#1a1918]">
                  {isCompany ? "받은 리뷰 확인" : "내 리뷰 관리"}
                </span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>

            {isCompany ? (
              <>
                <Link href="/customers" className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#f0ede8]">
                  <div className="flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a8c6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span className="text-[14px] font-medium text-[#1a1918]">고객 관리</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
                <Link href="/mypage/company-edit" className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#f0ede8]">
                  <div className="flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a8c6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span className="text-[14px] font-medium text-[#1a1918]">프로필 편집</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
                <Link href="/estimates" className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#f0ede8]">
                  <div className="flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a8c6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="text-[14px] font-medium text-[#1a1918]">견적 리스트</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
                <Link href="/estimates/submitted" className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#f0ede8]">
                  <div className="flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a8c6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 11 12 14 22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    <span className="text-[14px] font-medium text-[#1a1918]">내 견적</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
                <Link href="/pricing" className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#f0ede8]">
                  <div className="flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a8c6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    <span className="text-[14px] font-medium text-[#1a1918]">요금제</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
              </>
            ) : (
              <>
                <Link href="/mypage/user-edit" className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#f0ede8]">
                  <div className="flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a8c6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span className="text-[14px] font-medium text-[#1a1918]">내 정보 수정</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
                <Link href="/matching" className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#f0ede8]">
                  <div className="flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a8c6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="text-[14px] font-medium text-[#1a1918]">매칭 내역</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
                <Link href="/search" className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#f0ede8]">
                  <div className="flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a8c6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span className="text-[14px] font-medium text-[#1a1918]">업체 찾기</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
              </>
            )}

            <Link href="/chat" className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#f0ede8]">
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a8c6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-[14px] font-medium text-[#1a1918]">채팅</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          </div>
        </div>
      </ScrollReveal>

      {/* 계정 관리 */}
      <ScrollReveal delay={0.2}>
        <div className="mt-10">
          <h2 className="text-[15px] font-semibold text-[#1a1918]">계정 관리</h2>
          <div className="mt-3 flex gap-3">
            <button
              onClick={handleLogout}
              className="press-scale flex-1 rounded-xl border border-[#e2ddd6] bg-white px-5 py-3 text-[14px] font-medium text-[#72706a] transition-colors hover:bg-[#f0ede8]"
            >
              로그아웃
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="press-scale flex-1 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-[14px] font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              {isDeletingAccount ? "처리 중..." : "회원탈퇴"}
            </button>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
