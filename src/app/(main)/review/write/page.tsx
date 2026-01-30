"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui/Spinner";
import api from "@/lib/api";

export default function ReviewWritePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-6 py-10">
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" className="text-gray-400" />
          </div>
        </div>
      }
    >
      <ReviewWriteContent />
    </Suspense>
  );
}

function ReviewWriteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const matchingId = searchParams.get("matchingId");
  const companyId = searchParams.get("companyId");

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="flex items-center justify-center py-20">
          <p className="text-[15px] text-gray-500">로그인이 필요합니다</p>
        </div>
      </div>
    );
  }

  if (!matchingId || !companyId) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="text-center py-20">
          <p className="text-[15px] text-gray-500">잘못된 접근입니다.</p>
          <button
            onClick={() => router.push("/chat")}
            className="mt-4 text-[14px] font-medium text-gray-700 underline"
          >
            채팅으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("별점을 선택해주세요.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      await api.post("/reviews", {
        matchingId,
        rating,
        content: content.trim() || undefined,
      });
      router.push(`/companies/${companyId}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "리뷰 작성에 실패했습니다.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1 text-[14px] text-gray-500 hover:text-gray-700"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        뒤로가기
      </button>

      <h1 className="text-[22px] font-bold text-gray-900">리뷰 작성</h1>
      <p className="mt-1 text-[14px] text-gray-500">
        거래가 완료되었습니다. 서비스에 대한 솔직한 평가를 남겨주세요.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      )}

      {/* 별점 */}
      <div className="mt-8">
        <label className="text-[14px] font-medium text-gray-800">
          별점 <span className="text-red-500">*</span>
        </label>
        <div className="mt-3 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill={star <= activeRating ? "#1f2937" : "none"}
                stroke={star <= activeRating ? "#1f2937" : "#d1d5db"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-[14px] font-medium text-gray-900">
              {rating}점
            </span>
          )}
        </div>
      </div>

      {/* 리뷰 내용 */}
      <div className="mt-6">
        <label className="text-[14px] font-medium text-gray-800">
          리뷰 내용
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="서비스 이용 경험을 자유롭게 작성해주세요 (선택)"
          rows={5}
          maxLength={2000}
          className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-[14px] leading-relaxed resize-none placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 focus:outline-none"
        />
        <div className="mt-1 text-right text-[12px] text-gray-400">
          {content.length}/2000
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => router.push(`/companies/${companyId}`)}
          className="flex h-[46px] flex-1 items-center justify-center rounded-lg border border-gray-200 text-[14px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          건너뛰기
        </button>
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className="flex h-[46px] flex-1 items-center justify-center rounded-lg bg-gray-900 text-[14px] font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "등록중..." : "리뷰 등록"}
        </button>
      </div>
    </div>
  );
}
