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

interface InquiryItem {
  id: string;
  name: string;
  email: string;
  category: string;
  title: string;
  status: "PENDING" | "ANSWERED" | "CLOSED";
  createdAt: string;
}

const STATUS_LABELS: Record<string, { text: string; style: string }> = {
  PENDING: { text: "대기중", style: "bg-[#fef9ee] text-[#b45309]" },
  ANSWERED: { text: "답변완료", style: "bg-[#eef7f3] text-[#2d6a4f]" },
  CLOSED: { text: "종료", style: "bg-[#f0ede8] text-[#72706a]" },
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
  }, [activeTab, page]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchInquiries() {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (activeTab) params.status = activeTab;
      const { data: res } = await api.get("/inquiries/admin", { params });
      const payload = res.data ?? res;
      setInquiries(payload.data ?? []);
      setTotalPages(payload.meta?.totalPages ?? 1);
    } catch {
      // 에러 무시
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-bold text-[#141412]">문의 관리</h1>
        <p className="mt-1 text-sm text-[#72706a]">
          사용자 문의를 확인하고 답변합니다.
        </p>
      </motion.div>

      {/* 탭 */}
      <motion.div variants={fadeUp} className="mt-6 flex gap-1 rounded-lg bg-[#f0ede8] p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
              activeTab === tab.key
                ? "bg-white text-[#141412] shadow-sm"
                : "text-[#72706a] hover:text-[#1a1918]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* 테이블 */}
      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2ddd6] border-t-[#2d6a4f]" />
        </div>
      ) : inquiries.length === 0 ? (
        <motion.div variants={fadeUp} className="mt-8 text-center text-sm text-[#72706a]">
          문의가 없습니다.
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div variants={fadeUp} className="mt-4 overflow-hidden rounded-xl border border-[#e2ddd6] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#e2ddd6] bg-[#f0ede8]">
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">이름</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">이메일</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">유형</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#72706a]">제목</th>
                    <th className="px-4 py-3 text-center text-[12px] font-semibold text-[#72706a]">상태</th>
                    <th className="px-4 py-3 text-right text-[12px] font-semibold text-[#72706a]">날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inquiry) => {
                    const status = STATUS_LABELS[inquiry.status] ?? STATUS_LABELS.PENDING;
                    return (
                      <tr key={inquiry.id} className="border-b border-[#e2ddd6] last:border-0 hover:bg-[#f5f3ee]">
                        <td className="px-4 py-3 text-[13px] text-[#1a1918]">
                          {inquiry.name}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#72706a]">
                          {inquiry.email}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#72706a]">
                          {inquiry.category}
                        </td>
                        <td className="max-w-[200px] truncate px-4 py-3">
                          <Link
                            href={`/admin/inquiries/${inquiry.id}`}
                            className="text-[13px] font-medium text-[#1a1918] hover:text-[#2d6a4f]"
                          >
                            {inquiry.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold", status.style)}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-[12px] text-[#72706a]">
                          {new Date(inquiry.createdAt).toLocaleDateString("ko-KR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <motion.div variants={fadeUp} className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-[#e2ddd6] bg-[#f0ede8] px-3 py-1.5 text-[13px] font-medium text-[#1a1918] hover:bg-[#e2ddd6] disabled:opacity-40"
              >
                이전
              </button>
              <span className="text-[13px] text-[#72706a]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-[#e2ddd6] bg-[#f0ede8] px-3 py-1.5 text-[13px] font-medium text-[#1a1918] hover:bg-[#e2ddd6] disabled:opacity-40"
              >
                다음
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
