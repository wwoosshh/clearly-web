"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

interface InquiryDetail {
  id: string;
  name: string;
  email: string;
  category: string;
  title: string;
  content: string;
  status: "PENDING" | "ANSWERED" | "CLOSED";
  adminAnswer: string | null;
  answeredAt: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  PENDING: { text: "대기중", color: "bg-amber-100 text-amber-700" },
  ANSWERED: { text: "답변완료", color: "bg-[#d4ede4] text-[#2d6a4f]" },
  CLOSED: { text: "종료", color: "bg-[#e2ddd6] text-[#72706a]" },
};

export default function InquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !params.id) return;
    async function fetch() {
      try {
        const { data: res } = await api.get(`/inquiries/my/${params.id}`);
        setInquiry(res.data ?? res);
      } catch {
        router.replace("/contact/history");
      } finally {
        setIsLoading(false);
      }
    }
    fetch();
  }, [isAuthenticated, params.id, router]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#2d6a4f]" />
      </div>
    );
  }

  if (!inquiry) return null;

  const status = STATUS_LABELS[inquiry.status] ?? STATUS_LABELS.PENDING;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <Link
            href="/contact/history"
            className="inline-flex items-center gap-1.5 text-sm text-[#72706a] hover:text-[#1a1918] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 4L6 8L10 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            목록으로
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-4">
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#a8a49c]">
              {inquiry.category}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.color}`}
            >
              {status.text}
            </span>
          </div>
          <h1 className="mt-2 text-xl font-bold text-[#141412]">
            {inquiry.title}
          </h1>
          <p className="mt-1 text-[12px] text-[#a8a49c]">
            {new Date(inquiry.createdAt).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </motion.div>

        {/* 문의 내용 */}
        <motion.div variants={fadeUp} className="mt-6 rounded-xl border border-[#e2ddd6] bg-[#f5f3ee] p-6">
          <h2 className="text-[13px] font-semibold text-[#72706a]">문의 내용</h2>
          <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-[#1a1918]">
            {inquiry.content}
          </p>
        </motion.div>

        {/* 관리자 답변 */}
        {inquiry.adminAnswer && (
          <motion.div variants={fadeUp} className="mt-4 rounded-xl border border-[#a8d5bf] bg-[#eef7f3] p-6">
            <h2 className="text-[13px] font-semibold text-[#2d6a4f]">
              관리자 답변
            </h2>
            {inquiry.answeredAt && (
              <p className="mt-1 text-[12px] text-[#4a8c6a]">
                {new Date(inquiry.answeredAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
            <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-[#1a1918]">
              {inquiry.adminAnswer}
            </p>
          </motion.div>
        )}

        {inquiry.status === "PENDING" && (
          <motion.div variants={fadeUp} className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
            <p className="text-[13px] text-amber-700">
              답변을 준비 중입니다. 빠른 시일 내에 답변드리겠습니다.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
