"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { motion } from "framer-motion";
import FadeIn from "@/components/animation/FadeIn";

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

const INQUIRY_CATEGORIES = [
  { value: "서비스 이용", label: "서비스 이용" },
  { value: "결제/환불", label: "결제/환불" },
  { value: "업체 관련", label: "업체 관련" },
  { value: "계정/인증", label: "계정/인증" },
  { value: "기타", label: "기타" },
];

export default function ContactPage() {
  const { user, isAuthenticated } = useAuthStore();

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    category: "",
    title: "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.category || !form.title || !form.content) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/inquiries", {
        ...form,
        userId: isAuthenticated ? user?.id : undefined,
      });
      setIsSubmitted(true);
    } catch {
      setError("문의 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-24 text-center">
        <FadeIn>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d4ede4]">
            <svg
              className="h-8 w-8 text-[#2d6a4f]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-xl font-bold text-[#141412]">
            문의가 접수되었습니다
          </h1>
          <p className="mt-2 text-sm text-[#72706a]">
            빠른 시일 내에 답변 드리겠습니다. 감사합니다.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/"
              className="rounded-lg border border-[#e2ddd6] px-5 py-2.5 text-sm font-medium text-[#1a1918] transition-colors hover:bg-[#f0ede8]"
            >
              홈으로
            </Link>
            {isAuthenticated && (
              <Link
                href="/contact/history"
                className="rounded-lg bg-[#2d6a4f] px-5 py-2.5 text-sm font-medium text-[#f5f3ee] transition-colors hover:bg-[#235840]"
              >
                내 문의 내역
              </Link>
            )}
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-12">
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-bold text-[#141412]">문의하기</h1>
          <p className="mt-2 text-sm text-[#72706a]">
            궁금한 점이나 불편한 사항이 있으시면 문의해주세요.
          </p>

          {isAuthenticated && (
            <div className="mt-4">
              <Link
                href="/contact/history"
                className="text-sm font-medium text-[#2d6a4f] underline underline-offset-2 hover:text-[#235840] transition-colors"
              >
                내 문의 내역 보기
              </Link>
            </div>
          )}
        </motion.div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* 이름 */}
          <motion.div variants={fadeUp}>
            <label className="block text-[13px] font-medium text-[#1a1918]">
              이름
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              readOnly={isAuthenticated && !!user?.name}
              className="mt-1.5 w-full rounded-lg border border-[#e2ddd6] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 read-only:bg-[#f0ede8] read-only:text-[#72706a]"
            />
          </motion.div>

          {/* 이메일 */}
          <motion.div variants={fadeUp}>
            <label className="block text-[13px] font-medium text-[#1a1918]">
              이메일
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              readOnly={isAuthenticated && !!user?.email}
              className="mt-1.5 w-full rounded-lg border border-[#e2ddd6] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 read-only:bg-[#f0ede8] read-only:text-[#72706a]"
            />
          </motion.div>

          {/* 문의 유형 */}
          <motion.div variants={fadeUp}>
            <label className="block text-[13px] font-medium text-[#1a1918]">
              문의 유형
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-lg border border-[#e2ddd6] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 text-[#1a1918]"
            >
              <option value="">선택해주세요</option>
              {INQUIRY_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </motion.div>

          {/* 제목 */}
          <motion.div variants={fadeUp}>
            <label className="block text-[13px] font-medium text-[#1a1918]">
              제목
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="문의 제목을 입력해주세요"
              className="mt-1.5 w-full rounded-lg border border-[#e2ddd6] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 placeholder:text-[#a8a49c]"
            />
          </motion.div>

          {/* 내용 */}
          <motion.div variants={fadeUp}>
            <label className="block text-[13px] font-medium text-[#1a1918]">
              내용
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={6}
              placeholder="문의 내용을 자세히 입력해주세요"
              className="mt-1.5 w-full resize-none rounded-lg border border-[#e2ddd6] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 placeholder:text-[#a8a49c]"
            />
          </motion.div>

          {error && (
            <motion.div variants={fadeUp}>
              <p className="text-[13px] text-red-600">{error}</p>
            </motion.div>
          )}

          <motion.div variants={fadeUp}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="press-scale w-full rounded-lg bg-[#2d6a4f] py-3 text-sm font-medium text-[#f5f3ee] transition-colors hover:bg-[#235840] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "접수 중..." : "문의 접수"}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
