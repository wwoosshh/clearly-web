import { create } from "zustand";
import type { AuthTokens, LoginRequest, User } from "@/types";
import api from "@/lib/api";

/** JWT payload에서 기본 유저 정보를 디코딩 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

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
  /** 초기 세션 복원 완료 여부 */
  isInitialized: boolean;

  /** 로그인 */
  login: (credentials: LoginRequest) => Promise<void>;
  /** 로그아웃 */
  logout: () => void;
  /** 토큰으로 사용자 정보 복원 */
  restoreSession: () => Promise<void>;
  /** 사용자 정보 업데이트 */
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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
  isInitialized: false,

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
        isInitialized: true,
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
    // 이미 초기화 완료된 경우 중복 호출 방지
    if (get().isInitialized) return;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (!token) {
      set({ isAuthenticated: false, isLoading: false, isInitialized: true });
      return;
    }

    // Optimistic UI: JWT에서 기본 유저 정보를 즉시 디코딩하여 먼저 표시
    const payload = decodeJwtPayload(token);
    if (payload?.sub && payload?.email && payload?.role) {
      set({
        user: {
          id: payload.sub as string,
          email: payload.email as string,
          name: (payload.name as string) || "",
          phone: "",
          role: payload.role as User["role"],
          createdAt: "",
          updatedAt: "",
        },
        accessToken: token,
        isAuthenticated: true,
        isLoading: true,
        isInitialized: true,
      });
    } else {
      set({ isLoading: true });
    }

    // 백그라운드에서 최신 유저 데이터로 동기화
    try {
      const { data } = await api.get<{ data: User }>("/auth/me");
      set({
        user: data.data,
        accessToken: token,
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
        isInitialized: true,
      });
    }
  },

  setUser: (user: User) => {
    set({ user });
  },
}));
