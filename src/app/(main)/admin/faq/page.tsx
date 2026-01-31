"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

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
  }, [filterCategory]);

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
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">FAQ 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            자주 묻는 질문을 관리합니다.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          새 FAQ
        </button>
      </div>

      {/* 카테고리 필터 */}
      {categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategory("")}
            className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
              !filterCategory
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                filterCategory === cat
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* 테이블 */}
      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      ) : faqs.length === 0 ? (
        <div className="mt-8 text-center text-sm text-gray-400">
          등록된 FAQ가 없습니다.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-[12px] font-medium text-gray-500">
                <th className="pb-3 pr-4">카테고리</th>
                <th className="pb-3 pr-4">질문</th>
                <th className="pb-3 pr-4 text-center">순서</th>
                <th className="pb-3 pr-4 text-center">노출</th>
                <th className="pb-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {faqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-gray-50">
                  <td className="py-3 pr-4 text-[13px] text-gray-500">
                    {faq.category}
                  </td>
                  <td className="max-w-xs truncate py-3 pr-4 text-[13px] font-medium text-gray-800">
                    {faq.question}
                  </td>
                  <td className="py-3 pr-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleMove(faq, "up")}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="위로"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 9L7 5L11 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <span className="text-[12px] text-gray-400">
                        {faq.sortOrder}
                      </span>
                      <button
                        onClick={() => handleMove(faq, "down")}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="아래로"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-center">
                    <button
                      onClick={() => handleToggleVisible(faq)}
                      className={`inline-block h-5 w-9 rounded-full transition-colors ${
                        faq.isVisible ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`block h-4 w-4 translate-y-[0.5px] rounded-full bg-white shadow transition-transform ${
                          faq.isVisible ? "translate-x-[18px]" : "translate-x-[2px]"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(faq)}
                        className="text-[12px] font-medium text-blue-600 hover:text-blue-800"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="text-[12px] font-medium text-red-600 hover:text-red-800"
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
      )}

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">
              {editingFaq ? "FAQ 수정" : "새 FAQ"}
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700">
                  카테고리
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  placeholder="예: 서비스 이용, 결제/환불"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700">
                  질문
                </label>
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) =>
                    setForm({ ...form, question: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700">
                  답변
                </label>
                <textarea
                  value={form.answer}
                  onChange={(e) =>
                    setForm({ ...form, answer: e.target.value })
                  }
                  rows={5}
                  className="mt-1 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[13px] font-medium text-gray-700">
                    정렬 순서
                  </label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-[13px] text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.isVisible}
                      onChange={(e) =>
                        setForm({ ...form, isVisible: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    노출
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {isSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
