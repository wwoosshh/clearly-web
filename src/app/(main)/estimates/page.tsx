"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui/Spinner";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { EstimateRequest, CleaningType } from "@/types";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { CLEANING_TYPE_LABELS } from "@/types";

export default function EstimatesPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<EstimateRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<EstimateRequest | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

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
    setIsLoading(true);
    try {
      const [reqRes, balRes] = await Promise.all([
        api.get("/estimates/requests"),
        api.get("/points/balance").catch(() => ({ data: { data: { balance: 0 } } })),
      ]);
      const reqResult = (reqRes.data as any)?.data ?? reqRes.data;
      setRequests(reqResult?.data ?? (Array.isArray(reqResult) ? reqResult : []));
      const balResult = (balRes.data as any)?.data ?? balRes.data;
      setBalance(balResult?.balance ?? 0);
    } catch {
      setRequests([]);
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
        <p className="text-[15px] text-gray-500">업체 회원만 접근할 수 있습니다</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" className="text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-gray-900">
            견적 요청 목록
          </h1>
          <p className="mt-1.5 text-[15px] text-gray-500">
            고객의 견적 요청에 견적을 제출하세요
          </p>
        </div>
        {balance !== null && (
          <div className="rounded-lg border border-gray-200 px-4 py-2 text-center">
            <p className="text-[12px] text-gray-500">보유 포인트</p>
            <p className="text-[16px] font-bold text-gray-900">{balance.toLocaleString()}P</p>
          </div>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="mt-4 text-[15px] font-medium text-gray-700">
            현재 견적 요청이 없습니다
          </p>
          <p className="mt-1.5 text-[13px] text-gray-500">
            새로운 견적 요청이 들어오면 여기에 표시됩니다
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {requests.map((req) => (
            <button
              key={req.id}
              onClick={() => {
                setSelectedRequest(req);
                setShowSubmitForm(false);
                resetForm();
              }}
              className="rounded-xl border border-gray-200 bg-white p-5 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-[15px] font-bold text-gray-900">
                  {CLEANING_TYPE_LABELS[req.cleaningType as CleaningType] || req.cleaningType}
                </h3>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[12px] font-medium text-gray-700">
                  {req.estimates?.length || 0}건 견적
                </span>
              </div>
              <p className="mt-1.5 text-[13px] text-gray-500">{req.address}</p>
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
              <p className="mt-2 text-[13px] text-gray-500 line-clamp-2">
                {req.message}
              </p>
            </button>
          ))}
        </div>
      )}

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
                <span className="text-[13px] text-gray-500">청소 유형</span>
                <span className="text-[14px] font-medium text-gray-900">
                  {CLEANING_TYPE_LABELS[selectedRequest.cleaningType as CleaningType]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-gray-500">주소</span>
                <span className="text-[14px] text-gray-700">
                  {selectedRequest.address}
                  {selectedRequest.detailAddress ? ` ${selectedRequest.detailAddress}` : ""}
                </span>
              </div>
              {selectedRequest.areaSize && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-gray-500">면적</span>
                  <span className="text-[14px] text-gray-700">{selectedRequest.areaSize}평</span>
                </div>
              )}
              {selectedRequest.desiredDate && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-gray-500">희망 날짜</span>
                  <span className="text-[14px] text-gray-700">{formatDate(selectedRequest.desiredDate)}</span>
                </div>
              )}
              {selectedRequest.desiredTime && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-gray-500">희망 시간</span>
                  <span className="text-[14px] text-gray-700">{selectedRequest.desiredTime}</span>
                </div>
              )}
              {selectedRequest.budget && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-gray-500">예산</span>
                  <span className="text-[14px] text-gray-700">{selectedRequest.budget.toLocaleString()}원</span>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p className="text-[13px] font-medium text-gray-500 mb-1">상세 설명</p>
              <p className="text-[14px] text-gray-700 whitespace-pre-wrap break-words">
                {selectedRequest.message}
              </p>
            </div>

            {/* 견적요청 첨부 사진 */}
            {selectedRequest.images && selectedRequest.images.length > 0 && (
              <div className="mt-4">
                <p className="text-[13px] font-medium text-gray-500 mb-2">첨부 사진</p>
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
                        className="h-16 w-16 rounded-lg border border-gray-200 object-cover hover:opacity-80 transition-opacity"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!showSubmitForm ? (
              <button
                onClick={() => setShowSubmitForm(true)}
                className="mt-5 flex h-[42px] w-full items-center justify-center rounded-lg bg-gray-900 text-[14px] font-medium text-white transition-colors hover:bg-gray-800"
              >
                견적 작성하기
              </button>
            ) : (
              <div className="mt-5 border-t border-gray-200 pt-5">
                <h3 className="text-[15px] font-bold text-gray-900 mb-4">견적 작성</h3>

                {submitError && (
                  <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600">
                    {submitError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-[13px] font-medium text-gray-800 mb-1.5 block">
                      견적 가격 (원) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="예: 300000"
                      className="h-[44px] w-full rounded-lg border border-gray-200 px-3.5 text-[14px] focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-gray-800 mb-1.5 block">가능 날짜</label>
                    <input
                      type="date"
                      value={availableDate}
                      onChange={(e) => setAvailableDate(e.target.value)}
                      className="h-[44px] w-full rounded-lg border border-gray-200 px-3.5 text-[14px] focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-gray-800 mb-1.5 block">예상 소요시간</label>
                    <input
                      type="text"
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                      placeholder="예: 3~4시간"
                      className="h-[44px] w-full rounded-lg border border-gray-200 px-3.5 text-[14px] focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-gray-800 mb-1.5 block">메시지</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="고객에게 전달할 메시지"
                      rows={3}
                      className="w-full rounded-lg border border-gray-200 px-3.5 py-3 text-[14px] resize-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 focus:outline-none"
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
                  className="mt-4 flex h-[42px] w-full items-center justify-center rounded-lg bg-gray-900 text-[14px] font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  견적 제출하기
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 포인트 차감 확인 모달 */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="견적 제출 확인"
        size="sm"
      >
        <p className="text-[14px] text-gray-600">
          견적을 제출하면 <span className="font-bold">100P</span>가 차감됩니다.
        </p>
        <p className="mt-2 text-[13px] text-gray-500">
          현재 보유 포인트: {balance?.toLocaleString() ?? 0}P
        </p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="flex h-[38px] flex-1 items-center justify-center rounded-lg border border-gray-200 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmitEstimate}
            disabled={isSubmitting}
            className="flex h-[38px] flex-1 items-center justify-center rounded-lg bg-gray-900 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
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
