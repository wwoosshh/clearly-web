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

/* ── 배너 데이터 ────────────────────────────────── */
const BANNERS = [
  {
    bg: "linear-gradient(135deg, #2d6a4f 0%, #1a4030 100%)",
    title: "이사청소, 검증된 업체와 함께",
    subtitle: "사업자 인증 완료 업체만 모았습니다",
    cta: "업체 둘러보기",
    ctaHref: "#list",
    accent: "#7dd3b0",
  },
  {
    bg: "linear-gradient(135deg, #1a3a4a 0%, #0f2530 100%)",
    title: "견적 비교로 합리적인 선택",
    subtitle: "여러 업체 견적을 한눈에 비교하세요",
    cta: "견적 요청하기",
    ctaHref: "/estimate/request",
    accent: "#7bc8f6",
  },
  {
    bg: "linear-gradient(135deg, #3d2d1a 0%, #2a1e10 100%)",
    title: "수수료 0원, 무료 매칭",
    subtitle: "고객과 업체 모두 무료로 이용 가능",
    cta: "지금 시작하기",
    ctaHref: "/register",
    accent: "#f0c67a",
  },
];

/* ════════════════════════════════════════════════════
   배너 캐러셀
════════════════════════════════════════════════════ */
function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 자동 재생
  useEffect(() => {
    if (isDragging) return;
    const timer = setInterval(() => {
      setCurrent((p) => (p + 1) % BANNERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isDragging]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    setIsDragging(false);
    const swipe = info.offset.x + info.velocity.x * 0.3;
    if (swipe < -40) {
      setCurrent((p) => Math.min(p + 1, BANNERS.length - 1));
    } else if (swipe > 40) {
      setCurrent((p) => Math.max(p - 1, 0));
    }
  };

  return (
    <div className="relative overflow-hidden" ref={containerRef}>
      <motion.div
        className="flex"
        animate={{ x: `-${current * 100}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 32, mass: 0.8 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x }}
      >
        {BANNERS.map((banner, i) => (
          <div
            key={i}
            className="w-full flex-shrink-0 px-4 pt-3 pb-2 md:px-0"
          >
            <div
              className="relative overflow-hidden rounded-2xl px-6 py-7 md:rounded-xl md:px-10 md:py-10"
              style={{ background: banner.bg }}
            >
              {/* 장식 서클 */}
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-[0.08]"
                style={{ background: banner.accent }}
              />
              <div
                className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full opacity-[0.06]"
                style={{ background: banner.accent }}
              />

              <p
                className="relative text-[19px] font-bold leading-snug tracking-[-0.02em] text-white md:text-[24px]"
              >
                {banner.title}
              </p>
              <p
                className="relative mt-1.5 text-[13px] leading-relaxed md:text-[14px]"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                {banner.subtitle}
              </p>
              {banner.ctaHref !== "#list" && (
                <Link
                  href={banner.ctaHref}
                  className="relative mt-4 inline-flex h-[34px] items-center rounded-lg px-4 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 md:mt-5 md:h-[38px] md:text-[13px]"
                  style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}
                >
                  {banner.cta}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        ))}
      </motion.div>

      {/* 인디케이터 */}
      <div className="flex items-center justify-center gap-1.5 pb-1 pt-2">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="relative h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === current ? 18 : 6,
              background: i === current ? C.green : "#d4d0ca",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   카테고리 필터 (수평 스크롤)
════════════════════════════════════════════════════ */
function CategoryFilter({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="scrollbar-hide -mx-4 overflow-x-auto px-4 md:-mx-0 md:px-0">
      <div className="flex gap-1 py-3 md:flex-wrap md:gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = selected === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => onSelect(cat.key)}
              className={cn(
                "flex flex-shrink-0 flex-col items-center gap-1.5 rounded-xl px-3 py-2.5 transition-all duration-200 md:flex-row md:gap-2 md:rounded-full md:px-4 md:py-2",
                isActive
                  ? "bg-[#2d6a4f] text-white shadow-[0_2px_8px_rgba(45,106,79,0.25)]"
                  : "bg-[#f5f3ee] text-[#72706a] hover:bg-[#ece9e2] hover:text-[#1a1918]"
              )}
              style={{ minWidth: 64 }}
            >
              <span className={cn("transition-colors", isActive ? "text-white" : "text-[#8a8680]")}>
                {cat.icon}
              </span>
              <span className="whitespace-nowrap text-[11px] font-semibold leading-tight md:text-[13px]">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
        className="flex items-center gap-2 rounded-xl border bg-white px-3.5 transition-all focus-within:border-[#2d6a4f] focus-within:shadow-[0_0_0_3px_rgba(45,106,79,0.08)]"
        style={{ borderColor: C.border, height: 48 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a8a49c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={keyword}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder="어떤 청소 서비스를 찾으세요?"
          className="h-full flex-1 bg-transparent text-[14px] text-[#1a1918] placeholder:text-[#b5b0a8] outline-none"
        />
        {keyword && (
          <button
            onClick={() => onChange("")}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e2ddd6] text-[#72706a] transition-colors hover:bg-[#d4d0ca]"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
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
      className="flex gap-4 border-b border-[#f0ede8] px-4 py-4 transition-colors active:bg-[#fafaf8] md:rounded-xl md:border md:border-[#e8e5df] md:px-5 md:py-5 md:hover:shadow-[0_2px_12px_rgba(45,106,79,0.06)]"
    >
      {/* 썸네일 */}
      <div className="relative h-[104px] w-[104px] flex-shrink-0 overflow-hidden rounded-xl bg-[#f0ede8] md:h-[120px] md:w-[120px]">
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
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c4bfb6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          </div>
        )}
        {/* 구독 뱃지 */}
        {company.subscriptionTier && company.subscriptionTier !== "BASIC" && (
          <span
            className="absolute left-1.5 top-1.5 rounded px-1.5 py-[1px] text-[9px] font-bold text-white"
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
          {/* 업체명 + 지역 */}
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-bold text-[#1a1918] md:text-[16px]">
              {company.businessName}
            </h3>
          </div>
          {company.address && (
            <p className="mt-0.5 truncate text-[12px] text-[#a8a49c] md:text-[13px]">
              {company.address}
            </p>
          )}

          {/* 전문분야 태그 */}
          {company.specialties && company.specialties.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {company.specialties.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="rounded bg-[#f0ede8] px-1.5 py-[2px] text-[10px] font-medium text-[#72706a] md:text-[11px]"
                >
                  {s}
                </span>
              ))}
              {company.specialties.length > 3 && (
                <span className="rounded bg-[#f0ede8] px-1.5 py-[2px] text-[10px] font-medium text-[#a8a49c]">
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
          <div className="flex items-center gap-2.5 text-[12px] text-[#a8a49c]">
            {company.averageRating != null && (
              <span className="flex items-center gap-0.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
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
function SortBar({
  total,
  sortBy,
  onSortChange,
}: {
  total: number | null;
  sortBy: string;
  onSortChange: (v: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "추천순";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex items-center justify-between border-b border-[#f0ede8] px-4 py-3 md:px-0">
      <p className="text-[13px] text-[#72706a]">
        {total != null ? (
          <>
            총 <span className="font-semibold text-[#2d6a4f]">{total}</span>개
          </>
        ) : (
          "\u00A0"
        )}
      </p>
      <div ref={ref} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-[13px] font-medium text-[#72706a] transition-colors hover:text-[#1a1918]"
        >
          {currentLabel}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
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
              className="absolute right-0 top-full z-20 mt-1 w-36 rounded-xl border border-[#e2ddd6] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onSortChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center px-4 py-2 text-[13px] transition-colors",
                    sortBy === opt.value
                      ? "font-semibold text-[#2d6a4f]"
                      : "text-[#72706a] hover:bg-[#f5f3ee]"
                  )}
                >
                  {opt.label}
                  {sortBy === opt.value && (
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
    </div>
  );
}

/* ════════════════════════════════════════════════════
   스켈레톤 로더
════════════════════════════════════════════════════ */
function SkeletonCard() {
  return (
    <div className="flex gap-4 border-b border-[#f0ede8] px-4 py-4 md:rounded-xl md:border md:border-[#e8e5df] md:px-5 md:py-5">
      <div className="h-[104px] w-[104px] flex-shrink-0 animate-pulse rounded-xl bg-[#ece9e2] md:h-[120px] md:w-[120px]" />
      <div className="flex flex-1 flex-col justify-between py-1">
        <div>
          <div className="h-4 w-28 animate-pulse rounded bg-[#ece9e2]" />
          <div className="mt-2 h-3 w-36 animate-pulse rounded bg-[#f0ede8]" />
          <div className="mt-3 flex gap-1.5">
            <div className="h-4 w-12 animate-pulse rounded bg-[#f0ede8]" />
            <div className="h-4 w-12 animate-pulse rounded bg-[#f0ede8]" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div className="h-5 w-24 animate-pulse rounded bg-[#ece9e2]" />
          <div className="h-3 w-20 animate-pulse rounded bg-[#f0ede8]" />
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
      <BannerCarousel />

      {/* 검색 바 */}
      <SearchBar keyword={keyword} onChange={setKeyword} onSearch={handleSearch} />

      {/* 카테고리 필터 */}
      <div className="px-4 md:px-0">
        <CategoryFilter selected={selectedCategory} onSelect={handleCategoryChange} />
      </div>

      {/* 정렬 바 */}
      <SortBar
        total={meta?.total ?? null}
        sortBy={sortBy}
        onSortChange={handleSortChange}
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
                  className="flex h-[48px] w-full items-center justify-center rounded-xl border border-[#e2ddd6] text-[14px] font-semibold text-[#72706a] transition-all hover:border-[#2d6a4f] hover:text-[#2d6a4f] disabled:opacity-50"
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
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5f3ee]">
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
                className="mt-5 inline-flex h-[40px] items-center rounded-xl bg-[#2d6a4f] px-6 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
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
