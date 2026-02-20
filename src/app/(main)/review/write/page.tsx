"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui/Spinner";
import api from "@/lib/api";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

export default function ReviewWritePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" className="text-[#4a8c6a]" />
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
  const [images, setImages] = useState<string[]>([]);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex items-center justify-center py-20">
          <p className="text-[15px] text-[#72706a]">로그인이 필요합니다</p>
        </div>
      </div>
    );
  }

  if (!matchingId || !companyId) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="text-center py-20">
          <p className="text-[15px] text-[#72706a]">잘못된 접근입니다.</p>
          <button
            onClick={() => router.push("/chat")}
            className="mt-4 text-[14px] font-medium text-[#1a1918] underline"
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
        images: images.length > 0 ? images : undefined,
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
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-10">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex flex-col"
      >
        <motion.div variants={fadeUp}>
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-1 text-[14px] text-[#72706a] hover:text-[#1a1918] transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            뒤로가기
          </button>

          <h1 className="text-[22px] font-bold text-[#141412]">리뷰 작성</h1>
          <p className="mt-1 text-[14px] text-[#72706a]">
            거래가 완료되었습니다. 서비스에 대한 솔직한 평가를 남겨주세요.
          </p>
        </motion.div>

        {error && (
          <motion.div variants={fadeUp}>
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600">
              {error}
            </div>
          </motion.div>
        )}

        {/* 별점 */}
        <motion.div variants={fadeUp} className="mt-8">
          <label className="text-[14px] font-medium text-[#1a1918]">
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
                className="p-0.5 press-scale"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill={star <= activeRating ? "#f59e0b" : "none"}
                  stroke={star <= activeRating ? "#f59e0b" : "#d1d5db"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-[14px] font-medium text-[#141412]">
                {rating}점
              </span>
            )}
          </div>
        </motion.div>

        {/* 리뷰 내용 */}
        <motion.div variants={fadeUp} className="mt-6">
          <label className="text-[14px] font-medium text-[#1a1918]">
            리뷰 내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="서비스 이용 경험을 자유롭게 작성해주세요 (선택)"
            rows={5}
            maxLength={2000}
            className="mt-2 w-full rounded-lg border border-[#e2ddd6] px-4 py-3 text-[14px] leading-relaxed resize-none placeholder:text-[#a8a49c] focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 focus:outline-none transition-colors"
          />
          <div className="mt-1 text-right text-[12px] text-[#a8a49c]">
            {content.length}/2000
          </div>
        </motion.div>

        {/* 사진 첨부 */}
        <motion.div variants={fadeUp} className="mt-6">
          <ImageUpload
            label="사진 첨부 (선택)"
            maxFiles={5}
            bucket="reviews"
            value={images}
            onChange={setImages}
          />
        </motion.div>

        {/* 제출 버튼 */}
        <motion.div variants={fadeUp} className="mt-8 flex gap-3">
          <button
            onClick={() => router.push(`/companies/${companyId}`)}
            className="press-scale flex h-[46px] flex-1 items-center justify-center rounded-lg border border-[#e2ddd6] text-[14px] font-medium text-[#1a1918] transition-colors hover:bg-[#f0ede8]"
          >
            건너뛰기
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="press-scale flex h-[46px] flex-1 items-center justify-center rounded-lg bg-[#2d6a4f] text-[14px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#235840] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "등록중..." : "리뷰 등록"}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
