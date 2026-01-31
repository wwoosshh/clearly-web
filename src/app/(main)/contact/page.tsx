"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

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
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
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
        <h1 className="mt-6 text-xl font-bold text-gray-900">
          문의가 접수되었습니다
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          빠른 시일 내에 답변 드리겠습니다. 감사합니다.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            홈으로
          </Link>
          {isAuthenticated && (
            <Link
              href="/contact/history"
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              내 문의 내역
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900">문의하기</h1>
      <p className="mt-2 text-sm text-gray-500">
        궁금한 점이나 불편한 사항이 있으시면 문의해주세요.
      </p>

      {isAuthenticated && (
        <div className="mt-4">
          <Link
            href="/contact/history"
            className="text-sm font-medium text-gray-600 underline underline-offset-2 hover:text-gray-900"
          >
            내 문의 내역 보기
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {/* 이름 */}
        <div>
          <label className="block text-[13px] font-medium text-gray-700">
            이름
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            readOnly={isAuthenticated && !!user?.name}
            className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900 read-only:bg-gray-50 read-only:text-gray-500"
          />
        </div>

        {/* 이메일 */}
        <div>
          <label className="block text-[13px] font-medium text-gray-700">
            이메일
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            readOnly={isAuthenticated && !!user?.email}
            className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900 read-only:bg-gray-50 read-only:text-gray-500"
          />
        </div>

        {/* 문의 유형 */}
        <div>
          <label className="block text-[13px] font-medium text-gray-700">
            문의 유형
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          >
            <option value="">선택해주세요</option>
            {INQUIRY_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-[13px] font-medium text-gray-700">
            제목
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="문의 제목을 입력해주세요"
            className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-[13px] font-medium text-gray-700">
            내용
          </label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows={6}
            placeholder="문의 내용을 자세히 입력해주세요"
            className="mt-1.5 w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </div>

        {error && (
          <p className="text-[13px] text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "접수 중..." : "문의 접수"}
        </button>
      </form>
    </div>
  );
}
