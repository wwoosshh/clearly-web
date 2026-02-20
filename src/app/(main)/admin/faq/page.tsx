"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
}

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");

  // 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [form, setForm] = useState({
    category: "",
    question: "",
    answer: "",
    sortOrder: 0,
    isVisible: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, [filterCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchFaqs() {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { limit: 200 };
      if (filterCategory) params.category = filterCategory;
      const { data: res } = await api.get("/faq/admin", { params });
      const payload = res.data ?? res;
      setFaqs(payload.data ?? payload ?? []);
    } catch {
      // 에러 무시
    } finally {
      setIsLoading(false);
    }
  }

  function openCreate() {
    setEditingFaq(null);
    setForm({ category: "", question: "", answer: "", sortOrder: 0, isVisible: true });
    setShowModal(true);
  }

  function openEdit(faq: FaqItem) {
    setEditingFaq(faq);
    setForm({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      sortOrder: faq.sortOrder,
      isVisible: faq.isVisible,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.category || !form.question || !form.answer) return;
    setIsSaving(true);
    try {
      if (editingFaq) {
        await api.patch(`/faq/admin/${editingFaq.id}`, form);
      } else {
        await api.post("/faq/admin", form);
      }
      setShowModal(false);
      fetchFaqs();
    } catch {
      // 에러 무시
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/faq/admin/${id}`);
      fetchFaqs();
    } catch {
      // 에러 무시
    }
  }

  async function handleToggleVisible(faq: FaqItem) {
    try {
      await api.patch(`/faq/admin/${faq.id}`, {
        isVisible: !faq.isVisible,
      });
      fetchFaqs();
    } catch {
      // 에러 무시
    }
  }

  async function handleMove(faq: FaqItem, direction: "up" | "down") {
    const sameCat = faqs.filter((f) => f.category === faq.category);
    const idx = sameCat.findIndex((f) => f.id === faq.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sameCat.length) return;

    const items = [
      { id: sameCat[idx].id, sortOrder: sameCat[swapIdx].sortOrder },
      { id: sameCat[swapIdx].id, sortOrder: sameCat[idx].sortOrder },
    ];

    try {
      await api.patch("/faq/admin/reorder", items);
      fetchFaqs();
    } catch {
      // 에러 무시
    }
  }

  const categories = [...new Set(faqs.map((f) => f.category))];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#141412]">FAQ 관리</h1>
          <p className="mt-1 text-sm text-[#72706a]">자주 묻는 질문을 관리합니다.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-[#2d6a4f] px-4 py-2 text-sm font-medium text-[#f5f3ee] transition-colors hover:bg-[#4a8c6a]"
        >
          새 FAQ
        </button>
      </motion.div>

      {/* 카테고리 필터 */}
      {categories.length > 0 && (
        <motion.div variants={fadeUp} className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategory("")}
            className={cn(
              "rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
              !filterCategory
                ? "bg-[#2d6a4f] text-[#f5f3ee]"
                : "bg-[#f0ede8] text-[#72706a] hover:bg-[#e2ddd6]"
            )}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={cn(
                "rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                filterCategory === cat
                  ? "bg-[#2d6a4f] text-[#f5f3ee]"
                  : "bg-[#f0ede8] text-[#72706a] hover:bg-[#e2ddd6]"
              )}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      )}

      {/* 테이블 */}
      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#2d6a4f]" />
        </div>
      ) : faqs.length === 0 ? (
        <motion.div variants={fadeUp} className="mt-8 text-center text-sm text-[#72706a]">
          등록된 FAQ가 없습니다.
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="mt-6 overflow-hidden rounded-xl border border-[#e2ddd6] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-[#e2ddd6] bg-[#f0ede8]">
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">카테고리</th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">질문</th>
                  <th className="px-4 py-3 text-center text-[12px] font-semibold text-[#72706a]">순서</th>
                  <th className="px-4 py-3 text-center text-[12px] font-semibold text-[#72706a]">노출</th>
                  <th className="px-4 py-3 text-right text-[12px] font-semibold text-[#72706a]">관리</th>
                </tr>
              </thead>
              <tbody>
                {faqs.map((faq) => (
                  <tr key={faq.id} className="border-b border-[#e2ddd6] last:border-0 hover:bg-[#f5f3ee]">
                    <td className="px-4 py-3 text-[13px] text-[#72706a]">
                      {faq.category}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-[13px] font-medium text-[#1a1918]">
                      {faq.question}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleMove(faq, "up")}
                          className="rounded p-1 text-[#72706a] hover:bg-[#f0ede8] hover:text-[#1a1918]"
                          title="위로"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 9L7 5L11 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <span className="text-[12px] text-[#72706a]">
                          {faq.sortOrder}
                        </span>
                        <button
                          onClick={() => handleMove(faq, "down")}
                          className="rounded p-1 text-[#72706a] hover:bg-[#f0ede8] hover:text-[#1a1918]"
                          title="아래로"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleVisible(faq)}
                        className={cn(
                          "inline-block h-5 w-9 rounded-full transition-colors",
                          faq.isVisible ? "bg-[#2d6a4f]" : "bg-[#e2ddd6]"
                        )}
                      >
                        <span
                          className={cn(
                            "block h-4 w-4 translate-y-[0.5px] rounded-full bg-white shadow transition-transform",
                            faq.isVisible ? "translate-x-[18px]" : "translate-x-[2px]"
                          )}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEdit(faq)}
                          className="text-[12px] font-medium text-[#2d6a4f] hover:text-[#4a8c6a]"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(faq.id)}
                          className="text-[12px] font-medium text-red-600 hover:text-red-700"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-bold text-[#141412]">
              {editingFaq ? "FAQ 수정" : "새 FAQ"}
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#72706a]">카테고리</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="예: 서비스 이용, 결제/환불"
                  className="mt-1 w-full rounded-lg border border-[#e2ddd6] px-3 py-2 text-sm text-[#1a1918] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#72706a]">질문</label>
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#e2ddd6] px-3 py-2 text-sm text-[#1a1918] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#72706a]">답변</label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  rows={5}
                  className="mt-1 w-full resize-none rounded-lg border border-[#e2ddd6] px-3 py-2 text-sm text-[#1a1918] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[13px] font-medium text-[#72706a]">정렬 순서</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-[#e2ddd6] px-3 py-2 text-sm text-[#1a1918] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10"
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

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-[#e2ddd6] bg-[#f0ede8] px-4 py-2 text-sm font-medium text-[#1a1918] hover:bg-[#e2ddd6]"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-[#2d6a4f] px-4 py-2 text-sm font-medium text-[#f5f3ee] hover:bg-[#4a8c6a] disabled:opacity-50"
              >
                {isSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
