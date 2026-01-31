"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

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
  ANSWERED: { text: "답변완료", color: "bg-green-100 text-green-700" },
  CLOSED: { text: "종료", color: "bg-gray-100 text-gray-500" },
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  if (!inquiry) return null;

  const status = STATUS_LABELS[inquiry.status] ?? STATUS_LABELS.PENDING;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <Link
        href="/contact/history"
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; 목록으로
      </Link>

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-gray-400">
            {inquiry.category}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.color}`}
          >
            {status.text}
          </span>
        </div>
        <h1 className="mt-2 text-xl font-bold text-gray-900">
          {inquiry.title}
        </h1>
        <p className="mt-1 text-[12px] text-gray-400">
          {new Date(inquiry.createdAt).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* 문의 내용 */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-[13px] font-semibold text-gray-500">문의 내용</h2>
        <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-gray-700">
          {inquiry.content}
        </p>
      </div>

      {/* 관리자 답변 */}
      {inquiry.adminAnswer && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-6">
          <h2 className="text-[13px] font-semibold text-green-700">
            관리자 답변
          </h2>
          {inquiry.answeredAt && (
            <p className="mt-1 text-[12px] text-green-600">
              {new Date(inquiry.answeredAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
          <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-green-800">
            {inquiry.adminAnswer}
          </p>
        </div>
      )}

      {inquiry.status === "PENDING" && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-[13px] text-amber-700">
            답변을 준비 중입니다. 빠른 시일 내에 답변드리겠습니다.
          </p>
        </div>
      )}
    </div>
  );
}
