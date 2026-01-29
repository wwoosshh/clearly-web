"use client";

import Link from "next/link";
import type { CompanySearchResult } from "@/types";

interface CompanyCardProps {
  company: CompanySearchResult;
}

function CompanyCard({ company }: CompanyCardProps) {
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
    <div className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
      {/* 상단: 업체명 + 평점 */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-bold text-gray-900 truncate">
            {company.businessName}
          </h3>
          {company.address && (
            <p className="mt-1 text-[13px] text-gray-500 truncate">
              {company.address}
              {company.detailAddress ? ` ${company.detailAddress}` : ""}
            </p>
          )}
        </div>

        {/* 거리 */}
        {company.distance != null && (
          <span className="flex-shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[12px] font-medium text-gray-700">
            {company.distance < 1
              ? `${Math.round(company.distance * 1000)}m`
              : `${company.distance}km`}
          </span>
        )}
      </div>

      {/* 평점 + 리뷰수 + 매칭수 + 응답속도 */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px]">
        {/* 평점 */}
        <span className="flex items-center gap-1 text-gray-700">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="#facc15"
            stroke="#facc15"
            strokeWidth="1"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span className="font-semibold">
            {company.averageRating != null
              ? Number(company.averageRating).toFixed(1)
              : "-"}
          </span>
          <span className="text-gray-400">({company.totalReviews})</span>
        </span>

        {/* 매칭수 */}
        <span className="text-gray-400">|</span>
        <span className="text-gray-600">
          매칭 {company.totalMatchings}건
        </span>

        {/* 응답속도 */}
        {responseTimeText && (
          <>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">
              평균 응답 {responseTimeText}
            </span>
          </>
        )}
      </div>

      {/* 전문분야 태그 */}
      {company.specialties && company.specialties.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {company.specialties.map((specialty) => (
            <span
              key={specialty}
              className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[12px] font-medium text-gray-600"
            >
              {specialty}
            </span>
          ))}
        </div>
      )}

      {/* 예상 가격대 */}
      {priceRange && (
        <p className="mt-3 text-[13px] text-gray-700">
          <span className="font-medium text-gray-500">예상 가격</span>{" "}
          <span className="font-semibold">{priceRange}</span>
        </p>
      )}

      {/* 하단 버튼 */}
      <div className="mt-4 flex gap-2">
        <Link
          href={`/companies/${company.id}`}
          className="flex h-[38px] flex-1 items-center justify-center rounded-lg border border-gray-200 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          상세 보기
        </Link>
        <Link
          href={`/chat?companyId=${company.id}`}
          className="flex h-[38px] flex-1 items-center justify-center rounded-lg bg-gray-900 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
        >
          채팅 상담
        </Link>
      </div>
    </div>
  );
}

export { CompanyCard };
export type { CompanyCardProps };
