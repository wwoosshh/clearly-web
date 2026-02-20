"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

interface InquirySummary {
  id: string;
  category: string;
  title: string;
  status: "PENDING" | "ANSWERED" | "CLOSED";
  createdAt: string;
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  PENDING: { text: "대기중", color: "bg-amber-100 text-amber-700" },
  ANSWERED: { text: "답변완료", color: "bg-[#d4ede4] text-[#2d6a4f]" },
  CLOSED: { text: "종료", color: "bg-[#e2ddd6] text-[#72706a]" },
};

export default function InquiryHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [inquiries, setInquiries] = useState<InquirySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetch() {
      try {
        const { data: res } = await api.get("/inquiries/my");
        const payload = res.data ?? res;
        setInquiries(payload.data ?? payload ?? []);
      } catch {
        // 에러 무시
      } finally {
        setIsLoading(false);
      }
    }
    fetch();
  }, [isAuthenticated]);

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#2d6a4f]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#141412]">내 문의 내역</h1>
            <p className="mt-1 text-sm text-[#72706a]">
              접수한 문의의 처리 현황을 확인하세요.
            </p>
          </div>
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link
              href="/contact"
              className="rounded-lg bg-[#2d6a4f] px-4 py-2 text-sm font-medium text-[#f5f3ee] transition-colors hover:bg-[#235840]"
            >
              새 문의
            </Link>
          </motion.div>
        </motion.div>

        {isLoading ? (
          <motion.div variants={fadeUp} className="mt-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#2d6a4f]" />
          </motion.div>
        ) : inquiries.length === 0 ? (
          <motion.div variants={fadeUp} className="mt-12 text-center">
            <p className="text-[#a8a49c]">접수한 문의가 없습니다.</p>
          </motion.div>
        ) : (
          <motion.div
            variants={stagger}
            className="mt-6 divide-y divide-[#e2ddd6] rounded-xl border border-[#e2ddd6]"
          >
            {inquiries.map((inquiry) => {
              const status = STATUS_LABELS[inquiry.status] ?? STATUS_LABELS.PENDING;
              return (
                <motion.div key={inquiry.id} variants={fadeUp}>
                  <Link
                    href={`/contact/history/${inquiry.id}`}
                    className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#f0ede8]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-[#a8a49c]">
                          {inquiry.category}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.color}`}
                        >
                          {status.text}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-[14px] font-medium text-[#1a1918]">
                        {inquiry.title}
                      </p>
                      <p className="mt-0.5 text-[12px] text-[#a8a49c]">
                        {new Date(inquiry.createdAt).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <span className="ml-4 shrink-0 text-[#a8a49c]">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M6 4L10 8L6 12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
