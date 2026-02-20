"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

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
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
}

const STATUS_LABELS: Record<string, { text: string; style: string }> = {
  PENDING: { text: "대기중", style: "bg-[#fef9ee] text-[#b45309]" },
  ANSWERED: { text: "답변완료", style: "bg-[#eef7f3] text-[#2d6a4f]" },
  CLOSED: { text: "종료", style: "bg-[#f0ede8] text-[#72706a]" },
};

export default function AdminInquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const { data: res } = await api.get(`/inquiries/admin/${params.id}`);
        const d = res.data ?? res;
        setInquiry(d);
        setAnswer(d.adminAnswer ?? "");
      } catch {
        router.replace("/admin/inquiries");
      } finally {
        setIsLoading(false);
      }
    }
    fetch();
  }, [params.id, router]);

  async function handleAnswer() {
    if (!answer.trim()) return;
    setIsSaving(true);
    try {
      const { data: res } = await api.patch(`/inquiries/admin/${params.id}/answer`, {
        adminAnswer: answer,
      });
      setInquiry(res.data ?? res);
    } catch {
      // 에러 무시
    } finally {
      setIsSaving(false);
    }
  }

  async function handleClose() {
    if (!confirm("문의를 종료하시겠습니까?")) return;
    try {
      const { data: res } = await api.patch(`/inquiries/admin/${params.id}/close`);
      setInquiry(res.data ?? res);
    } catch {
      // 에러 무시
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#2d6a4f]" />
      </div>
    );
  }

  if (!inquiry) return null;

  const status = STATUS_LABELS[inquiry.status] ?? STATUS_LABELS.PENDING;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <Link
          href="/admin/inquiries"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#72706a] hover:text-[#1a1918] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          문의 목록
        </Link>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-4 flex items-center gap-3">
        <h1 className="text-xl font-bold text-[#141412]">{inquiry.title}</h1>
        <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", status.style)}>
          {status.text}
        </span>
      </motion.div>

      {/* 문의 정보 카드 */}
      <motion.div variants={fadeUp} className="mt-6 rounded-xl border border-[#e2ddd6] bg-white p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-4">
          <div>
            <p className="text-[#72706a]">이름</p>
            <p className="mt-1 font-medium text-[#1a1918]">{inquiry.name}</p>
          </div>
          <div>
            <p className="text-[#72706a]">이메일</p>
            <p className="mt-1 font-medium text-[#1a1918]">{inquiry.email}</p>
          </div>
          <div>
            <p className="text-[#72706a]">유형</p>
            <p className="mt-1 font-medium text-[#1a1918]">{inquiry.category}</p>
          </div>
          <div>
            <p className="text-[#72706a]">접수일</p>
            <p className="mt-1 font-medium text-[#1a1918]">
              {new Date(inquiry.createdAt).toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>
        {inquiry.user && (
          <div className="mt-4 border-t border-[#e2ddd6] pt-4">
            <p className="text-[12px] text-[#72706a]">회원 정보</p>
            <p className="mt-1 text-[13px] text-[#1a1918]">
              {inquiry.user.name} ({inquiry.user.email})
              {inquiry.user.phone && ` / ${inquiry.user.phone}`}
            </p>
          </div>
        )}
      </motion.div>

      {/* 문의 내용 */}
      <motion.div variants={fadeUp} className="mt-4 rounded-xl border border-[#e2ddd6] bg-white p-4 sm:p-5">
        <h2 className="text-[13px] font-semibold text-[#72706a]">문의 내용</h2>
        <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-[#1a1918]">
          {inquiry.content}
        </p>
      </motion.div>

      {/* 기존 답변 표시 */}
      {inquiry.adminAnswer && inquiry.status !== "PENDING" && (
        <motion.div variants={fadeUp} className="mt-4 rounded-xl border border-[#d4ede4] bg-[#eef7f3] p-4 sm:p-5">
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
          <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-[#2d6a4f]">
            {inquiry.adminAnswer}
          </p>
        </motion.div>
      )}

      {/* 답변 입력 */}
      {inquiry.status !== "CLOSED" && (
        <motion.div variants={fadeUp} className="mt-6 rounded-xl border border-[#e2ddd6] bg-white p-4 sm:p-5">
          <h2 className="text-[15px] font-semibold text-[#141412]">
            {inquiry.status === "ANSWERED" ? "답변 수정" : "답변 작성"}
          </h2>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            placeholder="답변 내용을 입력하세요..."
            className="mt-3 w-full resize-none rounded-lg border border-[#e2ddd6] px-4 py-2.5 text-sm text-[#1a1918] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10"
          />
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleAnswer}
              disabled={isSaving || !answer.trim()}
              className="rounded-lg bg-[#2d6a4f] px-5 py-2.5 text-sm font-medium text-[#f5f3ee] hover:bg-[#4a8c6a] disabled:opacity-50"
            >
              {isSaving ? "저장 중..." : "답변 저장"}
            </button>
            {inquiry.status === "ANSWERED" && (
              <button
                onClick={handleClose}
                className="rounded-lg border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100"
              >
                문의 종료
              </button>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
