"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui/Spinner";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { CLEANING_TYPE_LABELS } from "@/types";
import type { CleaningType } from "@/types";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

interface ReviewItem {
  id: string;
  rating: number;
  content?: string;
  isVisible: boolean;
  createdAt: string;
  company?: { id: string; businessName: string };
  user?: { id: string; name: string };
  matching?: {
    id: string;
    cleaningType?: string;
    address?: string;
    completedAt?: string;
  };
}

interface ReviewMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function MyReviewsPage() {
  const { user } = useAuthStore();
  const isCompany = user?.role === "COMPANY";

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [meta, setMeta] = useState<ReviewMeta>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  // 수정 모달 (유저 전용)
  const [editTarget, setEditTarget] = useState<ReviewItem | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // 삭제 모달 (유저 전용)
  const [deleteTarget, setDeleteTarget] = useState<ReviewItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadReviews(page);
  }, [user, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadReviews = async (p: number) => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/reviews/my", { params: { page: p, limit: 10 } });
      const result = (data as any)?.data ?? data;
      setReviews(result?.data ?? []);
      setMeta(result?.meta ?? { total: 0, page: p, limit: 10, totalPages: 0 });
    } catch {
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("ko-KR");
  };

  const openEdit = (review: ReviewItem) => {
    setEditTarget(review);
    setEditRating(review.rating);
    setEditContent(review.content || "");
    setEditError("");
  };

  const handleSave = async () => {
    if (!editTarget) return;
    if (editRating === 0) {
      setEditError("별점을 선택해주세요.");
      return;
    }
    setEditError("");
    setIsSaving(true);
    try {
      await api.patch(`/reviews/${editTarget.id}`, {
        rating: editRating,
        content: editContent.trim() || undefined,
      });
      setEditTarget(null);
      loadReviews(page);
    } catch (err: any) {
      setEditError(err?.response?.data?.message || "수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/reviews/${deleteTarget.id}`);
      setDeleteTarget(null);
      if (reviews.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadReviews(page);
      }
    } catch {
      // silent
    } finally {
      setIsDeleting(false);
    }
  };

  const renderStars = (rating: number, size = 16) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={star <= rating ? "#f59e0b" : "none"}
            stroke={star <= rating ? "#f59e0b" : "#e2ddd6"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
    );
  };

  const editActiveRating = editHoverRating || editRating;

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <p className="text-[15px] text-[#72706a]">로그인이 필요합니다</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
      <motion.div variants={stagger} initial="hidden" animate="show">
        {/* 헤더 */}
        <motion.div variants={fadeUp}>
          <Link
            href="/mypage"
            className="mb-6 flex items-center gap-1 text-[14px] text-[#72706a] hover:text-[#1a1918] transition-colors press-scale"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            마이페이지
          </Link>
        </motion.div>

        <motion.div variants={fadeUp}>
          <h1 className="text-[24px] font-bold tracking-tight text-[#141412]">
            {isCompany ? "받은 리뷰" : "내 리뷰"}
          </h1>
          <p className="mt-1.5 text-[15px] text-[#72706a]">
            {isCompany ? "고객이 남긴 리뷰를 확인하세요" : "내가 작성한 리뷰를 관리하세요"}
          </p>
        </motion.div>

        {/* 리뷰 목록 */}
        {isLoading ? (
          <motion.div variants={fadeUp} className="flex items-center justify-center py-20">
            <Spinner size="lg" className="text-[#4a8c6a]" />
          </motion.div>
        ) : reviews.length === 0 ? (
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0ede8]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a8a49c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <p className="mt-4 text-[15px] font-medium text-[#1a1918]">
              {isCompany ? "받은 리뷰가 없습니다" : "작성한 리뷰가 없습니다"}
            </p>
            <p className="mt-1.5 text-[13px] text-[#72706a]">
              {isCompany ? "거래를 완료하면 고객이 리뷰를 남길 수 있습니다" : "거래 완료 후 리뷰를 작성할 수 있습니다"}
            </p>
            {!isCompany && (
              <Link
                href="/estimate/request"
                className="mt-4 rounded-lg bg-[#2d6a4f] px-5 py-2.5 text-[13px] font-medium text-[#f5f3ee] hover:bg-[#235840] transition-colors press-scale"
              >
                견적 요청하기
              </Link>
            )}
          </motion.div>
        ) : (
          <>
            <motion.div
              variants={fadeUp}
              className="mt-6 divide-y divide-[#e2ddd6] rounded-xl border border-[#e2ddd6] bg-[#f5f3ee]"
            >
              {reviews.map((review) => (
                <div key={review.id} className="px-5 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-bold text-[#141412]">
                          {isCompany
                            ? (review.user?.name || "고객")
                            : (review.company?.businessName || "업체")}
                        </span>
                        {renderStars(review.rating)}
                      </div>
                      {review.content && (
                        <p className="mt-1.5 text-[14px] leading-relaxed text-[#1a1918] line-clamp-2">
                          {review.content}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        {review.matching?.cleaningType && (
                          <span className="rounded-full bg-[#d4ede4] px-2 py-0.5 text-[12px] font-medium text-[#2d6a4f]">
                            {CLEANING_TYPE_LABELS[review.matching.cleaningType as CleaningType] || review.matching.cleaningType}
                          </span>
                        )}
                        <span className="text-[12px] text-[#a8a49c]">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                    {/* 수정/삭제 버튼은 일반 유저만 */}
                    {!isCompany && (
                      <div className="ml-4 flex flex-shrink-0 items-center gap-1">
                        <button
                          onClick={() => openEdit(review)}
                          className="rounded-md px-2.5 py-1.5 text-[13px] font-medium text-[#72706a] transition-colors hover:bg-[#f0ede8] hover:text-[#1a1918] press-scale"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => setDeleteTarget(review)}
                          className="rounded-md px-2.5 py-1.5 text-[13px] font-medium text-red-500 transition-colors hover:bg-red-50 press-scale"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* 페이지네이션 */}
            {meta.totalPages > 1 && (
              <motion.div variants={fadeUp} className="mt-6 flex items-center justify-center gap-1">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="flex h-[34px] w-[34px] items-center justify-center rounded-lg text-[#72706a] transition-colors hover:bg-[#f0ede8] disabled:opacity-30 disabled:cursor-not-allowed press-scale"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (meta.totalPages <= 7) return true;
                    if (p === 1 || p === meta.totalPages) return true;
                    if (Math.abs(p - page) <= 1) return true;
                    return false;
                  })
                  .reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                      acc.push("ellipsis");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "ellipsis" ? (
                      <span key={`e-${idx}`} className="px-1 text-[13px] text-[#a8a49c]">...</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item as number)}
                        className={cn(
                          "flex h-[34px] w-[34px] items-center justify-center rounded-lg text-[13px] font-medium transition-colors press-scale",
                          page === item
                            ? "bg-[#2d6a4f] text-[#f5f3ee]"
                            : "text-[#72706a] hover:bg-[#f0ede8]"
                        )}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= meta.totalPages}
                  className="flex h-[34px] w-[34px] items-center justify-center rounded-lg text-[#72706a] transition-colors hover:bg-[#f0ede8] disabled:opacity-30 disabled:cursor-not-allowed press-scale"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      {/* 수정 모달 (유저 전용) */}
      {!isCompany && (
        <Modal
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
          title="리뷰 수정"
        >
          {editTarget && (
            <div>
              {editError && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600">
                  {editError}
                </div>
              )}

              <div>
                <label className="text-[14px] font-medium text-[#141412]">
                  별점 <span className="text-red-500">*</span>
                </label>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      onMouseEnter={() => setEditHoverRating(star)}
                      onMouseLeave={() => setEditHoverRating(0)}
                      className="p-0.5 press-scale"
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill={star <= editActiveRating ? "#f59e0b" : "none"}
                        stroke={star <= editActiveRating ? "#f59e0b" : "#e2ddd6"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  ))}
                  {editRating > 0 && (
                    <span className="ml-2 text-[14px] font-medium text-[#141412]">
                      {editRating}점
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="text-[14px] font-medium text-[#141412]">리뷰 내용</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="서비스 이용 경험을 자유롭게 작성해주세요 (선택)"
                  rows={4}
                  maxLength={2000}
                  className="mt-2 w-full rounded-lg border border-[#e2ddd6] px-4 py-3 text-[14px] leading-relaxed resize-none placeholder:text-[#a8a49c] focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 focus:outline-none transition-colors"
                />
                <div className="mt-1 text-right text-[12px] text-[#a8a49c]">
                  {editContent.length}/2000
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setEditTarget(null)}
                  className="flex h-[38px] flex-1 items-center justify-center rounded-lg border border-[#e2ddd6] bg-[#f0ede8] text-[13px] font-medium text-[#1a1918] transition-colors hover:bg-[#e8e4de] press-scale"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={editRating === 0 || isSaving}
                  className="flex h-[38px] flex-1 items-center justify-center rounded-lg bg-[#2d6a4f] text-[13px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#235840] disabled:opacity-50 disabled:cursor-not-allowed press-scale"
                >
                  {isSaving ? "저장중..." : "저장"}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* 삭제 확인 모달 (유저 전용) */}
      {!isCompany && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="리뷰 삭제"
          size="sm"
        >
          {deleteTarget && (
            <div>
              <p className="text-[14px] text-[#72706a]">정말 삭제하시겠습니까? 삭제된 리뷰는 복구할 수 없습니다.</p>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex h-[38px] flex-1 items-center justify-center rounded-lg border border-[#e2ddd6] bg-[#f0ede8] text-[13px] font-medium text-[#1a1918] transition-colors hover:bg-[#e8e4de] press-scale"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex h-[38px] flex-1 items-center justify-center rounded-lg bg-red-600 text-[13px] font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 press-scale"
                >
                  {isDeleting ? "삭제중..." : "삭제"}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
