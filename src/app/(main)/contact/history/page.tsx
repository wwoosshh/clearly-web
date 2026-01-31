"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

interface InquirySummary {
  id: string;
  category: string;
  title: string;
  status: "PENDING" | "ANSWERED" | "CLOSED";
  createdAt: string;
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  PENDING: { text: "대기중", color: "bg-amber-100 text-amber-700" },
  ANSWERED: { text: "답변완료", color: "bg-green-100 text-green-700" },
  CLOSED: { text: "종료", color: "bg-gray-100 text-gray-500" },
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">내 문의 내역</h1>
          <p className="mt-1 text-sm text-gray-500">
            접수한 문의의 처리 현황을 확인하세요.
          </p>
        </div>
        <Link
          href="/contact"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          새 문의
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-12 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-gray-400">접수한 문의가 없습니다.</p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-gray-100 rounded-xl border border-gray-200">
          {inquiries.map((inquiry) => {
            const status = STATUS_LABELS[inquiry.status] ?? STATUS_LABELS.PENDING;
            return (
              <Link
                key={inquiry.id}
                href={`/contact/history/${inquiry.id}`}
                className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-gray-400">
                      {inquiry.category}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.color}`}
                    >
                      {status.text}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[14px] font-medium text-gray-800">
                    {inquiry.title}
                  </p>
                  <p className="mt-0.5 text-[12px] text-gray-400">
                    {new Date(inquiry.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <span className="ml-4 shrink-0 text-gray-300">
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
            );
          })}
        </div>
      )}
    </div>
  );
}
