"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui/Spinner";
import api from "@/lib/api";

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      setError("인증 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    // 1회용 코드를 서버에 POST하여 실제 토큰 교환
    api
      .post("/auth/oauth/exchange", { code })
      .then(({ data }) => {
        const { tokens, isNewUser } = data.data;

        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);

        return api.get("/auth/me").then(({ data: meData }) => {
          document.cookie = `userRole=${meData.data.role}; path=/; max-age=${7 * 24 * 3600}; SameSite=Strict`;
          useAuthStore.setState({
            user: meData.data,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
          router.replace(isNewUser ? "/" : "/");
        });
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        setError("로그인 처리에 실패했습니다. 다시 시도해주세요.");
      });
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-[14px] text-red-500">{error}</p>
          <a href="/login" className="mt-4 inline-block text-[13px] text-gray-600 underline">
            로그인 페이지로 이동
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto text-gray-400" />
        <p className="mt-4 text-[14px] text-gray-500">로그인 처리 중...</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Spinner size="lg" className="text-gray-400" /></div>}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
