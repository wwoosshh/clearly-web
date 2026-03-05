import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/stores/auth.store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/** Axios 인스턴스 생성 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // httpOnly 쿠키 자동 전송
  headers: {
    "Content-Type": "application/json",
  },
});

/** 토큰 갱신 중복 요청 방지 플래그 */
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;
let failedQueue: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

/** 대기 큐 처리 */
function processQueue(error: unknown) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
}

/** 요청 인터셉터: 레거시 localStorage 토큰 호환 (과도기) */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/** 강제 로그아웃: auth store 초기화 + 로그인 페이지 리다이렉트 */
function forceLogout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  // Zustand auth store 즉시 초기화 (#2 fix)
  const store = useAuthStore.getState();
  if (store.isAuthenticated) {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  }

  if (
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/login")
  ) {
    window.location.href = "/login";
  }
}

/** 응답 인터셉터: 401 에러 시 쿠키 기반 토큰 갱신, 403 시 강제 로그아웃 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      skipAuthRefresh?: boolean;
    };

    // 403: 권한 박탈 → 강제 로그아웃 (#6 fix)
    if (error.response?.status === 403 && !originalRequest.skipAuthRefresh) {
      forceLogout();
      return Promise.reject(error);
    }

    // skipAuthRefresh 플래그가 있으면 refresh 사이클 건너뜀
    // (예: restoreSession의 /auth/me → 미로그인 상태에서 401은 정상)
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.skipAuthRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(api(originalRequest)),
            reject,
          });
        });
      }

      originalRequest._retry = true;

      try {
        const success = await refreshAccessToken();
        if (!success) throw new Error("refresh failed");

        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        forceLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * 공유 토큰 갱신 함수 - AuthProvider와 인터셉터가 동일한 refresh를 사용 (#4 fix)
 * 동시 호출 시 하나의 요청만 실행하고 나머지는 같은 Promise를 공유
 */
export async function refreshAccessToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    try {
      await refreshPromise;
      return true;
    } catch {
      return false;
    }
  }

  isRefreshing = true;
  refreshPromise = axios
    .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
    .then(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    });

  try {
    await refreshPromise;
    return true;
  } catch {
    return false;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

export default api;
