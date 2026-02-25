"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useSubscriptionStore } from "@/stores/subscription.store";
import SubscriptionPaymentPopup from "@/components/subscription/SubscriptionPaymentPopup";
import axios from "axios";

/** JWT payload에서 exp(만료 시각, 초 단위 Unix timestamp)를 추출 */
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
function isTokenExpiringSoon(
  token: string | null,
  bufferSec: number
): boolean {
  const exp = getTokenExp(token);
  if (exp === null) return true; // exp를 알 수 없으면 갱신 시도
  return Date.now() / 1000 >= exp - bufferSec;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const { user, isAuthenticated } = useAuthStore();
  const { subscription, fetchSubscription, setShowPaymentPopup } =
    useSubscriptionStore();

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingRef = useRef(false);

  /** /auth/refresh 호출하여 토큰 갱신 */
  const refreshTokens = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    try {
      const refreshToken =
        useAuthStore.getState().refreshToken ||
        localStorage.getItem("refreshToken");

      if (!refreshToken) {
        isRefreshingRef.current = false;
        return;
      }

      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const { data } = await axios.post(`${apiBaseUrl}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      useAuthStore.setState({
        accessToken,
        refreshToken: newRefreshToken,
      });

      // 갱신 성공 → 다음 타이머 설정
      scheduleRefresh(accessToken);
    } catch {
      // 갱신 실패 시 로그아웃하지 않음 — 다음 API 호출 시 401 인터셉터에 위임
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  /** accessToken의 exp 기준으로 만료 2분 전 타이머 설정 */
  const scheduleRefresh = useCallback(
    (token: string | null) => {
      // 기존 타이머 제거
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      const exp = getTokenExp(token);
      if (exp === null) return;

      // 만료 2분 전(120초)에 갱신
      const refreshAt = exp - 120;
      const delayMs = (refreshAt - Date.now() / 1000) * 1000;

      if (delayMs <= 0) {
        // 이미 만료 임박 → 즉시 갱신
        refreshTokens();
      } else {
        refreshTimerRef.current = setTimeout(refreshTokens, delayMs);
      }
    },
    [refreshTokens]
  );

  // 세션 복원
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // 인증 상태 변경 시 선제적 갱신 타이머 설정
  useEffect(() => {
    if (isAuthenticated) {
      const token = useAuthStore.getState().accessToken;
      scheduleRefresh(token);
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

      const token = useAuthStore.getState().accessToken;
      // 만료되었거나 2분 이내 만료 예정이면 즉시 갱신
      if (isTokenExpiringSoon(token, 120)) {
        refreshTokens();
      } else {
        // 아직 여유 있으면 타이머 재설정
        scheduleRefresh(token);
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
