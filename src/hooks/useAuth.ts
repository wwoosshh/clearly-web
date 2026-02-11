import { useAuthStore } from "@/stores/auth.store";

/**
 * 인증 관련 커스텀 훅
 * 세션 복원은 AuthProvider에서 1회만 수행합니다.
 */
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    logout,
    setUser,
  } = useAuthStore();

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
