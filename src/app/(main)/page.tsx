"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { useAuthStore } from "@/stores/auth.store";
import { useCacheStore } from "@/stores/cache.store";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { CompanySearchResponse, CompanySearchResult } from "@/types";
import { unwrapPaginatedResponse } from "@/lib/apiHelpers";
import { QuickNav } from "@/components/layout/QuickNav";

/* ── 디자인 토큰 ─────────────────────────────────── */
const C = {
  green: "#2d6a4f",
  greenMid: "#4a8c6a",
  greenLight: "#d6ede2",
  cream: "#f5f3ee",
  text: "#1a1918",
  muted: "#72706a",
  border: "#e2ddd6",
  bg: "#ffffff",
  cardHover: "#fafaf8",
} as const;

/* ── 전문분야 카테고리 (아이콘 포함) ──────────────── */
const CATEGORIES = [
  {
    key: "",
    label: "전체",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    key: "입주청소",
    label: "입주청소",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: "이사청소",
    label: "이사청소",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    key: "거주청소",
    label: "거주청소",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    key: "사무실청소",
    label: "사무실",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="9" y1="6" x2="9" y2="6.01" />
        <line x1="15" y1="6" x2="15" y2="6.01" />
        <line x1="9" y1="10" x2="9" y2="10.01" />
        <line x1="15" y1="10" x2="15" y2="10.01" />
        <line x1="9" y1="14" x2="9" y2="14.01" />
        <line x1="15" y1="14" x2="15" y2="14.01" />
        <path d="M9 18h6v4H9z" />
      </svg>
    ),
  },
  {
    key: "상가청소",
    label: "상가청소",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
        <line x1="9" y1="9" x2="9" y2="9.01" />
        <line x1="9" y1="13" x2="9" y2="13.01" />
        <line x1="9" y1="17" x2="9" y2="17.01" />
      </svg>
    ),
  },
  {
    key: "에어컨청소",
    label: "에어컨",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="10" rx="2" />
        <path d="M6 14v3" />
        <path d="M12 14v6" />
        <path d="M18 14v3" />
        <path d="M9 20c1.5-1 4.5-1 6 0" />
      </svg>
    ),
  },
  {
    key: "카펫청소",
    label: "카펫청소",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="12" rx="1" />
        <path d="M3 10h18" />
        <path d="M7 6v12" />
        <path d="M17 6v12" />
        <path d="M5 18l-2 3" />
        <path d="M19 18l2 3" />
      </svg>
    ),
  },
  {
    key: "외벽청소",
    label: "외벽청소",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M4 8h16" />
        <path d="M4 14h16" />
        <line x1="10" y1="2" x2="10" y2="22" />
      </svg>
    ),
  },
] as const;

const SORT_OPTIONS = [
  { value: "score", label: "추천순" },
  { value: "rating", label: "평점순" },
  { value: "reviews", label: "리뷰많은순" },
  { value: "matchings", label: "매칭많은순" },
  { value: "price_low", label: "가격낮은순" },
  { value: "price_high", label: "가격높은순" },
] as const;

/* ── 배너 타입 ────────────────────────────────── */
interface BannerData {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  bgColor: string;
  linkUrl: string | null;
  linkText: string | null;
  sortOrder: number;
}

