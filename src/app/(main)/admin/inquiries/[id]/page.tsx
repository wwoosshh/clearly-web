"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

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
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  PENDING: { text: "대기중", color: "bg-amber-100 text-amber-700" },
  ANSWERED: { text: "답변완료", color: "bg-green-100 text-green-700" },
  CLOSED: { text: "종료", color: "bg-gray-100 text-gray-500" },
};

export default function AdminInquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await api.get(`/inquiries/admin/${params.id}`);
        const d = data.data ?? data;
        setInquiry(d);
        setAnswer(d.adminAnswer ?? "");
      } catch {
        router.replace("/admin/inquiries");
      } finally {
        setIsLoading(false);
      }
    }
    fetch();
  }, [params.id, router]);

  async function handleAnswer() {
    if (!answer.trim()) return;
    setIsSaving(true);
    try {
      const { data } = await api.patch(`/inquiries/admin/${params.id}/answer`, {
        adminAnswer: answer,
      });
      setInquiry(data.data ?? data);
    } catch {
      // 에러 무시
    } finally {
      setIsSaving(false);
    }
  }

  async function handleClose() {
    if (!confirm("문의를 종료하시겠습니까?")) return;
    try {
      const { data } = await api.patch(`/inquiries/admin/${params.id}/close`);
      setInquiry(data.data ?? data);
    } catch {
      // 에러 무시
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  if (!inquiry) return null;

  const status = STATUS_LABELS[inquiry.status] ?? STATUS_LABELS.PENDING;

  return (
    <div>
      <Link
        href="/admin/inquiries"
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; 문의 목록
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900">{inquiry.title}</h1>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.color}`}
        >
          {status.text}
        </span>
      </div>

      {/* 문의 정보 카드 */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
        <div className="grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-4">
          <div>
            <p className="text-gray-400">이름</p>
            <p className="mt-1 font-medium text-gray-800">{inquiry.name}</p>
          </div>
          <div>
            <p className="text-gray-400">이메일</p>
            <p className="mt-1 font-medium text-gray-800">{inquiry.email}</p>
          </div>
          <div>
            <p className="text-gray-400">유형</p>
            <p className="mt-1 font-medium text-gray-800">
              {inquiry.category}
            </p>
          </div>
          <div>
            <p className="text-gray-400">접수일</p>
            <p className="mt-1 font-medium text-gray-800">
              {new Date(inquiry.createdAt).toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>
        {inquiry.user && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-[12px] text-gray-400">회원 정보</p>
            <p className="mt-1 text-[13px] text-gray-600">
              {inquiry.user.name} ({inquiry.user.email})
              {inquiry.user.phone && ` / ${inquiry.user.phone}`}
            </p>
          </div>
        )}
      </div>

      {/* 문의 내용 */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-[13px] font-semibold text-gray-500">문의 내용</h2>
        <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-gray-700">
          {inquiry.content}
        </p>
      </div>

      {/* 기존 답변 표시 */}
      {inquiry.adminAnswer && inquiry.status !== "PENDING" && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-5">
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

      {/* 답변 입력 */}
      {inquiry.status !== "CLOSED" && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-[15px] font-bold text-gray-900">
            {inquiry.status === "ANSWERED" ? "답변 수정" : "답변 작성"}
          </h2>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            placeholder="답변 내용을 입력하세요..."
            className="mt-3 w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          />
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleAnswer}
              disabled={isSaving || !answer.trim()}
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isSaving ? "저장 중..." : "답변 저장"}
            </button>
            {inquiry.status === "ANSWERED" && (
              <button
                onClick={handleClose}
                className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                문의 종료
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
