import { useState, useEffect, useRef, useCallback } from "react";
import api from "@/lib/api";

export interface AddressSuggestion {
  address: string;
  roadAddress: string;
  jibunAddress: string;
  placeName?: string;
  latitude: number;
  longitude: number;
}

export function useAddressSuggestions(query: string, debounceMs = 300) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 이전 타이머 취소
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 2글자 미만이면 초기화
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    timerRef.current = setTimeout(async () => {
      // 이전 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const { data } = await api.get<AddressSuggestion[]>(
          "/address/suggestions",
          {
            params: { query: query.trim() },
            signal: controller.signal,
          }
        );

        if (!controller.signal.aborted) {
          setSuggestions(Array.isArray(data) ? data : []);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError" && err.name !== "CanceledError") {
          setSuggestions([]);
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query, debounceMs]);

  const clear = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setSuggestions([]);
    setIsLoading(false);
  }, []);

  return { suggestions, isLoading, clear };
}
