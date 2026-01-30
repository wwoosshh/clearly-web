import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";

/**
 * 인증 관련 커스텀 훅
 * 앱 마운트 시 세션 복원을 자동으로 수행합니다.
 */
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    logout,
    restoreSession,
    setUser,
  } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    logout,
    setUser,
  };
}
