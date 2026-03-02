import { create } from "zustand";
import type { LoginRequest, User } from "@/types";
import api from "@/lib/api";
import { chatCache } from "@/lib/chatCache";

/** JWT payload에서 기본 유저 정보를 디코딩 (레거시 localStorage 토큰용) */
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
  /** Access Token (레거시 — 쿠키 전환 후에는 null) */
  accessToken: string | null;
  /** Refresh Token (레거시 — 쿠키 전환 후에는 null) */
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
  logout: () => Promise<void>;
  /** 토큰으로 사용자 정보 복원 */
  restoreSession: () => Promise<void>;
  /** 사용자 정보 업데이트 */
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  // 레거시 localStorage 토큰 — 쿠키 전환 완료 후 제거 예정
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
        data: { user: User };
      }>("/auth/login", credentials);

      const { user } = data.data;
      // 쿠키 기반으로 전환 — localStorage 저장 제거
      // userRole 쿠키는 미들웨어 서버사이드 보호용
      document.cookie = `userRole=${user.role}; path=/; max-age=${7 * 24 * 3600}; SameSite=Strict`;

      set({
        user,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // 네트워크 오류 무시
    }

    // 레거시 localStorage 정리
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    document.cookie = "userRole=; path=/; max-age=0; SameSite=Strict";
    chatCache.clearAll();

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  restoreSession: async () => {
    if (get().isInitialized) return;

    // 레거시 localStorage 토큰 확인
    const legacyToken =
      typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    if (!legacyToken) {
      // 쿠키 기반: /auth/me로 세션 확인
      set({ isLoading: true });
      try {
        const { data } = await api.get<{ data: User }>("/auth/me");
        document.cookie = `userRole=${data.data.role}; path=/; max-age=${7 * 24 * 3600}; SameSite=Strict`;
        set({
          user: data.data,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      } catch {
        set({ isAuthenticated: false, isLoading: false, isInitialized: true });
      }
      return;
    }

    // 레거시 localStorage 토큰 있음 → Optimistic UI 후 /auth/me로 동기화
    const payload = decodeJwtPayload(legacyToken);
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
        accessToken: legacyToken,
        isAuthenticated: true,
        isLoading: true,
        isInitialized: true,
      });
    } else {
      set({ isLoading: true });
    }

    try {
      const { data } = await api.get<{ data: User }>("/auth/me");
      // /auth/me 성공 → 쿠키로 전환 완료, localStorage 정리
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      document.cookie = `userRole=${data.data.role}; path=/; max-age=${7 * 24 * 3600}; SameSite=Strict`;
      set({
        user: data.data,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem("accessToken");
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
