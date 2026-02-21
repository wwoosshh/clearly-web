"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth.store";
import { useCacheStore } from "@/stores/cache.store";
import { Spinner } from "@/components/ui/Spinner";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { unwrapPaginatedResponse } from "@/lib/apiHelpers";
import type { EstimateRequest, CleaningType } from "@/types";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { CLEANING_TYPE_LABELS } from "@/types";
import EstimateLimitBanner from "@/components/subscription/EstimateLimitBanner";
import { useSubscriptionStore } from "@/stores/subscription.store";

const ImageLightbox = dynamic(
  () => import("@/components/ui/ImageLightbox").then((m) => m.ImageLightbox),
  { ssr: false },
);

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function EstimatesPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<EstimateRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<EstimateRequest | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const { estimateLimit, fetchEstimateLimit } = useSubscriptionStore();

  // 견적 작성 폼
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [availableDate, setAvailableDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [estimateImages, setEstimateImages] = useState<string[]>([]);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    const cache = useCacheStore.getState();
    const cached = cache.get<EstimateRequest[]>("estimates:requests", 2 * 60 * 1000);
    if (cached) {
      setRequests(cached);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await api.get("/estimates/requests");
      const { data: list } = unwrapPaginatedResponse<EstimateRequest>(response);
      cache.set("estimates:requests", list);
      setRequests(list);
      fetchEstimateLimit();
    } catch {
      if (!cached) setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEstimate = async () => {
    if (!selectedRequest || !price) return;
    setIsSubmitting(true);
    setSubmitError("");

    try {
      await api.post(`/estimates/requests/${selectedRequest.id}/submit`, {
        price: parseInt(price),
        message: message || undefined,
        estimatedDuration: estimatedDuration || undefined,
        availableDate: availableDate || undefined,
        images: estimateImages.length > 0 ? estimateImages : undefined,
      });
      useCacheStore.getState().invalidatePrefix("estimates:");
      setShowConfirmModal(false);
      setShowSubmitForm(false);
      setSelectedRequest(null);
      resetForm();
      loadData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "견적 제출에 실패했습니다.";
      setSubmitError(msg);
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPrice("");
    setMessage("");
    setEstimatedDuration("");
    setAvailableDate("");
    setSubmitError("");
    setEstimateImages([]);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("ko-KR");
  };

  if (!user || user.role !== "COMPANY") {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <p className="text-[15px] text-[#72706a]">업체 회원만 접근할 수 있습니다</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" className="text-[#4a8c6a]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.div variants={fadeUp}>
          <div>
            <h1 className="text-[24px] font-bold tracking-tight text-[#141412]">
              견적 요청 목록
            </h1>
            <p className="mt-1.5 text-[15px] text-[#72706a]">
              고객의 견적 요청에 견적을 제출하세요
            </p>
          </div>

          <div className="mt-4">
            <EstimateLimitBanner />
          </div>
        </motion.div>

        {requests.length === 0 ? (
          <motion.div variants={fadeUp} className="mt-12 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0ede8]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#72706a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="mt-4 text-[15px] font-medium text-[#1a1918]">
              현재 견적 요청이 없습니다
            </p>
            <p className="mt-1.5 text-[13px] text-[#72706a]">
              새로운 견적 요청이 들어오면 여기에 표시됩니다
            </p>
          </motion.div>
        ) : (
          <>
            {requests.map((req) => (
              <motion.div key={req.id} variants={fadeUp}>
                <button
                  onClick={() => {
                    setSelectedRequest(req);
                    setShowSubmitForm(false);
                    resetForm();
                  }}
                  className="hover-lift mt-3 w-full rounded-xl border border-[#e2ddd6] bg-white p-5 text-left press-scale"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-[15px] font-bold text-[#141412]">
                      {CLEANING_TYPE_LABELS[req.cleaningType as CleaningType] || req.cleaningType}
                    </h3>
                    <span className="rounded-full bg-[#f0ede8] px-2.5 py-0.5 text-[12px] font-medium text-[#72706a]">
                      {req.estimates?.length || 0}건 견적
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] text-[#72706a]">{req.address}</p>
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
                  <p className="mt-2 text-[13px] text-[#72706a] line-clamp-2">
                    {req.message}
                  </p>
                </button>
              </motion.div>
            ))}
          </>
        )}
      </motion.div>

      {/* 견적요청 상세 + 견적 작성 모달 */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => {
          setSelectedRequest(null);
          setShowSubmitForm(false);
          resetForm();
        }}
        title="견적 요청 상세"
        size="lg"
      >
        {selectedRequest && (
          <div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[13px] text-[#72706a]">청소 유형</span>
                <span className="text-[14px] font-medium text-[#141412]">
                  {CLEANING_TYPE_LABELS[selectedRequest.cleaningType as CleaningType]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-[#72706a]">주소</span>
                <span className="text-[14px] text-[#1a1918]">
                  {selectedRequest.address}
                  {selectedRequest.detailAddress ? ` ${selectedRequest.detailAddress}` : ""}
                </span>
              </div>
              {selectedRequest.areaSize && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-[#72706a]">면적</span>
                  <span className="text-[14px] text-[#1a1918]">{selectedRequest.areaSize}평</span>
                </div>
              )}
              {selectedRequest.desiredDate && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-[#72706a]">희망 날짜</span>
                  <span className="text-[14px] text-[#1a1918]">{formatDate(selectedRequest.desiredDate)}</span>
                </div>
              )}
              {selectedRequest.desiredTime && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-[#72706a]">희망 시간</span>
                  <span className="text-[14px] text-[#1a1918]">{selectedRequest.desiredTime}</span>
                </div>
              )}
              {selectedRequest.budget && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-[#72706a]">예산</span>
                  <span className="text-[14px] text-[#1a1918]">{selectedRequest.budget.toLocaleString()}원</span>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-lg bg-[#f0ede8] p-4">
              <p className="text-[13px] font-medium text-[#72706a] mb-1">상세 설명</p>
              <p className="text-[14px] text-[#1a1918] whitespace-pre-wrap break-words">
                {selectedRequest.message}
              </p>
            </div>

            {/* 견적요청 첨부 사진 */}
            {selectedRequest.images && selectedRequest.images.length > 0 && (
              <div className="mt-4">
                <p className="text-[13px] font-medium text-[#72706a] mb-2">첨부 사진</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selectedRequest.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setLightboxImages(selectedRequest.images!);
                        setLightboxIndex(idx);
                      }}
                      className="flex-shrink-0"
                    >
                      <img
                        src={img}
                        alt={`첨부 사진 ${idx + 1}`}
                        className="h-16 w-16 rounded-lg border border-[#e2ddd6] object-cover hover:opacity-80 transition-opacity"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!showSubmitForm ? (
              <button
                onClick={() => setShowSubmitForm(true)}
                className="mt-5 flex h-[42px] w-full items-center justify-center rounded-lg bg-[#2d6a4f] text-[14px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#4a8c6a] press-scale"
              >
                견적 작성하기
              </button>
            ) : (
              <div className="mt-5 border-t border-[#e2ddd6] pt-5">
                <h3 className="text-[15px] font-bold text-[#141412] mb-4">견적 작성</h3>

                {submitError && (
                  <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600">
                    {submitError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-[13px] font-medium text-[#1a1918] mb-1.5 block">
                      견적 가격 (원) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="예: 300000"
                      className="h-[44px] w-full rounded-lg border border-[#e2ddd6] px-3.5 text-[14px] focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-[#1a1918] mb-1.5 block">가능 날짜</label>
                    <input
                      type="date"
                      value={availableDate}
                      onChange={(e) => setAvailableDate(e.target.value)}
                      className="h-[44px] w-full rounded-lg border border-[#e2ddd6] px-3.5 text-[14px] focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-[#1a1918] mb-1.5 block">예상 소요시간</label>
                    <input
                      type="text"
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                      placeholder="예: 3~4시간"
                      className="h-[44px] w-full rounded-lg border border-[#e2ddd6] px-3.5 text-[14px] focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-[#1a1918] mb-1.5 block">메시지</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="고객에게 전달할 메시지"
                      rows={3}
                      className="w-full rounded-lg border border-[#e2ddd6] px-3.5 py-3 text-[14px] resize-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 focus:outline-none"
                    />
                  </div>
                  <ImageUpload
                    label="참고 사진 (선택)"
                    maxFiles={10}
                    bucket="estimates"
                    value={estimateImages}
                    onChange={setEstimateImages}
                  />
                </div>

                <button
                  onClick={() => {
                    if (!price) return;
                    setShowConfirmModal(true);
                  }}
                  disabled={!price}
                  className="mt-4 flex h-[42px] w-full items-center justify-center rounded-lg bg-[#2d6a4f] text-[14px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#4a8c6a] disabled:opacity-50 disabled:cursor-not-allowed press-scale"
                >
                  견적 제출하기
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 견적 제출 확인 모달 */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="견적 제출 확인"
        size="sm"
      >
        <p className="text-[14px] text-[#72706a]">
          이 견적요청에 견적을 제출하시겠습니까?
        </p>
        {estimateLimit && (
          <p className="mt-2 text-[13px] text-[#72706a]">
            오늘 제출: {estimateLimit.used} / {estimateLimit.limit}건
            {estimateLimit.remaining <= 0 && (
              <span className="ml-1 text-red-500">(한도 초과)</span>
            )}
          </p>
        )}
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="flex h-[38px] flex-1 items-center justify-center rounded-lg border border-[#e2ddd6] text-[13px] font-medium text-[#72706a] transition-colors hover:bg-[#f0ede8] press-scale"
          >
            취소
          </button>
          <button
            onClick={handleSubmitEstimate}
            disabled={isSubmitting}
            className="flex h-[38px] flex-1 items-center justify-center rounded-lg bg-[#2d6a4f] text-[13px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#4a8c6a] disabled:opacity-50 press-scale"
          >
            {isSubmitting ? "제출중..." : "제출하기"}
          </button>
        </div>
      </Modal>

      {/* 이미지 라이트박스 */}
      {lightboxImages.length > 0 && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxImages([])}
        />
      )}
    </div>
  );
}
