"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" className="text-[#0EA5E9]" />
        </div>
      }
    >
      <SearchRedirect />
    </Suspense>
  );
}

/**
 * /search 경로는 메인 페이지(/)로 리다이렉트합니다.
 * 쿼리 파라미터(keyword, specialty, sortBy 등)는 그대로 유지합니다.
 */
function SearchRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const params = searchParams.toString();
    router.replace(params ? `/?${params}` : "/");
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center py-20">
      <Spinner size="lg" className="text-[#0EA5E9]" />
    </div>
  );
}
