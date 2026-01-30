"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui/Spinner";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { Estimate, EstimateRequest } from "@/types";
import { CLEANING_TYPE_LABELS } from "@/types";
import type { CleaningType } from "@/types";

export default function MatchingPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<"estimates" | "requests">("estimates");
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [requests, setRequests] = useState<EstimateRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (tab === "estimates") {
        const { data } = await api.get("/estimates/my");
        const result = (data as any)?.data ?? data;
        setEstimates(result?.data ?? (Array.isArray(result) ? result : []));
      } else {
        const { data } = await api.get("/estimates/requests");
        const result = (data as any)?.data ?? data;
        setRequests(result?.data ?? (Array.isArray(result) ? result : []));
      }
    } catch {
      setEstimates([]);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (estimateId: string) => {
    setIsAccepting(true);
    try {
      await api.patch(`/estimates/${estimateId}/accept`);
      setSelectedEstimate(null);
      loadData();
    } catch {
      // silent
    } finally {
      setIsAccepting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("ko-KR");
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; style: string }> = {
      SUBMITTED: { label: "대기중", style: "bg-gray-100 text-gray-700" },
      ACCEPTED: { label: "수락됨", style: "bg-green-50 text-green-700" },
      REJECTED: { label: "거절됨", style: "bg-red-50 text-red-600" },
      OPEN: { label: "모집중", style: "bg-gray-100 text-gray-700" },
      CLOSED: { label: "마감", style: "bg-gray-200 text-gray-500" },
      EXPIRED: { label: "만료", style: "bg-red-50 text-red-600" },
    };
    const info = map[status] || { label: status, style: "bg-gray-100 text-gray-600" };
    return (
      <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-medium", info.style)}>
        {info.label}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-[15px] text-gray-500">로그인이 필요합니다</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-[24px] font-bold tracking-tight text-gray-900">
        매칭 내역
      </h1>
      <p className="mt-1.5 text-[15px] text-gray-500">
        받은 견적과 견적요청 현황을 확인하세요
      </p>

      {/* 탭 */}
      <div className="mt-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setTab("estimates")}
          className={cn(
            "flex-1 rounded-md py-2 text-[14px] font-medium transition-colors",
            tab === "estimates"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          받은 견적
        </button>
        <button
          onClick={() => setTab("requests")}
          className={cn(
            "flex-1 rounded-md py-2 text-[14px] font-medium transition-colors",
            tab === "requests"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          내 견적요청
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" className="text-gray-400" />
        </div>
      ) : tab === "estimates" ? (
        // 받은 견적 목록
        estimates.length === 0 ? (
          <div className="mt-12 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="mt-4 text-[15px] font-medium text-gray-700">받은 견적이 없습니다</p>
            <p className="mt-1.5 text-[13px] text-gray-500">견적을 요청하면 업체들이 견적을 보내드립니다</p>
            <Link
              href="/estimate/request"
              className="mt-4 rounded-lg bg-gray-900 px-5 py-2.5 text-[13px] font-medium text-white hover:bg-gray-800"
            >
              견적 요청하기
            </Link>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {estimates.map((est) => (
              <button
                key={est.id}
                onClick={() => setSelectedEstimate(est)}
                className="rounded-xl border border-gray-200 bg-white p-5 text-left transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[15px] font-bold text-gray-900">
                      {est.company?.businessName || "업체"}
                    </h3>
                    <p className="mt-1 text-[13px] text-gray-500">
                      {est.estimateRequest?.cleaningType
                        ? CLEANING_TYPE_LABELS[est.estimateRequest.cleaningType as CleaningType]
                        : ""}
                      {est.estimateRequest?.address ? ` - ${est.estimateRequest.address}` : ""}
                    </p>
                  </div>
                  {getStatusBadge(est.status)}
                </div>
                <div className="mt-3 flex items-center gap-4 text-[14px]">
                  <span className="font-bold text-gray-900">
                    {est.price.toLocaleString()}원
                  </span>
                  {est.estimatedDuration && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-500">예상 {est.estimatedDuration}</span>
                    </>
                  )}
                  {est.availableDate && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-500">{formatDate(est.availableDate)}</span>
                    </>
                  )}
                </div>
                {est.message && (
                  <p className="mt-2 text-[13px] text-gray-500 line-clamp-2">
                    {est.message}
                  </p>
                )}
              </button>
            ))}
          </div>
        )
      ) : (
        // 내 견적요청 목록
        requests.length === 0 ? (
          <div className="mt-12 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="mt-4 text-[15px] font-medium text-gray-700">견적요청이 없습니다</p>
            <Link
              href="/estimate/request"
              className="mt-4 rounded-lg bg-gray-900 px-5 py-2.5 text-[13px] font-medium text-white hover:bg-gray-800"
            >
              견적 요청하기
            </Link>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="rounded-xl border border-gray-200 bg-white p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[15px] font-bold text-gray-900">
                      {CLEANING_TYPE_LABELS[req.cleaningType as CleaningType] || req.cleaningType}
                    </h3>
                    <p className="mt-1 text-[13px] text-gray-500">{req.address}</p>
                  </div>
                  {getStatusBadge(req.status)}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-gray-500">
                  {req.desiredDate && <span>{formatDate(req.desiredDate)}</span>}
                  {req.areaSize && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span>{req.areaSize}평</span>
                    </>
                  )}
                  {req.budget && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span>예산 {req.budget.toLocaleString()}원</span>
                    </>
                  )}
                </div>
                {req.estimates && req.estimates.length > 0 && (
                  <p className="mt-2 text-[13px] text-gray-600">
                    받은 견적 {req.estimates.length}건
                  </p>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* 견적 상세 모달 */}
      <Modal
        isOpen={!!selectedEstimate}
        onClose={() => setSelectedEstimate(null)}
        title="견적 상세"
      >
        {selectedEstimate && (
          <div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[13px] text-gray-500">업체</span>
                <span className="text-[14px] font-medium text-gray-900">
                  {selectedEstimate.company?.businessName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-gray-500">견적 금액</span>
                <span className="text-[16px] font-bold text-gray-900">
                  {selectedEstimate.price.toLocaleString()}원
                </span>
              </div>
              {selectedEstimate.estimatedDuration && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-gray-500">예상 소요시간</span>
                  <span className="text-[14px] text-gray-700">
                    {selectedEstimate.estimatedDuration}
                  </span>
                </div>
              )}
              {selectedEstimate.availableDate && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-gray-500">가능 날짜</span>
                  <span className="text-[14px] text-gray-700">
                    {formatDate(selectedEstimate.availableDate)}
                  </span>
                </div>
              )}
              {selectedEstimate.company?.averageRating != null && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-gray-500">업체 평점</span>
                  <span className="text-[14px] text-gray-700">
                    {Number(selectedEstimate.company.averageRating).toFixed(1)} ({selectedEstimate.company.totalReviews}개 리뷰)
                  </span>
                </div>
              )}
            </div>
            {selectedEstimate.message && (
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <p className="text-[13px] font-medium text-gray-500 mb-1">업체 메시지</p>
                <p className="text-[14px] text-gray-700 whitespace-pre-wrap">
                  {selectedEstimate.message}
                </p>
              </div>
            )}
            {selectedEstimate.status === "SUBMITTED" && (
              <div className="mt-5 flex gap-2">
                <Link
                  href={`/chat?companyId=${selectedEstimate.companyId}`}
                  className="flex h-[38px] flex-1 items-center justify-center rounded-lg border border-gray-200 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  onClick={() => setSelectedEstimate(null)}
                >
                  채팅 상담
                </Link>
                <button
                  onClick={() => handleAccept(selectedEstimate.id)}
                  disabled={isAccepting}
                  className="flex h-[38px] flex-1 items-center justify-center rounded-lg bg-gray-900 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                >
                  {isAccepting ? "처리중..." : "견적 수락"}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
