"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AddressSearch } from "@/components/address/AddressSearch";
import { CompanyCard } from "@/components/company/CompanyCard";
import { Spinner } from "@/components/ui/Spinner";
import api from "@/lib/api";
import type { CompanySearchResponse, CompanySearchResult } from "@/types";

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

  const [addressInput, setAddressInput] = useState(
    searchParams.get("address") || ""
  );
  const [companies, setCompanies] = useState<CompanySearchResult[]>([]);
  const [meta, setMeta] = useState<CompanySearchResponse["meta"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCompanies = useCallback(
    async (address: string, page: number = 1) => {
      if (!address.trim()) return;

      setIsLoading(true);
      setHasSearched(true);

      try {
        const { data } = await api.get<CompanySearchResponse>(
          "/companies/search",
          {
            params: { address, page, limit: 10 },
          }
        );

        const result = (data as any)?.data ?? data;

        setCompanies(
          Array.isArray(result) ? result : result?.data ?? []
        );
        setMeta(result?.meta ?? (data as any)?.meta ?? null);
        setCurrentPage(page);
      } catch {
        setCompanies([]);
        setMeta(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // URL의 address 쿼리 파라미터로 자동 검색
  useEffect(() => {
    const urlAddress = searchParams.get("address");
    if (urlAddress) {
      setAddressInput(urlAddress);
      fetchCompanies(urlAddress);
    }
  }, [searchParams, fetchCompanies]);

  const handleSearch = () => {
    if (!addressInput.trim()) return;
    router.replace(`/search?address=${encodeURIComponent(addressInput)}`);
    fetchCompanies(addressInput);
  };

  const handlePageChange = (page: number) => {
    fetchCompanies(addressInput, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* 헤더 */}
      <h1 className="text-[24px] font-bold tracking-tight text-gray-900">
        업체 찾기
      </h1>
      <p className="mt-1.5 text-[15px] text-gray-500">
        주소를 입력하면 가까운 업체를 추천해 드립니다
      </p>

      {/* 검색 바 */}
      <div className="mt-6 flex gap-2">
        <input
          type="text"
          readOnly
          value={addressInput}
          placeholder="주소를 검색해주세요"
          className="h-[46px] flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 text-[14px] placeholder:text-gray-400 cursor-default"
        />
        <AddressSearch
          onComplete={(data) => {
            const addr = data.roadAddress || data.address;
            setAddressInput(addr);
          }}
        />
        <button
          onClick={handleSearch}
          disabled={!addressInput.trim() || isLoading}
          className="h-[46px] rounded-lg bg-gray-900 px-6 text-[14px] font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          검색
        </button>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="mt-16 flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-gray-400" />
          <p className="text-[14px] text-gray-500">업체를 찾고 있습니다...</p>
        </div>
      )}

      {/* 검색 결과 */}
      {!isLoading && hasSearched && (
        <>
          {companies.length > 0 ? (
            <>
              <p className="mt-6 text-[14px] text-gray-500">
                총{" "}
                <span className="font-semibold text-gray-900">
                  {meta?.total ?? companies.length}
                </span>
                개의 업체를 찾았습니다
              </p>

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
            <div className="mt-16 flex flex-col items-center text-center">
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
                검색 결과가 없습니다
              </p>
              <p className="mt-1.5 text-[13px] text-gray-500">
                다른 주소로 검색해 보시거나 검색 범위를 넓혀보세요
              </p>
            </div>
          )}
        </>
      )}

      {/* 초기 상태 */}
      {!isLoading && !hasSearched && (
        <div className="mt-16 flex flex-col items-center text-center">
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
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <p className="mt-4 text-[15px] font-medium text-gray-700">
            주소를 입력하여 검색을 시작하세요
          </p>
          <p className="mt-1.5 text-[13px] text-gray-500">
            입력하신 주소 근처의 우수 업체를 추천해 드립니다
          </p>
        </div>
      )}
    </div>
  );
}
