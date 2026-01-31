"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export default function FaqPage() {
  const [faqGroups, setFaqGroups] = useState<Record<string, FaqItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  async function fetchFaqs(query?: string) {
    setIsLoading(true);
    try {
      const params = query ? { search: query } : {};
      const { data: res } = await api.get("/faq", { params });
      setFaqGroups(res.data ?? res);
    } catch {
      // 에러 무시
    } finally {
      setIsLoading(false);
    }
  }

  function handleSearch() {
    setOpenId(null);
    fetchFaqs(search || undefined);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  const categories = Object.keys(faqGroups);
  const isEmpty = categories.length === 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900">
        자주 묻는 질문
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        궁금한 사항을 검색하거나 카테고리별로 확인하세요.
      </p>

      {/* 검색 */}
      <div className="mt-6 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="질문 검색..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        />
        <button
          onClick={handleSearch}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          검색
        </button>
      </div>

      {/* 내용 */}
      {isLoading ? (
        <div className="mt-12 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      ) : isEmpty ? (
        <div className="mt-12 text-center">
          <p className="text-gray-400">
            {search
              ? "검색 결과가 없습니다."
              : "등록된 FAQ가 없습니다."}
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {categories.map((category) => (
            <div key={category}>
              <h2 className="text-[15px] font-bold text-gray-900">
                {category}
              </h2>
              <div className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200">
                {faqGroups[category].map((faq) => {
                  const isOpen = openId === faq.id;
                  return (
                    <div key={faq.id}>
                      <button
                        onClick={() =>
                          setOpenId(isOpen ? null : faq.id)
                        }
                        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
                      >
                        <span className="pr-4 text-[14px] font-medium text-gray-800">
                          {faq.question}
                        </span>
                        <span
                          className={`shrink-0 text-gray-400 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M4 6L8 10L12 6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </button>
                      {isOpen && (
                        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-gray-600">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
