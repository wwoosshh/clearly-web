"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

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
        const { data } = await api.get("/faq/admin", { params: { limit: 200 } });
        const faqs: FaqDetail[] = data.data ?? [];
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/faq"
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; FAQ 목록
      </Link>

      <h1 className="mt-4 text-xl font-bold text-gray-900">FAQ 수정</h1>

      <div className="mt-6 space-y-5">
        <div>
          <label className="block text-[13px] font-medium text-gray-700">
            카테고리
          </label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-gray-700">
            질문
          </label>
          <input
            type="text"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-gray-700">
            답변
          </label>
          <textarea
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            rows={8}
            className="mt-1 w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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

      <div className="mt-8 flex gap-3">
        <button
          onClick={() => router.push("/admin/faq")}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isSaving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}
