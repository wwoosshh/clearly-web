"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth.store";
import { useCacheStore, fetchWithCache } from "@/stores/cache.store";
import { Spinner } from "@/components/ui/Spinner";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { Estimate, EstimateRequest } from "@/types";
import { CLEANING_TYPE_LABELS } from "@/types";
import type { CleaningType } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function MatchingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isUser = user?.role === "USER";
  const [tab, setTab] = useState<"estimates" | "requests">("estimates");
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [requests, setRequests] = useState<EstimateRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    const cache = useCacheStore.getState();
    const cacheKey = `matching:${tab}`;
    const cached = cache.get<any[]>(cacheKey, 2 * 60 * 1000);

    if (cached) {
      if (tab === "estimates") setEstimates(cached);
      else setRequests(cached);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    try {
      if (tab === "estimates") {
        const { data } = await api.get("/estimates/my");
        const result = (data as any)?.data ?? data;
        const list = result?.data ?? (Array.isArray(result) ? result : []);
        cache.set(cacheKey, list);
        setEstimates(list);
      } else {
        const { data } = await api.get("/estimates/requests");
        const result = (data as any)?.data ?? data;
        const list = result?.data ?? (Array.isArray(result) ? result : []);
        cache.set(cacheKey, list);
        setRequests(list);
      }
    } catch {
      if (!cached) {
        setEstimates([]);
        setRequests([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (estimateId: string) => {
    setIsAccepting(true);
    try {
      const { data } = await api.patch(`/estimates/${estimateId}/accept`);
      const result = (data as any)?.data ?? data;
      const chatRoomId = result?.chatRoom?.id;
      useCacheStore.getState().invalidatePrefix("matching:");
      setSelectedEstimate(null);
      if (chatRoomId) {
        router.push(`/chat?roomId=${chatRoomId}`);
      } else {
        router.push("/chat");
      }
    } catch {
      // silent
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async (estimateId: string) => {
    setIsRejecting(true);
    try {
      await api.patch(`/estimates/${estimateId}/reject`);
      useCacheStore.getState().invalidatePrefix("matching:");
      setSelectedEstimate(null);
      loadData();
    } catch {
      // silent
    } finally {
      setIsRejecting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("ko-KR");
  };

  const formatDuration = (d?: string) => {
    if (!d) return "";
    const trimmed = d.trim();
    if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}시간`;
    return trimmed;
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; style: string }> = {
      SUBMITTED: { label: "대기중", style: "bg-[#fef9ee] text-[#b45309] border border-[#fde68a]" },
      ACCEPTED: { label: "수락됨", style: "bg-[#eef7f3] text-[#2d6a4f] border border-[#d4ede4]" },
      REJECTED: { label: "거절됨", style: "bg-red-50 text-red-600" },
      OPEN: { label: "모집중", style: "bg-[#fef9ee] text-[#b45309] border border-[#fde68a]" },
      CLOSED: { label: "마감", style: "bg-[#f0ede8] text-[#72706a]" },
      EXPIRED: { label: "만료", style: "bg-red-50 text-red-600" },
    };
    const info = map[status] || { label: status, style: "bg-[#f0ede8] text-[#72706a]" };
    return (
      <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-medium", info.style)}>
        {info.label}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <p className="text-[15px] text-[#72706a]">로그인이 필요합니다</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.div variants={fadeUp}>
          <h1 className="text-[24px] font-bold tracking-tight text-[#141412]">
            매칭 내역
          </h1>
          <p className="mt-1.5 text-[15px] text-[#72706a]">
            받은 견적과 견적요청 현황을 확인하세요
          </p>

          {/* 탭 - 내 견적요청은 USER 역할만 표시 */}
          <div className="mt-6 flex gap-1 rounded-lg bg-[#f0ede8] p-1">
            <button
              onClick={() => setTab("estimates")}
              className={cn(
                "flex-1 rounded-md py-2 text-[14px] font-medium transition-colors press-scale",
                tab === "estimates"
                  ? "bg-[#2d6a4f] text-[#f5f3ee] shadow-sm"
                  : "text-[#72706a] hover:text-[#2d6a4f]"
              )}
            >
              받은 견적
            </button>
            {isUser && (
              <button
                onClick={() => setTab("requests")}
                className={cn(
                  "flex-1 rounded-md py-2 text-[14px] font-medium transition-colors press-scale",
                  tab === "requests"
                    ? "bg-[#2d6a4f] text-[#f5f3ee] shadow-sm"
                    : "text-[#72706a] hover:text-[#2d6a4f]"
                )}
              >
                내 견적요청
              </button>
            )}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" className="text-[#4a8c6a]" />
          </div>
        ) : tab === "estimates" ? (
          // 받은 견적 목록
          estimates.length === 0 ? (
            <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0ede8]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#72706a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p className="mt-4 text-[15px] font-medium text-[#1a1918]">받은 견적이 없습니다</p>
              <p className="mt-1.5 text-[13px] text-[#72706a]">견적을 요청하면 업체들이 견적을 보내드립니다</p>
              <Link
                href="/estimate/request"
                className="mt-4 rounded-lg bg-[#2d6a4f] px-5 py-2.5 text-[13px] font-medium text-[#f5f3ee] hover:bg-[#4a8c6a] transition-colors press-scale"
              >
                견적 요청하기
              </Link>
            </motion.div>
          ) : (
            <>
              {estimates.map((est) => (
                <motion.div key={est.id} variants={fadeUp}>
                  <button
                    onClick={() => setSelectedEstimate(est)}
                    className="hover-lift mt-3 w-full rounded-xl border border-[#e2ddd6] bg-white p-5 text-left press-scale"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-[15px] font-bold text-[#141412]">
                          {est.company?.businessName || "업체"}
                        </h3>
                        <p className="mt-1 text-[13px] text-[#72706a]">
                          {est.estimateRequest?.cleaningType
                            ? CLEANING_TYPE_LABELS[est.estimateRequest.cleaningType as CleaningType]
                            : ""}
                          {est.estimateRequest?.address ? ` - ${est.estimateRequest.address}` : ""}
                        </p>
                      </div>
                      {getStatusBadge(est.status)}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-[14px]">
                      <span className="font-bold text-[#141412]">
                        {est.price.toLocaleString()}원
                      </span>
                      {est.estimatedDuration && (
                        <>
                          <span className="text-[#e2ddd6]">|</span>
                          <span className="text-[#72706a]">예상 {formatDuration(est.estimatedDuration)}</span>
                        </>
                      )}
                      {est.availableDate && (
                        <>
                          <span className="text-[#e2ddd6]">|</span>
                          <span className="text-[#72706a]">{formatDate(est.availableDate)}</span>
                        </>
                      )}
                    </div>
                    {est.message && (
                      <p className="mt-2 text-[13px] text-[#72706a] line-clamp-2">
                        {est.message}
                      </p>
                    )}
                  </button>
                </motion.div>
              ))}
            </>
          )
        ) : (
          // 내 견적요청 목록
          requests.length === 0 ? (
            <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0ede8]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#72706a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="mt-4 text-[15px] font-medium text-[#1a1918]">견적요청이 없습니다</p>
              <Link
                href="/estimate/request"
                className="mt-4 rounded-lg bg-[#2d6a4f] px-5 py-2.5 text-[13px] font-medium text-[#f5f3ee] hover:bg-[#4a8c6a] transition-colors press-scale"
              >
                견적 요청하기
              </Link>
            </motion.div>
          ) : (
            <>
              {requests.map((req) => (
                <motion.div key={req.id} variants={fadeUp}>
                  <div className="mt-3 rounded-xl border border-[#e2ddd6] bg-white p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-[15px] font-bold text-[#141412]">
                          {CLEANING_TYPE_LABELS[req.cleaningType as CleaningType] || req.cleaningType}
                        </h3>
                        <p className="mt-1 text-[13px] text-[#72706a]">{req.address}</p>
                      </div>
                      {getStatusBadge(req.status)}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-[#72706a]">
                      {req.desiredDate && <span>{formatDate(req.desiredDate)}</span>}
                      {req.areaSize && (
                        <>
                          <span className="text-[#e2ddd6]">|</span>
                          <span>{req.areaSize}평</span>
                        </>
                      )}
                      {req.budget && (
                        <>
                          <span className="text-[#e2ddd6]">|</span>
                          <span>예산 {req.budget.toLocaleString()}원</span>
                        </>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      {req.estimates && req.estimates.length > 0 && (
                        <p className="text-[13px] text-[#72706a]">
                          받은 견적 {req.estimates.length}건
                        </p>
                      )}
                      {req.estimates && req.estimates.length >= 2 && (
                        <button
                          onClick={() => router.push(`/estimate-compare/${req.id}`)}
                          className="rounded-lg border border-[#2d6a4f] px-3 py-1.5 text-[12px] font-medium text-[#2d6a4f] hover:bg-[#eef7f3] transition-colors press-scale"
                        >
                          견적 비교
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )
        )}
      </motion.div>

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
                <span className="text-[13px] text-[#72706a]">업체</span>
                <span className="text-[14px] font-medium text-[#141412]">
                  {selectedEstimate.company?.businessName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-[#72706a]">견적 금액</span>
                <span className="text-[16px] font-bold text-[#141412]">
                  {selectedEstimate.price.toLocaleString()}원
                </span>
              </div>
              {selectedEstimate.estimatedDuration && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-[#72706a]">예상 소요시간</span>
                  <span className="text-[14px] text-[#1a1918]">
                    {formatDuration(selectedEstimate.estimatedDuration)}
                  </span>
                </div>
              )}
              {selectedEstimate.availableDate && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-[#72706a]">가능 날짜</span>
                  <span className="text-[14px] text-[#1a1918]">
                    {formatDate(selectedEstimate.availableDate)}
                  </span>
                </div>
              )}
              {selectedEstimate.company?.averageRating != null && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-[#72706a]">업체 평점</span>
                  <span className="text-[14px] text-[#1a1918]">
                    {Number(selectedEstimate.company.averageRating).toFixed(1)} ({selectedEstimate.company.totalReviews}개 리뷰)
                  </span>
                </div>
              )}
            </div>
            {selectedEstimate.message && (
              <div className="mt-4 rounded-lg bg-[#f0ede8] p-4">
                <p className="text-[13px] font-medium text-[#72706a] mb-1">업체 메시지</p>
                <p className="text-[14px] text-[#1a1918] whitespace-pre-wrap break-words">
                  {selectedEstimate.message}
                </p>
              </div>
            )}
            {selectedEstimate.status === "SUBMITTED" && (
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => handleReject(selectedEstimate.id)}
                  disabled={isRejecting || isAccepting}
                  className="flex h-[38px] flex-1 items-center justify-center rounded-lg border border-red-200 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 press-scale"
                >
                  {isRejecting ? "처리중..." : "견적 거부"}
                </button>
                <button
                  onClick={() => handleAccept(selectedEstimate.id)}
                  disabled={isAccepting || isRejecting}
                  className="flex h-[38px] flex-1 items-center justify-center rounded-lg bg-[#2d6a4f] text-[13px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#4a8c6a] disabled:opacity-50 press-scale"
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
