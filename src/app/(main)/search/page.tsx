"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { CompanyCard } from "@/components/company/CompanyCard";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { CompanySearchResponse, CompanySearchResult } from "@/types";

const SPECIALTY_OPTIONS = [
  "이사청소",
  "입주청소",
  "거주청소",
  "사무실청소",
  "상가청소",
  "준공청소",
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
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" className="text-gray-400" />
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
  const [address, setAddress] = useState(searchParams.get("address") || "");
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
      address?: string;
      specialty?: string;
      region?: string;
      sortBy?: string;
      page?: number;
    }) => {
      setIsLoading(true);
      setHasSearched(true);

      try {
        const query: Record<string, string | number> = {
          page: params.page || 1,
          limit: 10,
        };
        if (params.keyword) query.keyword = params.keyword;
        if (params.address) query.address = params.address;
        if (params.specialty) query.specialty = params.specialty;
        if (params.region) query.region = params.region;
        if (params.sortBy) query.sortBy = params.sortBy;

        const { data } = await api.get<CompanySearchResponse>(
          "/companies/search",
          { params: query }
        );

        const result = (data as any)?.data ?? data;
        setCompanies(Array.isArray(result) ? result : result?.data ?? []);
        setMeta(result?.meta ?? (data as any)?.meta ?? null);
        setCurrentPage(params.page || 1);
      } catch {
        setCompanies([]);
        setMeta(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 초기 로드: 파라미터가 있으면 검색, 없으면 전체 목록
  useEffect(() => {
    fetchCompanies({
      keyword: searchParams.get("keyword") || "",
      address: searchParams.get("address") || "",
      specialty: searchParams.get("specialty") || "",
      region: searchParams.get("region") || "",
      sortBy: searchParams.get("sortBy") || "score",
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (address) params.set("address", address);
    if (selectedSpecialty) params.set("specialty", selectedSpecialty);
    if (selectedRegion) params.set("region", selectedRegion);
    if (sortBy !== "score") params.set("sortBy", sortBy);
    router.replace(`/search?${params.toString()}`);
    fetchCompanies({
      keyword,
      address,
      specialty: selectedSpecialty,
      region: selectedRegion,
      sortBy,
    });
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    fetchCompanies({
      keyword,
      address,
      specialty: selectedSpecialty,
      region: selectedRegion,
      sortBy: newSort,
      page: 1,
    });
  };

  const handlePageChange = (page: number) => {
    fetchCompanies({
      keyword,
      address,
      specialty: selectedSpecialty,
      region: selectedRegion,
      sortBy,
      page,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* 헤더 */}
      <h1 className="text-[24px] font-bold tracking-tight text-gray-900">
        업체 찾기
      </h1>
      <div className="mt-1.5 flex items-center justify-between">
        <p className="text-[15px] text-gray-500">
          조건에 맞는 청소 업체를 찾아보세요
        </p>
        {!isCompany && (
          <Link
            href="/estimate/request"
            className="rounded-lg border border-gray-200 px-4 py-2 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            견적 요청하기
          </Link>
        )}
      </div>

      {/* 주소 입력 필드 */}
      <div className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="주소를 입력하세요 (예: 서울시 강남구)"
            className="h-[46px] w-full rounded-lg border border-gray-200 px-4 pr-10 text-[14px] placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 focus:outline-none"
          />
          {address && (
            <button
              onClick={() => {
                setAddress("");
                fetchCompanies({
                  keyword,
                  address: "",
                  specialty: selectedSpecialty,
                  region: selectedRegion,
                  sortBy,
                });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="주소 초기화"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 주소 배지 */}
      {address && (
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[13px] text-blue-700">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {address} 기준 거리순 검색
        </div>
      )}

      {/* 키워드 검색 바 */}
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="업체명 또는 키워드로 검색"
          className="h-[46px] flex-1 rounded-lg border border-gray-200 px-4 text-[14px] placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="h-[46px] rounded-lg bg-gray-900 px-6 text-[14px] font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          검색
        </button>
      </div>

      {/* 전문분야 필터 */}
      <div className="mt-4">
        <p className="text-[13px] font-medium text-gray-600 mb-2">전문분야</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedSpecialty("");
              fetchCompanies({
                keyword,
                address,
                specialty: "",
                region: selectedRegion,
                sortBy,
              });
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[13px] transition-colors",
              !selectedSpecialty
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 text-gray-600 hover:border-gray-400"
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
                  address,
                  specialty: next,
                  region: selectedRegion,
                  sortBy,
                });
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[13px] transition-colors",
                selectedSpecialty === spec
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-400"
              )}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* 지역 필터 */}
      <div className="mt-3">
        <p className="text-[13px] font-medium text-gray-600 mb-2">지역</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedRegion("");
              fetchCompanies({
                keyword,
                address,
                specialty: selectedSpecialty,
                region: "",
                sortBy,
              });
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[13px] transition-colors",
              !selectedRegion
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 text-gray-600 hover:border-gray-400"
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
                  address,
                  specialty: selectedSpecialty,
                  region: next,
                  sortBy,
                });
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[13px] transition-colors",
                selectedRegion === region
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-400"
              )}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* 구분선 + 정렬 */}
      <div className="mt-5 border-t border-gray-200 pt-4 flex items-center justify-between">
        <p className="text-[14px] text-gray-500">
          {meta ? (
            <>
              총{" "}
              <span className="font-semibold text-gray-900">
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
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] text-gray-700 focus:border-gray-900 focus:outline-none"
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
          <Spinner size="lg" className="text-gray-400" />
          <p className="text-[14px] text-gray-500">업체를 찾고 있습니다...</p>
        </div>
      )}

      {/* 검색 결과 */}
      {!isLoading && hasSearched && (
        <>
          {companies.length > 0 ? (
            <>
              <div className="mt-4 flex flex-col gap-4">
                {companies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>

              {/* 페이지네이션 */}
              {meta && meta.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[14px] text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
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
                          className="flex h-9 w-9 items-center justify-center text-[14px] text-gray-400"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => handlePageChange(item as number)}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg text-[14px] font-medium transition-colors ${
                            currentPage === item
                              ? "bg-gray-900 text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= meta.totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[14px] text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
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
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="mt-12 flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <p className="mt-4 text-[15px] font-medium text-gray-700">
                조건에 맞는 업체가 없습니다
              </p>
              <p className="mt-1.5 text-[13px] text-gray-500">
                필터를 변경하거나 다른 키워드로 검색해 보세요
              </p>
              {!isCompany && (
                <Link
                  href="/estimate/request"
                  className="mt-4 inline-flex items-center rounded-lg bg-gray-900 px-5 py-2.5 text-[13px] font-medium text-white hover:bg-gray-800"
                >
                  견적 요청하기
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
