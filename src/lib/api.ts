import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/** Axios 인스턴스 생성 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/** 토큰 갱신 중복 요청 방지 플래그 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/** 대기 큐 처리 */
function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
}

/** Zustand store에서 refreshToken 가져오기 (순환 의존 방지를 위한 lazy import) */
function getRefreshToken(): string | null {
  try {
    // dynamic import 대신 직접 store 접근
    const { useAuthStore } = require("@/stores/auth.store");
    return useAuthStore.getState().refreshToken;
  } catch {
    return null;
  }
}

/** Zustand store에 새 토큰 저장 */
function setTokensInStore(accessToken: string, refreshToken: string) {
  try {
    const { useAuthStore } = require("@/stores/auth.store");
    useAuthStore.setState({ accessToken, refreshToken });
  } catch {
    // store 접근 실패 시 무시
  }
}

/** 요청 인터셉터: Access Token 자동 첨부 */
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

/** 응답 인터셉터: 401 에러 시 토큰 갱신 시도 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 에러이고 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 이미 refresh 중이면 큐에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // refreshToken은 메모리(Zustand store)에서만 가져옴
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = data.data;

        // accessToken만 localStorage에 저장
        localStorage.setItem("accessToken", accessToken);
        // refreshToken은 메모리(store)에만 저장
        setTokensInStore(accessToken, newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // 토큰 갱신 실패 시 로그아웃 처리
        localStorage.removeItem("accessToken");

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
