import { create } from "zustand";
import api from "@/lib/api";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheState {
  entries: Record<string, CacheEntry<any>>;
  set: <T>(key: string, data: T) => void;
  get: <T>(key: string, maxAge?: number) => T | null;
  invalidate: (key: string) => void;
  invalidatePrefix: (prefix: string) => void;
}

const DEFAULT_MAX_AGE = 5 * 60 * 1000; // 5분
const MAX_ENTRIES = 100;

export const useCacheStore = create<CacheState>((set, get) => ({
  entries: {},

  set: <T>(key: string, data: T) => {
    set((state) => {
      const newEntries = {
        ...state.entries,
        [key]: { data, timestamp: Date.now() },
      };

      // LRU: MAX_ENTRIES 초과 시 가장 오래된 항목 제거
      const keys = Object.keys(newEntries);
      if (keys.length > MAX_ENTRIES) {
        const sorted = keys.sort(
          (a, b) => newEntries[a].timestamp - newEntries[b].timestamp,
        );
        const removeCount = keys.length - MAX_ENTRIES;
        for (let i = 0; i < removeCount; i++) {
          delete newEntries[sorted[i]];
        }
      }

      return { entries: newEntries };
    });
  },

  get: <T>(key: string, maxAge = DEFAULT_MAX_AGE): T | null => {
    const entry = get().entries[key];
    if (!entry) return null;
    if (Date.now() - entry.timestamp > maxAge) return null;
    return entry.data as T;
  },

  invalidate: (key: string) => {
    set((state) => {
      const entries = { ...state.entries };
      delete entries[key];
      return { entries };
    });
  },

  invalidatePrefix: (prefix: string) => {
    set((state) => {
      const entries = { ...state.entries };
      for (const key of Object.keys(entries)) {
        if (key.startsWith(prefix)) delete entries[key];
      }
      return { entries };
    });
  },
}));

/**
 * Stale-While-Revalidate 패턴의 API 호출 함수.
 * 1) 캐시에 데이터가 있으면 즉시 반환 (stale)
 * 2) 백그라운드에서 최신 데이터 fetch (revalidate)
 * 3) fetch 완료 시 캐시 갱신 + onUpdate 콜백 호출
 */
export async function fetchWithCache<T>(
  key: string,
  url: string,
  params?: Record<string, any>,
  options?: {
    maxAge?: number;
    onUpdate?: (data: T) => void;
  },
): Promise<T> {
  const cache = useCacheStore.getState();
  const cached = cache.get<T>(key, options?.maxAge);

  // 캐시 있으면 즉시 반환 + 백그라운드 revalidate
  if (cached !== null) {
    // 백그라운드 revalidate
    api.get(url, { params }).then((res) => {
      const fresh = res.data.data ?? res.data;
      cache.set(key, fresh);
      options?.onUpdate?.(fresh);
    }).catch(() => {});

    return cached;
  }

  // 캐시 없으면 네트워크 요청
  const res = await api.get(url, { params });
  const data = res.data.data ?? res.data;
  cache.set(key, data);
  return data;
}
