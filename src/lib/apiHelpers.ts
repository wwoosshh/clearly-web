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
 * TransformInterceptor가 { success, data, timestamp }로 래핑하고,
 * 서비스가 { data: T[], meta } 를 반환하는 이중 래핑을 안전하게 처리.
 */
export function unwrapPaginatedResponse<T>(
  response: AxiosResponse
): { data: T[]; meta: PaginationMeta } {
  const body = response.data;
  // 1단계: TransformInterceptor 래핑 제거 → 서비스 반환값
  const inner =
    body != null && typeof body === "object" && "data" in body
      ? (body as Record<string, unknown>).data
      : body;
  // 2단계: 서비스가 { data: T[], meta } 형태를 반환한 경우
  if (
    inner != null &&
    typeof inner === "object" &&
    !Array.isArray(inner) &&
    "data" in (inner as Record<string, unknown>)
  ) {
    const paginated = inner as { data: unknown; meta?: PaginationMeta };
    return {
      data: Array.isArray(paginated.data) ? paginated.data : [],
      meta: paginated.meta ?? { total: 0, page: 1, limit: 10, totalPages: 1 },
    };
  }
  // 서비스가 배열을 직접 반환한 경우
  return {
    data: Array.isArray(inner) ? (inner as T[]) : [],
    meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
  };
}

/**
 * 알림 응답 전용 추출 (unreadCount 포함).
 * TransformInterceptor 이중 래핑을 안전하게 처리.
 */
export function unwrapNotificationResponse<T>(
  response: AxiosResponse
): { data: T[]; meta: PaginationMeta; unreadCount: number } {
  const body = response.data;
  // 1단계: TransformInterceptor 래핑 제거
  const inner =
    body != null && typeof body === "object" && "data" in body
      ? (body as Record<string, unknown>).data
      : body;
  // 2단계: 서비스가 { data: T[], meta, unreadCount } 형태를 반환한 경우
  if (inner != null && typeof inner === "object" && !Array.isArray(inner)) {
    const obj = inner as Record<string, unknown>;
    return {
      data: Array.isArray(obj.data) ? (obj.data as T[]) : [],
      meta: (obj.meta as PaginationMeta) ?? { total: 0, page: 1, limit: 10, totalPages: 1 },
      unreadCount: typeof obj.unreadCount === "number" ? obj.unreadCount : 0,
    };
  }
  return {
    data: Array.isArray(inner) ? (inner as T[]) : [],
    meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
    unreadCount: 0,
  };
}
