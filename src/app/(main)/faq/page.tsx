"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import FadeIn from "@/components/animation/FadeIn";
import ScrollReveal from "@/components/animation/ScrollReveal";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

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
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <FadeIn>
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div variants={fadeUp}>
            <h1 className="text-2xl font-bold text-[#141412]">
              자주 묻는 질문
            </h1>
            <p className="mt-2 text-sm text-[#72706a]">
              궁금한 사항을 검색하거나 카테고리별로 확인하세요.
            </p>
          </motion.div>

          {/* 검색 */}
          <motion.div variants={fadeUp} className="mt-6 flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="질문 검색..."
              className="flex-1 rounded-lg border border-[#e2ddd6] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 placeholder:text-[#a8a49c]"
            />
            <button
              onClick={handleSearch}
              className="press-scale rounded-lg bg-[#2d6a4f] px-5 py-2.5 text-sm font-medium text-[#f5f3ee] transition-colors hover:bg-[#235840]"
            >
              검색
            </button>
          </motion.div>
        </motion.div>
      </FadeIn>

      {/* 내용 */}
      {isLoading ? (
        <div className="mt-12 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d4ede4] border-t-[#4a8c6a]" />
        </div>
      ) : isEmpty ? (
        <div className="mt-12 text-center">
          <p className="text-[#a8a49c]">
            {search
              ? "검색 결과가 없습니다."
              : "등록된 FAQ가 없습니다."}
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {categories.map((category, idx) => (
            <ScrollReveal key={category} delay={idx * 0.05}>
              <h2 className="text-[15px] font-bold text-[#141412]">
                {category}
              </h2>
              <div className="mt-3 divide-y divide-[#e2ddd6] rounded-xl border border-[#e2ddd6]">
                {faqGroups[category].map((faq) => {
                  const isOpen = openId === faq.id;
                  return (
                    <div key={faq.id}>
                      <button
                        onClick={() =>
                          setOpenId(isOpen ? null : faq.id)
                        }
                        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[#f0ede8]"
                      >
                        <span
                          className={`pr-4 text-[14px] font-medium transition-colors ${
                            isOpen ? "text-[#2d6a4f]" : "text-[#1a1918]"
                          }`}
                        >
                          {faq.question}
                        </span>
                        <span
                          className={`shrink-0 transition-all ${
                            isOpen
                              ? "text-[#2d6a4f] rotate-180"
                              : "text-[#a8a49c]"
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
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              duration: 0.25,
                              ease: [0.25, 0.46, 0.45, 0.94],
                            }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-[#e2ddd6] bg-[#f0ede8] px-5 py-4">
                              <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#72706a]">
                                {faq.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
