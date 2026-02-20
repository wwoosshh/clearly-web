"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

interface Review {
  id: string;
  rating: number;
  content: string;
  isVisible: boolean;
  createdAt: string;
  user: { id: string; name: string; email: string };
  company: { id: string; businessName: string };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [visibleFilter, setVisibleFilter] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 20 };
      if (visibleFilter) params.isVisible = visibleFilter;
      if (minRating) params.minRating = minRating;
      if (maxRating) params.maxRating = maxRating;
      const { data } = await api.get("/admin/reviews", { params });
      setReviews(data.data.data);
      setMeta(data.data.meta);
    } catch {
      // 에러 무시
    } finally {
      setIsLoading(false);
    }
  }, [page, visibleFilter, minRating, maxRating]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggleVisibility = async (reviewId: string) => {
    setTogglingId(reviewId);
    try {
      await api.patch(`/admin/reviews/${reviewId}/toggle-visibility`);
      await fetchReviews();
    } catch {
      alert("상태 변경에 실패했습니다.");
    } finally {
      setTogglingId(null);
    }
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString("ko-KR") : "-";

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-bold text-[#141412]">리뷰 관리</h1>
        <p className="mt-1 text-sm text-[#72706a]">리뷰를 관리하고 표시/숨김을 제어합니다.</p>
      </motion.div>

      {/* 필터 */}
      <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-3">
        <select
          value={visibleFilter}
          onChange={(e) => { setVisibleFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-[#e2ddd6] bg-white px-3 py-2 text-[13px] text-[#1a1918] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10"
        >
          <option value="">전체</option>
          <option value="true">표시</option>
          <option value="false">숨김</option>
        </select>
        <select
          value={minRating}
          onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
          className="rounded-lg border border-[#e2ddd6] bg-white px-3 py-2 text-[13px] text-[#1a1918] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10"
        >
          <option value="">최소 별점</option>
          <option value="1">1점 이상</option>
          <option value="2">2점 이상</option>
          <option value="3">3점 이상</option>
          <option value="4">4점 이상</option>
          <option value="5">5점</option>
        </select>
        <select
          value={maxRating}
          onChange={(e) => { setMaxRating(e.target.value); setPage(1); }}
          className="rounded-lg border border-[#e2ddd6] bg-white px-3 py-2 text-[13px] text-[#1a1918] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10"
        >
          <option value="">최대 별점</option>
          <option value="1">1점 이하</option>
          <option value="2">2점 이하</option>
          <option value="3">3점 이하</option>
          <option value="4">4점 이하</option>
          <option value="5">5점</option>
        </select>
      </motion.div>

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#2d6a4f]" />
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div variants={fadeUp} className="mt-4 overflow-hidden rounded-xl border border-[#e2ddd6] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#e2ddd6] bg-[#f0ede8]">
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">작성자</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">업체</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">별점</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">내용</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">표시</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">날짜</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#72706a]">
                        리뷰가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    reviews.map((review) => (
                      <tr key={review.id} className="border-b border-[#e2ddd6] last:border-0 hover:bg-[#f5f3ee]">
                        <td className="px-4 py-3 text-[13px] text-[#1a1918]">{review.user?.name || "-"}</td>
                        <td className="px-4 py-3 text-[13px] text-[#1a1918]">{review.company?.businessName || "-"}</td>
                        <td className="px-4 py-3 text-[13px] text-[#72706a]">
                          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </td>
                        <td className="max-w-[200px] px-4 py-3 text-[12px] text-[#72706a] truncate">
                          {review.content}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            review.isVisible ? "bg-[#eef7f3] text-[#2d6a4f]" : "bg-red-50 text-red-600"
                          )}>
                            {review.isVisible ? "표시" : "숨김"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#72706a]">{formatDate(review.createdAt)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleVisibility(review.id)}
                            disabled={togglingId === review.id}
                            className={cn(
                              "rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:opacity-50",
                              review.isVisible
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-[#2d6a4f] text-[#f5f3ee] hover:bg-[#4a8c6a]"
                            )}
                          >
                            {review.isVisible ? "숨김" : "표시"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {meta && meta.totalPages > 1 && (
            <motion.div variants={fadeUp} className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-[#e2ddd6] bg-[#f0ede8] px-3 py-1.5 text-[13px] font-medium text-[#1a1918] transition-colors hover:bg-[#e2ddd6] disabled:opacity-40"
              >
                이전
              </button>
              <span className="text-[13px] text-[#72706a]">{page} / {meta.totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="rounded-lg border border-[#e2ddd6] bg-[#f0ede8] px-3 py-1.5 text-[13px] font-medium text-[#1a1918] transition-colors hover:bg-[#e2ddd6] disabled:opacity-40"
              >
                다음
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
