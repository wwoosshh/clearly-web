"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui/Spinner";
import api from "@/lib/api";
import type { CompanySearchResult } from "@/types";

interface ReviewItem {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  user: { id: string; name: string };
  matching: {
    id: string;
    cleaningType: string;
    address: string;
    estimatedPrice: number | null;
    completedAt: string | null;
  };
}

interface ReviewListResponse {
  data: ReviewItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const isCompany = user?.role === "COMPANY";
  const companyId = params.id as string;

  const [company, setCompany] = useState<CompanySearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewMeta, setReviewMeta] = useState<ReviewListResponse["meta"] | null>(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  useEffect(() => {
    async function fetchCompany() {
      try {
        const { data } = await api.get(`/companies/${companyId}`);
        const result = (data as any)?.data ?? data;
        setCompany(result);
      } catch {
        setError("업체 정보를 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCompany();
  }, [companyId]);

  const fetchReviews = useCallback(async (page: number) => {
    setIsLoadingReviews(true);
    try {
      const { data } = await api.get(`/reviews/company/${companyId}?page=${page}&limit=5`);
      const result = (data as any)?.data ?? data;
      setReviews(result.data || []);
      setReviewMeta(result.meta || null);
    } catch {
      // silent
    } finally {
      setIsLoadingReviews(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchReviews(reviewPage);
  }, [reviewPage, fetchReviews]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" className="text-gray-400" />
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="text-center py-20">
          <p className="text-[15px] text-gray-500">{error || "업체를 찾을 수 없습니다."}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-[14px] font-medium text-gray-700 underline"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (min: number | null, max: number | null) => {
    if (min == null && max == null) return null;
    const fmt = (n: number) =>
      n >= 10000
        ? `${Math.floor(n / 10000)}만${n % 10000 ? (n % 10000).toLocaleString() : ""}원`
        : `${n.toLocaleString()}원`;
    if (min != null && max != null) return `${fmt(min)} ~ ${fmt(max)}`;
    if (min != null) return `${fmt(min)} ~`;
    return `~ ${fmt(max!)}`;
  };

  const formatResponseTime = (minutes: number | null) => {
    if (minutes == null) return null;
    if (minutes < 60) return `${minutes}분`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
  };

  const priceRange = formatPrice(company.minPrice, company.maxPrice);
  const responseTimeText = formatResponseTime(company.responseTime);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
      {/* 뒤로가기 */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1 text-[14px] text-gray-500 hover:text-gray-700"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        뒤로가기
      </button>

      {/* 업체명 + 기본 정보 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900">
              {company.businessName}
            </h1>
            {company.address && (
              <p className="mt-2 text-[14px] text-gray-500">
                {company.address}
                {company.detailAddress ? ` ${company.detailAddress}` : ""}
              </p>
            )}
          </div>
          {company.distance != null && (
            <span className="flex-shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-[13px] font-medium text-gray-700">
              {company.distance < 1
                ? `${Math.round(company.distance * 1000)}m`
                : `${company.distance}km`}
            </span>
          )}
        </div>

        {/* 평점 + 통계 */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-[14px]">
          <span className="flex items-center gap-1.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="font-bold text-gray-900">
              {company.averageRating != null
                ? Number(company.averageRating).toFixed(1)
                : "-"}
            </span>
            <span className="text-gray-400">({company.totalReviews}개 리뷰)</span>
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600">매칭 {company.totalMatchings}건</span>
          {responseTimeText && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">평균 응답 {responseTimeText}</span>
            </>
          )}
        </div>

        {/* 전문분야 */}
        {company.specialties && company.specialties.length > 0 && (
          <div className="mt-5">
            <h3 className="text-[13px] font-medium text-gray-500 mb-2">전문분야</h3>
            <div className="flex flex-wrap gap-2">
              {company.specialties.map((s) => (
                <span key={s} className="rounded-full bg-gray-100 px-3 py-1 text-[13px] font-medium text-gray-700">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 서비스 지역 */}
        {company.serviceAreas && company.serviceAreas.length > 0 && (
          <div className="mt-4">
            <h3 className="text-[13px] font-medium text-gray-500 mb-2">서비스 지역</h3>
            <div className="flex flex-wrap gap-2">
              {company.serviceAreas.map((area) => (
                <span key={area} className="rounded-full border border-gray-200 px-3 py-1 text-[13px] text-gray-600">
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 가격대 */}
        {priceRange && (
          <div className="mt-4">
            <h3 className="text-[13px] font-medium text-gray-500 mb-1">예상 가격대</h3>
            <p className="text-[16px] font-bold text-gray-900">{priceRange}</p>
          </div>
        )}

        {/* 업체 소개 */}
        {company.description && (
          <div className="mt-5 border-t border-gray-100 pt-5">
            <h3 className="text-[13px] font-medium text-gray-500 mb-2">업체 소개</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">
              {company.description}
            </p>
          </div>
        )}
      </div>

      {/* 리뷰 목록 */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold text-gray-900">
            리뷰
            {reviewMeta && (
              <span className="ml-1.5 text-[14px] font-normal text-gray-400">
                {reviewMeta.total}
              </span>
            )}
          </h2>
        </div>

        {isLoadingReviews && reviews.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <Spinner size="md" className="text-gray-400" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[14px] text-gray-400">아직 작성된 리뷰가 없습니다.</p>
          </div>
        ) : (
          <div>
            <div className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <div key={review.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold text-gray-900">
                        {review.user.name}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill={star <= review.rating ? "#1f2937" : "none"}
                            stroke={star <= review.rating ? "#1f2937" : "#d1d5db"}
                            strokeWidth="1.5"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <span className="text-[12px] text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>

                  {review.content && (
                    <p className="mt-2 text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                      {review.content}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-[12px] text-gray-500">
                      {review.matching.cleaningType === "MOVE_IN" ? "입주청소" :
                       review.matching.cleaningType === "MOVE_OUT" ? "이사청소" :
                       review.matching.cleaningType === "REGULAR" ? "정기청소" :
                       review.matching.cleaningType === "SPECIAL" ? "특수청소" :
                       review.matching.cleaningType === "OFFICE" ? "사무실청소" :
                       review.matching.cleaningType}
                    </span>
                    {review.matching.completedAt && (
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-[12px] text-gray-500">
                        {new Date(review.matching.completedAt).toLocaleDateString("ko-KR")} 완료
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {reviewMeta && reviewMeta.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-1 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                  disabled={reviewPage <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                {Array.from({ length: reviewMeta.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setReviewPage(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${
                      p === reviewPage
                        ? "bg-gray-900 text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setReviewPage((p) => Math.min(reviewMeta.totalPages, p + 1))}
                  disabled={reviewPage >= reviewMeta.totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 md:relative md:border-0 md:bg-transparent md:p-0 md:mt-4">
        <div className="mx-auto flex max-w-3xl gap-3">
          <Link
            href="/search"
            className="flex h-[46px] flex-1 items-center justify-center rounded-lg border border-gray-200 text-[14px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            목록으로
          </Link>
          {isCompany ? (
            <button
              disabled
              className="flex h-[46px] flex-1 items-center justify-center rounded-lg bg-gray-300 text-[14px] font-medium text-gray-500 cursor-not-allowed"
            >
              채팅 상담
            </button>
          ) : (
            <Link
              href={`/chat?companyId=${company.id}`}
              className="flex h-[46px] flex-1 items-center justify-center rounded-lg bg-gray-900 text-[14px] font-medium text-white transition-colors hover:bg-gray-800"
            >
              채팅 상담
            </Link>
          )}
        </div>
      </div>

      {/* 하단 고정 버튼 공간 확보 (모바일) */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