/* ════════════════════════════════════════════════════
   배너 캐러셀
════════════════════════════════════════════════════ */
function BannerCarousel({ banners }: { banners: BannerData[] }) {
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 자동 재생
  useEffect(() => {
    if (isDragging || banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((p) => (p + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isDragging, banners.length]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    setIsDragging(false);
    const swipe = info.offset.x + info.velocity.x * 0.3;
    if (swipe < -40) {
      setCurrent((p) => Math.min(p + 1, banners.length - 1));
    } else if (swipe > 40) {
      setCurrent((p) => Math.max(p - 1, 0));
    }
  };

  if (banners.length === 0) return null;

  return (
    <div className="relative overflow-hidden" ref={containerRef}>
      <motion.div
        className="flex"
        animate={{ x: `-${current * 100}%` }}
        transition={{ type: "spring", stiffness: 260, damping: 30, mass: 0.9 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="w-full flex-shrink-0 px-4 pt-4 pb-2 md:px-0"
          >
            <div
              className="relative overflow-hidden rounded-2xl h-[160px] md:h-[200px] md:rounded-2xl flex flex-col justify-center px-7 md:px-12"
              style={{
                background: banner.imageUrl
                  ? `url(${banner.imageUrl}) center/cover`
                  : banner.bgColor,
              }}
            >
              {/* 이미지 위 오버레이 */}
              {banner.imageUrl && (
                <div className="absolute inset-0 bg-black/30" />
              )}

              {/* 장식 요소 */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/[0.06]" />
              <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/[0.04]" />

              <p className="relative text-[19px] font-bold leading-snug tracking-[-0.02em] text-white md:text-[24px]">
                {banner.title}
              </p>
              {banner.subtitle && (
                <p className="relative mt-1.5 text-[13px] leading-relaxed text-white/50 md:text-[14px]">
                  {banner.subtitle}
                </p>
              )}
              {banner.linkUrl && banner.linkText && (
                <Link
                  href={banner.linkUrl}
                  className="relative mt-4 inline-flex h-[34px] w-fit items-center gap-1 rounded-lg px-4 text-[12px] font-semibold text-white/90 transition-all hover:text-white hover:bg-white/25 md:mt-5 md:h-[38px] md:text-[13px]"
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
                >
                  {banner.linkText}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        ))}
      </motion.div>

      {/* 인디케이터 */}
      {banners.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pb-1.5 pt-2.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="relative h-[5px] rounded-full transition-all duration-300"
              style={{
                width: i === current ? 20 : 5,
                background: i === current ? C.green : "#dbd7d0",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* (카테고리 필터는 SortBar 내 드롭다운으로 통합됨) */

/* ════════════════════════════════════════════════════
   검색 바
════════════════════════════════════════════════════ */
function SearchBar({
  keyword,
  onChange,
  onSearch,
}: {
  keyword: string;
  onChange: (v: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="px-4 pb-1 pt-4 md:px-0">
      <div
        className="flex items-center gap-2.5 rounded-2xl border bg-white px-4 transition-all focus-within:border-[#2d6a4f]/40 focus-within:shadow-[0_0_0_3px_rgba(45,106,79,0.06)]"
        style={{ borderColor: C.border, height: 48 }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#b5b0a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={keyword}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder="어떤 청소 서비스를 찾으세요?"
          className="h-full flex-1 bg-transparent text-[14px] text-[#1a1918] placeholder:text-[#c4bfb8] outline-none"
        />
        {keyword && (
          <button
            onClick={() => onChange("")}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8e4dd] text-[#8a8680] transition-colors hover:bg-[#d4d0ca] hover:text-[#5a5854]"
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   업체 리스트 아이템 (당근 스타일)
════════════════════════════════════════════════════ */
function CompanyListItem({
  company,
  isCompany,
}: {
  company: CompanySearchResult;
  isCompany: boolean;
}) {
  const avatarUrl = company.user?.profileImage;
  const photo = Array.isArray(company.profileImages) && company.profileImages.length > 0
    ? company.profileImages[0]
    : null;

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

  const priceRange = formatPrice(company.minPrice, company.maxPrice);

  return (
    <Link
      href={`/companies/${company.id}`}
      className="flex gap-3.5 border-b border-[#f0ede8] px-4 py-4 transition-colors active:bg-[#fafaf8] md:rounded-2xl md:border md:border-[#eae7e1] md:px-5 md:py-5 md:hover:shadow-[0_2px_16px_rgba(0,0,0,0.04)]"
    >
      {/* 썸네일 */}
      <div className="relative h-[104px] w-[104px] flex-shrink-0 overflow-hidden rounded-2xl bg-[#f2efea] md:h-[120px] md:w-[120px]">
        {photo ? (
          <Image
            src={photo}
            alt={company.businessName}
            fill
            className="object-cover"
            sizes="120px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc8c0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          </div>
        )}
        {/* 구독 뱃지 */}
        {company.subscriptionTier && company.subscriptionTier !== "BASIC" && (
          <span
            className="absolute left-2 top-2 rounded-md px-1.5 py-[2px] text-[9px] font-bold tracking-wide text-white shadow-sm"
            style={{
              background: company.subscriptionTier === "PREMIUM" ? "#1a1918" : C.green,
            }}
          >
            {company.subscriptionTier === "PREMIUM" ? "PREMIUM" : "PRO"}
          </span>
        )}
      </div>

      {/* 정보 */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          {/* 업체명 */}
          <h3 className="truncate text-[15px] font-bold text-[#1a1918] md:text-[16px]">
            {company.businessName}
          </h3>
          {company.address && (
            <p className="mt-0.5 truncate text-[12px] text-[#b0aba4] md:text-[13px]">
              {company.address}
            </p>
          )}

          {/* 전문분야 태그 */}
          {company.specialties && company.specialties.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {company.specialties.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="rounded-md bg-[#f2efea] px-2 py-[3px] text-[10px] font-medium text-[#72706a] md:text-[11px]"
                >
                  {s}
                </span>
              ))}
              {company.specialties.length > 3 && (
                <span className="rounded-md bg-[#f2efea] px-2 py-[3px] text-[10px] font-medium text-[#b0aba4]">
                  +{company.specialties.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 하단: 가격 + 평점 */}
        <div className="mt-2 flex items-end justify-between">
          <div>
            {priceRange && (
              <p className="text-[15px] font-bold text-[#1a1918] md:text-[16px]">
                {priceRange}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#b0aba4]">
            {company.averageRating != null && (
              <span className="flex items-center gap-0.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="font-semibold text-[#1a1918]">
                  {Number(company.averageRating).toFixed(1)}
                </span>
                <span>({company.totalReviews})</span>
              </span>
            )}
            {company.totalMatchings > 0 && (
              <span>
                매칭 {company.totalMatchings}건
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ════════════════════════════════════════════════════
   정렬 셀렉트
════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════
   필터 + 정렬 바 (카테고리 드롭다운 + 정렬 드롭다운)
════════════════════════════════════════════════════ */
function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentLabel = options.find((o) => o.value === value)?.label || label;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
          value
            ? "bg-[#2d6a4f]/10 text-[#2d6a4f]"
            : "text-[#72706a] hover:text-[#1a1918]"
        )}
      >
        {currentLabel}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("transition-transform", isOpen && "rotate-180")}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-20 mt-1.5 w-36 rounded-2xl border border-[#eae7e1] bg-white py-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.08)]"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center px-4 py-2 text-[13px] transition-colors",
                  value === opt.value
                    ? "font-semibold text-[#2d6a4f]"
                    : "text-[#72706a] hover:bg-[#f5f3ee]"
                )}
              >
                {opt.label}
                {value === opt.value && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const CATEGORY_OPTIONS = [
  { value: "", label: "전체 카테고리" },
  ...CATEGORIES.filter((c) => c.key !== "").map((c) => ({ value: c.key, label: c.label })),
] as const;

function FilterSortBar({
  total,
  sortBy,
  onSortChange,
  category,
  onCategoryChange,
}: {
  total: number | null;
  sortBy: string;
  onSortChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#f0ede8] px-4 py-2.5 md:px-0">
      <p className="text-[13px] text-[#72706a]">
        {total != null ? (
          <>
            총 <span className="font-semibold text-[#2d6a4f]">{total}</span>개
          </>
        ) : (
          "\u00A0"
        )}
      </p>
      <div className="flex items-center gap-1">
        <FilterDropdown
          label="전체 카테고리"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={onCategoryChange}
        />
        <FilterDropdown
          label="추천순"
          options={SORT_OPTIONS}
          value={sortBy}
          onChange={onSortChange}
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   스켈레톤 로더
════════════════════════════════════════════════════ */
function SkeletonCard() {
  return (
    <div className="flex gap-3.5 border-b border-[#f0ede8] px-4 py-4 md:rounded-2xl md:border md:border-[#eae7e1] md:px-5 md:py-5">
      <div className="h-[104px] w-[104px] flex-shrink-0 animate-pulse rounded-2xl bg-[#edeae4] md:h-[120px] md:w-[120px]" />
      <div className="flex flex-1 flex-col justify-between py-1">
        <div>
          <div className="h-4 w-28 animate-pulse rounded-md bg-[#edeae4]" />
          <div className="mt-2 h-3 w-36 animate-pulse rounded-md bg-[#f2efea]" />
          <div className="mt-3 flex gap-1.5">
            <div className="h-[18px] w-14 animate-pulse rounded-md bg-[#f2efea]" />
            <div className="h-[18px] w-14 animate-pulse rounded-md bg-[#f2efea]" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div className="h-5 w-24 animate-pulse rounded-md bg-[#edeae4]" />
          <div className="h-3 w-20 animate-pulse rounded-md bg-[#f2efea]" />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   메인 페이지 (엔트리)
════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl bg-white lg:max-w-3xl">
          <div className="h-[180px] animate-pulse bg-[#f0ede8]" />
          <div className="px-4 py-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const isCompany = user?.role === "COMPANY";

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("specialty") || ""
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "score"
  );
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [companies, setCompanies] = useState<CompanySearchResult[]>([]);
  const [meta, setMeta] = useState<CompanySearchResponse["meta"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);

  const fetchCompanies = useCallback(
    async (params: {
      keyword?: string;
      specialty?: string;
      sortBy?: string;
      page?: number;
      append?: boolean;
    }) => {
      const cacheKey = `home:${params.keyword || ""}:${params.specialty || ""}:${params.sortBy || "score"}:${params.page || 1}`;
      const cache = useCacheStore.getState();
      const cached = cache.get<{
        companies: CompanySearchResult[];
        meta: CompanySearchResponse["meta"] | null;
      }>(cacheKey, 3 * 60 * 1000);

      if (cached && !params.append) {
        setCompanies(cached.companies);
        setMeta(cached.meta);
        setCurrentPage(params.page || 1);
        setIsLoading(false);
        return;
      }

      if (params.append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const query: Record<string, string | number> = {
          page: params.page || 1,
          limit: 12,
        };
        if (params.keyword) query.keyword = params.keyword;
        if (params.specialty) query.specialty = params.specialty;
        if (params.sortBy) query.sortBy = params.sortBy;

        const response = await api.get<CompanySearchResponse>(
          "/companies/search",
          { params: query }
        );

        const { data: list, meta: resultMeta } =
          unwrapPaginatedResponse<CompanySearchResult>(response);
        cache.set(cacheKey, { companies: list, meta: resultMeta });

        if (params.append) {
          setCompanies((prev) => [...prev, ...list]);
        } else {
          setCompanies(list);
        }
        setMeta(resultMeta);
        setCurrentPage(params.page || 1);
      } catch {
        if (!cached && !params.append) {
          setCompanies([]);
          setMeta(null);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  // 배너 로드
  useEffect(() => {
    api.get("/banners").then(({ data: res }) => {
      const payload = res.data ?? res;
      setBanners(Array.isArray(payload) ? payload : []);
    }).catch(() => {});
  }, []);

  // 초기 로드
  useEffect(() => {
    fetchCompanies({
      keyword: searchParams.get("keyword") || "",
      specialty: searchParams.get("specialty") || "",
      sortBy: searchParams.get("sortBy") || "score",
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 카테고리 변경
  const handleCategoryChange = (key: string) => {
    setSelectedCategory(key);
    setCurrentPage(1);
    fetchCompanies({
      keyword,
      specialty: key,
      sortBy,
    });
  };

  // 검색
  const handleSearch = () => {
    setCurrentPage(1);
    fetchCompanies({
      keyword,
      specialty: selectedCategory,
      sortBy,
    });
  };

  // 정렬 변경
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1);
    fetchCompanies({
      keyword,
      specialty: selectedCategory,
      sortBy: newSort,
    });
  };

  // 더 보기
  const handleLoadMore = () => {
    if (!meta || currentPage >= meta.totalPages || isLoadingMore) return;
    const nextPage = currentPage + 1;
    fetchCompanies({
      keyword,
      specialty: selectedCategory,
      sortBy,
      page: nextPage,
      append: true,
    });
  };

  const hasMore = meta ? currentPage < meta.totalPages : false;

  return (
    <div className="mx-auto max-w-2xl bg-white lg:max-w-3xl">
      {/* 배너 캐러셀 */}
      <BannerCarousel banners={banners} />

      {/* 검색 바 */}
      <SearchBar keyword={keyword} onChange={setKeyword} onSearch={handleSearch} />

      {/* 퀵 네비게이션 */}
      <div className="px-4 md:px-0">
        <QuickNav />
      </div>

      {/* 필터 + 정렬 바 */}
      <FilterSortBar
        total={meta?.total ?? null}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        category={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* 업체 리스트 */}
      <div ref={listRef} id="list">
        {isLoading ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : companies.length > 0 ? (
          <>
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.04 } },
              }}
            >
              {companies.map((company) => (
                <motion.div
                  key={company.id}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
                    },
                  }}
                >
                  <CompanyListItem
                    company={company}
                    isCompany={isCompany ?? false}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* 더 보기 버튼 */}
            {hasMore && (
              <div className="px-4 py-6 md:px-0">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="flex h-[48px] w-full items-center justify-center rounded-2xl border border-[#e2ddd6] text-[14px] font-semibold text-[#72706a] transition-all hover:border-[#2d6a4f] hover:text-[#2d6a4f] disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <span className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin">
                        <circle cx="12" cy="12" r="10" stroke="#a8a49c" strokeWidth="2.5" fill="none" strokeDasharray="32" strokeLinecap="round" />
                      </svg>
                      불러오는 중...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      더 많은 업체 보기
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* 리스트 끝 (더 이상 없을 때) */}
            {!hasMore && companies.length > 0 && (
              <div className="flex flex-col items-center gap-1 py-10 text-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4d0ca" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p className="text-[13px] text-[#b5b0a8]">
                  모든 업체를 확인했습니다
                </p>
              </div>
            )}
          </>
        ) : (
          /* 빈 상태 */
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col items-center py-20 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f5f3ee]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b5b0a8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="mt-5 text-[15px] font-semibold text-[#1a1918]">
              조건에 맞는 업체가 없습니다
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#a8a49c]">
              다른 카테고리를 선택하거나<br />키워드를 변경해 보세요
            </p>
            {!isCompany && (
              <Link
                href="/estimate/request"
                className="mt-5 inline-flex h-[40px] items-center rounded-2xl bg-[#2d6a4f] px-6 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                견적 직접 요청하기
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
