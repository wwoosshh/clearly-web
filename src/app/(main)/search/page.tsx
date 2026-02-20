"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useCacheStore } from "@/stores/cache.store";
import { CompanyCard } from "@/components/company/CompanyCard";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import FadeIn from "@/components/animation/FadeIn";
import { motion } from "framer-motion";
import type { CompanySearchResponse, CompanySearchResult } from "@/types";

const SPECIALTY_OPTIONS = [
  "이사청소",
  "입주청소",
  "거주청소",
  "사무실청소",
  "상가청소",
  "에어컨청소",
  "카펫청소",
  "외벽청소",
] as const;

const REGION_OPTIONS = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "대전",
  "광주",
  "울산",
  "세종",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
] as const;

const SORT_OPTIONS = [
  { value: "score", label: "추천순" },
  { value: "rating", label: "평점순" },
  { value: "reviews", label: "리뷰많은순" },
  { value: "matchings", label: "매칭많은순" },
  { value: "price_low", label: "가격낮은순" },
  { value: "price_high", label: "가격높은순" },
] as const;

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" className="text-[#4a8c6a]" />
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const isCompany = user?.role === "COMPANY";

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [selectedSpecialty, setSelectedSpecialty] = useState(
    searchParams.get("specialty") || ""
  );
  const [selectedRegion, setSelectedRegion] = useState(
    searchParams.get("region") || ""
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "score"
  );

  const [companies, setCompanies] = useState<CompanySearchResult[]>([]);
  const [meta, setMeta] = useState<CompanySearchResponse["meta"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCompanies = useCallback(
    async (params: {
      keyword?: string;
      specialty?: string;
      region?: string;
      sortBy?: string;
      page?: number;
    }) => {
      setHasSearched(true);
      const cacheKey = `search:${params.keyword || ""}:${params.specialty || ""}:${params.region || ""}:${params.sortBy || "score"}:${params.page || 1}`;
      const cache = useCacheStore.getState();
      const cached = cache.get<{ companies: CompanySearchResult[]; meta: CompanySearchResponse["meta"] | null }>(cacheKey, 3 * 60 * 1000);

      if (cached) {
        setCompanies(cached.companies);
        setMeta(cached.meta);
        setCurrentPage(params.page || 1);
      } else {
        setIsLoading(true);
      }

      try {
        const query: Record<string, string | number> = {
          page: params.page || 1,
          limit: 10,
        };
        if (params.keyword) query.keyword = params.keyword;
        if (params.specialty) query.specialty = params.specialty;
        if (params.region) query.region = params.region;
        if (params.sortBy) query.sortBy = params.sortBy;

        const { data } = await api.get<CompanySearchResponse>(
          "/companies/search",
          { params: query }
        );

        const result = (data as any)?.data ?? data;
        const list = Array.isArray(result) ? result : result?.data ?? [];
        const resultMeta = result?.meta ?? (data as any)?.meta ?? null;
        cache.set(cacheKey, { companies: list, meta: resultMeta });
        setCompanies(list);
        setMeta(resultMeta);
        setCurrentPage(params.page || 1);
      } catch {
        if (!cached) {
          setCompanies([]);
          setMeta(null);
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchCompanies({
      keyword: searchParams.get("keyword") || "",
      specialty: searchParams.get("specialty") || "",
      region: searchParams.get("region") || "",
      sortBy: searchParams.get("sortBy") || "score",
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (selectedSpecialty) params.set("specialty", selectedSpecialty);
    if (selectedRegion) params.set("region", selectedRegion);
    if (sortBy !== "score") params.set("sortBy", sortBy);
    router.replace(`/search?${params.toString()}`);
    fetchCompanies({
      keyword,
      specialty: selectedSpecialty,
      region: selectedRegion,
      sortBy,
    });
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    fetchCompanies({
      keyword,
      specialty: selectedSpecialty,
      region: selectedRegion,
      sortBy: newSort,
      page: 1,
    });
  };

  const handlePageChange = (page: number) => {
    fetchCompanies({
      keyword,
      specialty: selectedSpecialty,
      region: selectedRegion,
      sortBy,
      page,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      {/* 헤더 */}
      <FadeIn>
        <h1 className="text-[24px] font-bold tracking-tight text-[#141412]">
          업체 찾기
        </h1>
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-[15px] text-[#72706a]">
            조건에 맞는 청소 업체를 찾아보세요
          </p>
          {!isCompany && (
            <Link
              href="/estimate/request"
              className="press-scale rounded-lg border border-[#e2ddd6] bg-white px-4 py-2 text-[13px] font-medium text-[#1a1918] transition-colors hover:bg-[#f0ede8]"
            >
              견적 요청하기
            </Link>
          )}
        </div>
      </FadeIn>

      {/* 키워드 검색 바 */}
      <FadeIn delay={0.08}>
        <div className="mt-6 flex gap-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="업체명 또는 키워드로 검색"
            className="h-[46px] flex-1 rounded-lg border border-[#e2ddd6] bg-white px-4 text-[14px] text-[#1a1918] placeholder:text-[#a8a49c] outline-none transition-all focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="press-scale h-[46px] rounded-lg px-6 text-[14px] font-semibold text-[#f5f3ee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#2d6a4f" }}
          >
            검색
          </button>
        </div>
      </FadeIn>

      {/* 전문분야 필터 */}
      <FadeIn delay={0.12}>
        <div className="mt-4">
          <p className="text-[13px] font-medium text-[#72706a] mb-2">전문분야</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedSpecialty("");
                fetchCompanies({
                  keyword,
                  specialty: "",
                  region: selectedRegion,
                  sortBy,
                });
              }}
              className={cn(
                "press-scale rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                !selectedSpecialty
                  ? "border-[#2d6a4f] bg-[#2d6a4f] text-[#f5f3ee]"
                  : "border-[#e2ddd6] bg-white text-[#72706a] hover:border-[#2d6a4f] hover:text-[#2d6a4f]"
              )}
            >
              전체
            </button>
            {SPECIALTY_OPTIONS.map((spec) => (
              <button
                key={spec}
                onClick={() => {
                  const next = selectedSpecialty === spec ? "" : spec;
                  setSelectedSpecialty(next);
                  fetchCompanies({
                    keyword,
                    specialty: next,
                    region: selectedRegion,
                    sortBy,
                  });
                }}
                className={cn(
                  "press-scale rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                  selectedSpecialty === spec
                    ? "border-[#2d6a4f] bg-[#2d6a4f] text-[#f5f3ee]"
                    : "border-[#e2ddd6] bg-white text-[#72706a] hover:border-[#2d6a4f] hover:text-[#2d6a4f]"
                )}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* 지역 필터 */}
      <FadeIn delay={0.16}>
        <div className="mt-3">
          <p className="text-[13px] font-medium text-[#72706a] mb-2">지역</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedRegion("");
                fetchCompanies({
                  keyword,
                  specialty: selectedSpecialty,
                  region: "",
                  sortBy,
                });
              }}
              className={cn(
                "press-scale rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                !selectedRegion
                  ? "border-[#2d6a4f] bg-[#2d6a4f] text-[#f5f3ee]"
                  : "border-[#e2ddd6] bg-white text-[#72706a] hover:border-[#2d6a4f] hover:text-[#2d6a4f]"
              )}
            >
              전체
            </button>
            {REGION_OPTIONS.map((region) => (
              <button
                key={region}
                onClick={() => {
                  const next = selectedRegion === region ? "" : region;
                  setSelectedRegion(next);
                  fetchCompanies({
                    keyword,
                    specialty: selectedSpecialty,
                    region: next,
                    sortBy,
                  });
                }}
                className={cn(
                  "press-scale rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                  selectedRegion === region
                    ? "border-[#2d6a4f] bg-[#2d6a4f] text-[#f5f3ee]"
                    : "border-[#e2ddd6] bg-white text-[#72706a] hover:border-[#2d6a4f] hover:text-[#2d6a4f]"
                )}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* 구분선 + 정렬 */}
      <div className="mt-5 border-t border-[#e2ddd6] pt-4 flex items-center justify-between">
        <p className="text-[14px] text-[#72706a]">
          {meta ? (
            <>
              총{" "}
              <span className="font-semibold text-[#2d6a4f]">
                {meta.total}
              </span>
              개의 업체
            </>
          ) : (
            "\u00A0"
          )}
        </p>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="rounded-lg border border-[#e2ddd6] bg-white px-3 py-1.5 text-[13px] text-[#1a1918] outline-none focus:border-[#2d6a4f]"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="mt-12 flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-[#4a8c6a]" />
          <p className="text-[14px] text-[#72706a]">업체를 찾고 있습니다...</p>
        </div>
      )}

      {/* 검색 결과 */}
      {!isLoading && hasSearched && (
        <>
          {companies.length > 0 ? (
            <>
              <motion.div
                className="mt-4 flex flex-col gap-3"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.06 } },
                }}
              >
                {companies.map((company) => (
                  <motion.div
                    key={company.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
                    }}
                  >
                    <CompanyCard company={company} />
                  </motion.div>
                ))}
              </motion.div>

              {/* 페이지네이션 */}
              {meta && meta.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[14px] text-[#72706a] transition-colors hover:bg-[#f0ede8] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      const diff = Math.abs(p - currentPage);
                      return diff <= 2 || p === 1 || p === meta.totalPages;
                    })
                    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                        acc.push("...");
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "..." ? (
                        <span
                          key={`dots-${idx}`}
                          className="flex h-9 w-9 items-center justify-center text-[14px] text-[#a8a49c]"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => handlePageChange(item as number)}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg text-[14px] font-medium transition-colors ${
                            currentPage === item
                              ? "bg-[#2d6a4f] text-[#f5f3ee]"
                              : "text-[#72706a] hover:bg-[#f0ede8]"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= meta.totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[14px] text-[#72706a] transition-colors hover:bg-[#f0ede8] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mt-12 flex flex-col items-center text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0ede8]">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#a8a49c"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <p className="mt-4 text-[15px] font-medium text-[#1a1918]">
                조건에 맞는 업체가 없습니다
              </p>
              <p className="mt-1.5 text-[13px] text-[#72706a]">
                필터를 변경하거나 다른 키워드로 검색해 보세요
              </p>
              {!isCompany && (
                <Link
                  href="/estimate/request"
                  className="press-scale mt-4 inline-flex items-center rounded-lg px-5 py-2.5 text-[13px] font-medium text-[#f5f3ee]"
                  style={{ backgroundColor: "#2d6a4f" }}
                >
                  견적 요청하기
                </Link>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
