import type { AxiosResponse } from "axios";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface WrappedResponse<T> {
  data: T;
  meta?: PaginationMeta;
  unreadCount?: number;
}

/**
 * API 응답에서 data를 안전하게 추출.
 * 서버가 { data: T } 로 감싸 보내는 경우와 바로 T를 보내는 경우를 모두 처리.
 */
export function unwrapResponse<T>(response: AxiosResponse): T {
  const body = response.data;
  if (body != null && typeof body === "object" && "data" in body) {
    return (body as WrappedResponse<T>).data;
  }
  return body as T;
}

/**
 * 페이지네이션 응답 추출.
 * { data: T[], meta: PaginationMeta } 형태를 안전하게 처리.
 */
export function unwrapPaginatedResponse<T>(
  response: AxiosResponse
): { data: T[]; meta: PaginationMeta } {
  const body = response.data;
  if (body != null && typeof body === "object" && "data" in body) {
    const wrapped = body as WrappedResponse<T[]>;
    return {
      data: Array.isArray(wrapped.data) ? wrapped.data : [],
      meta: wrapped.meta ?? { total: 0, page: 1, limit: 10, totalPages: 1 },
    };
  }
  return {
    data: Array.isArray(body) ? body : [],
    meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
  };
}

/**
 * 알림 응답 전용 추출 (unreadCount 포함).
 */
export function unwrapNotificationResponse<T>(
  response: AxiosResponse
): { data: T[]; meta: PaginationMeta; unreadCount: number } {
  const body = response.data;
  const inner =
    body != null && typeof body === "object" && "data" in body ? body : { data: body };
  const wrapped = inner as WrappedResponse<T[]>;
  return {
    data: Array.isArray(wrapped.data) ? wrapped.data : [],
    meta: wrapped.meta ?? { total: 0, page: 1, limit: 10, totalPages: 1 },
    unreadCount: (body as WrappedResponse<T[]>)?.unreadCount ?? 0,
  };
}
