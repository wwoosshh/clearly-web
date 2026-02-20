"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

interface FaqDetail {
  id: string;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
  isVisible: boolean;
}

export default function AdminFaqEditPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    category: "",
    question: "",
    answer: "",
    sortOrder: 0,
    isVisible: true,
  });

  useEffect(() => {
    async function fetch() {
      try {
        const { data: res } = await api.get("/faq/admin", { params: { limit: 200 } });
        const payload = res.data ?? res;
        const faqs: FaqDetail[] = payload.data ?? payload ?? [];
        const faq = faqs.find((f) => f.id === params.id);
        if (faq) {
          setForm({
            category: faq.category,
            question: faq.question,
            answer: faq.answer,
            sortOrder: faq.sortOrder,
            isVisible: faq.isVisible,
          });
        } else {
          router.replace("/admin/faq");
        }
      } catch {
        router.replace("/admin/faq");
      } finally {
        setIsLoading(false);
      }
    }
    fetch();
  }, [params.id, router]);

  async function handleSave() {
    setIsSaving(true);
    try {
      await api.patch(`/faq/admin/${params.id}`, form);
      router.push("/admin/faq");
    } catch {
      // 에러 무시
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#2d6a4f]" />
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <Link
          href="/admin/faq"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#72706a] hover:text-[#1a1918] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          FAQ 목록
        </Link>
      </motion.div>

      <motion.h1 variants={fadeUp} className="mt-4 text-xl font-bold text-[#141412]">FAQ 수정</motion.h1>

      <motion.div variants={fadeUp} className="mt-6 rounded-xl border border-[#e2ddd6] bg-white p-4 sm:p-6">
        <div className="space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-[#72706a]">카테고리</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#e2ddd6] px-4 py-2.5 text-sm text-[#1a1918] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#72706a]">질문</label>
            <input
              type="text"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#e2ddd6] px-4 py-2.5 text-sm text-[#1a1918] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#72706a]">답변</label>
            <textarea
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              rows={8}
              className="mt-1 w-full resize-none rounded-lg border border-[#e2ddd6] px-4 py-2.5 text-sm text-[#1a1918] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[13px] font-medium text-[#72706a]">정렬 순서</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                className="mt-1 w-full rounded-lg border border-[#e2ddd6] px-4 py-2.5 text-sm text-[#1a1918] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-[13px] text-[#72706a]">
                <input
                  type="checkbox"
                  checked={form.isVisible}
                  onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
                  className="h-4 w-4 rounded border-[#e2ddd6] accent-[#2d6a4f]"
                />
                노출
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => router.push("/admin/faq")}
            className="rounded-lg border border-[#e2ddd6] bg-[#f0ede8] px-5 py-2.5 text-sm font-medium text-[#1a1918] hover:bg-[#e2ddd6]"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-[#2d6a4f] px-5 py-2.5 text-sm font-medium text-[#f5f3ee] hover:bg-[#4a8c6a] disabled:opacity-50"
          >
            {isSaving ? "저장 중..." : "저장"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
