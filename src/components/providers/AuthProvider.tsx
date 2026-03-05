"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useSubscriptionStore } from "@/stores/subscription.store";
import SubscriptionPaymentPopup from "@/components/subscription/SubscriptionPaymentPopup";
import { refreshAccessToken } from "@/lib/api";

/** tokenExp 쿠키에서 만료 시각(초 단위 Unix timestamp) 읽기 */
function getTokenExpFromCookie(): number | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith("tokenExp="));
  if (!match) return null;
  const val = parseInt(match.split("=")[1], 10);
  return isNaN(val) ? null : val;
}

/** 레거시: localStorage의 JWT payload에서 exp 읽기 */
function getTokenExp(token: string | null): number | null {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const payload = JSON.parse(atob(base64));
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

/** 토큰이 만료되었거나 bufferSec 이내에 만료 예정인지 확인 */
function isTokenExpiringSoon(bufferSec: number): boolean {
  // 쿠키에서 우선 확인
  const cookieExp = getTokenExpFromCookie();
  if (cookieExp !== null) {
    return Date.now() / 1000 >= cookieExp - bufferSec;
  }
  // 레거시: localStorage 토큰
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;
  const exp = getTokenExp(token);
  if (exp === null) return true;
  return Date.now() / 1000 >= exp - bufferSec;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const { user, isAuthenticated } = useAuthStore();
  const { fetchSubscription, setShowPaymentPopup } =
    useSubscriptionStore();

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingRef = useRef(false);

  /** /auth/refresh 호출하여 쿠키 갱신 — api.ts의 공유 함수 사용 (#4 fix) */
  const refreshTokens = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    try {
      const success = await refreshAccessToken();
      if (success) {
        // 갱신 성공 → 새 tokenExp 쿠키 기반으로 타이머 재설정
        scheduleRefresh();
      }
    } catch {
      // 갱신 실패 시 401 인터셉터에 위임
    } finally {
      isRefreshingRef.current = false;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** tokenExp 쿠키 기준으로 만료 2분 전 타이머 설정 */
  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    // 쿠키에서 만료 시간 읽기, 없으면 레거시 localStorage 토큰
    const exp =
      getTokenExpFromCookie() ??
      getTokenExp(useAuthStore.getState().accessToken);
    if (exp === null) return;

    const refreshAt = exp - 120; // 만료 2분 전
    const delayMs = (refreshAt - Date.now() / 1000) * 1000;

    if (delayMs <= 0) {
      refreshTokens();
    } else {
      refreshTimerRef.current = setTimeout(refreshTokens, delayMs);
    }
  }, [refreshTokens]);

  // 세션 복원
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // 인증 상태 변경 시 선제적 갱신 타이머 설정
  useEffect(() => {
    if (isAuthenticated) {
      scheduleRefresh();
    } else {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    }

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [isAuthenticated, scheduleRefresh]);

  // 탭 복귀 시 토큰 만료 확인 → 갱신
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return;
      if (!useAuthStore.getState().isAuthenticated) return;

      if (isTokenExpiringSoon(120)) {
        refreshTokens();
      } else {
        scheduleRefresh();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshTokens, scheduleRefresh]);

  // 구독 정보 조회
  useEffect(() => {
    if (isAuthenticated && user?.role === "COMPANY") {
      fetchSubscription();
    }
  }, [isAuthenticated, user, fetchSubscription]);

  // 구독 데이터 로딩이 완료된 후에만 팝업 판단
  const subscriptionLoaded = useSubscriptionStore((s) => s.subscriptionLoaded);

  useEffect(() => {
    if (isAuthenticated && user?.role === "COMPANY" && subscriptionLoaded) {
      const currentSub = useSubscriptionStore.getState().subscription;
      if (currentSub === null || currentSub.isTrial === true) {
        setShowPaymentPopup(true);
      }
    }
  }, [isAuthenticated, user, subscriptionLoaded, setShowPaymentPopup]);

  return (
    <>
      {children}
      <SubscriptionPaymentPopup />
    </>
  );
}
