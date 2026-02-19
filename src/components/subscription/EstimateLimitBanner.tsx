"use client";

import { useEffect } from "react";
import { useSubscriptionStore } from "@/stores/subscription.store";

export default function EstimateLimitBanner() {
  const { estimateLimit, fetchEstimateLimit } = useSubscriptionStore();

  useEffect(() => {
    fetchEstimateLimit();
  }, [fetchEstimateLimit]);

  if (!estimateLimit) return null;

  const usagePercent = estimateLimit.limit > 0
    ? Math.round((estimateLimit.used / estimateLimit.limit) * 100)
    : 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="text-[13px] text-gray-600">
          오늘 견적 제출
        </div>
        <div className="text-[13px] font-semibold text-gray-900">
          {estimateLimit.used} / {estimateLimit.limit}건
        </div>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn_bar(usagePercent)}
          style={{ width: `${Math.min(100, usagePercent)}%` }}
        />
      </div>
      {estimateLimit.remaining <= 0 && (
        <p className="mt-1.5 text-[12px] text-red-500">
          오늘의 견적 제출 한도를 모두 사용했습니다.
        </p>
      )}
    </div>
  );
}

function cn_bar(percent: number) {
  if (percent >= 100) return "h-full rounded-full bg-red-500 transition-all";
  if (percent >= 80) return "h-full rounded-full bg-amber-500 transition-all";
  return "h-full rounded-full bg-gray-900 transition-all";
}
