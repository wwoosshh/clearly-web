import { create } from "zustand";
import type { AuthTokens, LoginRequest, User } from "@/types";
import api from "@/lib/api";

interface AuthState {
  /** 현재 로그인한 사용자 */
  user: User | null;
  /** Access Token */
  accessToken: string | null;
  /** Refresh Token */
  refreshToken: string | null;
  /** 인증 상태 로딩 여부 */
  isLoading: boolean;
  /** 로그인 여부 */
  isAuthenticated: boolean;

  /** 로그인 */
  login: (credentials: LoginRequest) => Promise<void>;
  /** 로그아웃 */
  logout: () => void;
  /** 토큰으로 사용자 정보 복원 */
  restoreSession: () => Promise<void>;
  /** 사용자 정보 업데이트 */
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken:
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null,
  refreshToken:
    typeof window !== "undefined"
      ? localStorage.getItem("refreshToken")
      : null,
  isLoading: false,
  isAuthenticated: false,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<{
        data: { user: User; tokens: AuthTokens };
      }>("/auth/login", credentials);

      const { user, tokens } = data.data;

      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);

      set({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  restoreSession: async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const { data } = await api.get<{ data: User }>("/auth/me");
      set({
        user: data.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setUser: (user: User) => {
    set({ user });
  },
}));
