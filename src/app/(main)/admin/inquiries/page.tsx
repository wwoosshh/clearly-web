"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface InquiryItem {
  id: string;
  name: string;
  email: string;
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

const TABS = [
  { key: "", label: "전체" },
  { key: "PENDING", label: "대기" },
  { key: "ANSWERED", label: "답변완료" },
  { key: "CLOSED", label: "종료" },
];

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInquiries();
  }, [activeTab, page]);

  async function fetchInquiries() {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (activeTab) params.status = activeTab;
      const { data } = await api.get("/inquiries/admin", { params });
      setInquiries(data.data ?? []);
      setTotalPages(data.meta?.totalPages ?? 1);
    } catch {
      // 에러 무시
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">문의 관리</h1>
      <p className="mt-1 text-sm text-gray-500">
        사용자 문의를 확인하고 답변합니다.
      </p>

      {/* 탭 */}
      <div className="mt-6 flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={`border-b-2 px-4 py-2 text-[13px] font-medium transition-colors ${
              activeTab === tab.key
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="mt-8 text-center text-sm text-gray-400">
          문의가 없습니다.
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-[12px] font-medium text-gray-500">
                  <th className="pb-3 pr-4">이름</th>
                  <th className="pb-3 pr-4">이메일</th>
                  <th className="pb-3 pr-4">유형</th>
                  <th className="pb-3 pr-4">제목</th>
                  <th className="pb-3 pr-4 text-center">상태</th>
                  <th className="pb-3 text-right">날짜</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inquiries.map((inquiry) => {
                  const status =
                    STATUS_LABELS[inquiry.status] ?? STATUS_LABELS.PENDING;
                  return (
                    <tr key={inquiry.id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4 text-[13px] text-gray-700">
                        {inquiry.name}
                      </td>
                      <td className="py-3 pr-4 text-[13px] text-gray-500">
                        {inquiry.email}
                      </td>
                      <td className="py-3 pr-4 text-[13px] text-gray-500">
                        {inquiry.category}
                      </td>
                      <td className="max-w-[200px] truncate py-3 pr-4">
                        <Link
                          href={`/admin/inquiries/${inquiry.id}`}
                          className="text-[13px] font-medium text-gray-800 hover:text-blue-600"
                        >
                          {inquiry.title}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.color}`}
                        >
                          {status.text}
                        </span>
                      </td>
                      <td className="py-3 text-right text-[12px] text-gray-400">
                        {new Date(inquiry.createdAt).toLocaleDateString(
                          "ko-KR"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                이전
              </button>
              <span className="text-[13px] text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
