"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CLEANING_TYPE_LABELS, type CleaningType } from "@/types";

export interface ConsultationCompleteDetails {
  cleaningType: CleaningType;
  address: string;
  estimatedPrice?: number;
  areaSize?: number;
  desiredDate?: string;
  desiredTime?: string;
}

interface ConsultationCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (details: ConsultationCompleteDetails) => void;
  isCompleting: boolean;
}

// CONSULTATION 제외한 청소 유형 목록
const CLEANING_OPTIONS = (
  Object.entries(CLEANING_TYPE_LABELS) as [CleaningType, string][]
).filter(([key]) => key !== "CONSULTATION");

export function ConsultationCompleteModal({
  isOpen,
  onClose,
  onComplete,
  isCompleting,
}: ConsultationCompleteModalProps) {
  const [cleaningType, setCleaningType] = useState<CleaningType>("FULL");
  const [address, setAddress] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [areaSize, setAreaSize] = useState("");
  const [desiredDate, setDesiredDate] = useState("");
  const [desiredTime, setDesiredTime] = useState("");

  const isValid = cleaningType && address.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid || isCompleting) return;
    onComplete({
      cleaningType,
      address: address.trim(),
      estimatedPrice: estimatedPrice ? Number(estimatedPrice) : undefined,
      areaSize: areaSize ? Number(areaSize) : undefined,
      desiredDate: desiredDate || undefined,
      desiredTime: desiredTime || undefined,
    });
  };

  const handleClose = () => {
    if (isCompleting) return;
    setCleaningType("FULL");
    setAddress("");
    setEstimatedPrice("");
    setAreaSize("");
    setDesiredDate("");
    setDesiredTime("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 sm:items-center sm:pb-0">
          {/* 배경 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-[#141412]/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-[#e2ddd6] bg-white shadow-2xl"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between border-b border-[#f0ede8] px-5 py-4">
              <div>
                <h3 className="text-[15px] font-bold text-[#141412]">
                  거래 정보 입력
                </h3>
                <p className="mt-0.5 text-[12px] text-[#72706a]">
                  거래 완료 전 실제 작업 정보를 입력해주세요
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={isCompleting}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#72706a] transition-colors hover:bg-[#f0ede8] disabled:opacity-40"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* 폼 */}
            <div className="space-y-4 px-5 py-4">

              {/* 작업 유형 */}
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#72706a]">
                  작업 유형 <span className="text-[#dc2626]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={cleaningType}
                    onChange={(e) => setCleaningType(e.target.value as CleaningType)}
                    className="w-full appearance-none rounded-xl border border-[#e2ddd6] bg-[#f5f3ee] px-3.5 py-2.5 pr-9 text-[14px] text-[#141412] focus:border-[#4a8c6a] focus:bg-white focus:outline-none transition-colors"
                  >
                    {CLEANING_OPTIONS.map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a49c]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* 주소 */}
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#72706a]">
                  작업 주소 <span className="text-[#dc2626]">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="예: 서울시 강남구 역삼동 123"
                  maxLength={300}
                  className="w-full rounded-xl border border-[#e2ddd6] bg-[#f5f3ee] px-3.5 py-2.5 text-[14px] text-[#141412] placeholder:text-[#c8c4bc] focus:border-[#4a8c6a] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              {/* 견적 금액 + 면적 (2열) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-[#72706a]">
                    견적 금액 <span className="text-[11px] font-normal text-[#a8a49c]">(선택)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={estimatedPrice}
                      onChange={(e) => setEstimatedPrice(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full rounded-xl border border-[#e2ddd6] bg-[#f5f3ee] px-3.5 py-2.5 pr-7 text-[14px] text-[#141412] placeholder:text-[#c8c4bc] focus:border-[#4a8c6a] focus:bg-white focus:outline-none transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#a8a49c]">원</span>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-[#72706a]">
                    면적 <span className="text-[11px] font-normal text-[#a8a49c]">(선택)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={areaSize}
                      onChange={(e) => setAreaSize(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full rounded-xl border border-[#e2ddd6] bg-[#f5f3ee] px-3.5 py-2.5 pr-6 text-[14px] text-[#141412] placeholder:text-[#c8c4bc] focus:border-[#4a8c6a] focus:bg-white focus:outline-none transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#a8a49c]">m²</span>
                  </div>
                </div>
              </div>

              {/* 작업 날짜 + 시간 (2열) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-[#72706a]">
                    작업 날짜 <span className="text-[11px] font-normal text-[#a8a49c]">(선택)</span>
                  </label>
                  <input
                    type="date"
                    value={desiredDate}
                    onChange={(e) => setDesiredDate(e.target.value)}
                    className="w-full rounded-xl border border-[#e2ddd6] bg-[#f5f3ee] px-3.5 py-2.5 text-[14px] text-[#141412] focus:border-[#4a8c6a] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-[#72706a]">
                    작업 시간 <span className="text-[11px] font-normal text-[#a8a49c]">(선택)</span>
                  </label>
                  <input
                    type="time"
                    value={desiredTime}
                    onChange={(e) => setDesiredTime(e.target.value)}
                    className="w-full rounded-xl border border-[#e2ddd6] bg-[#f5f3ee] px-3.5 py-2.5 text-[14px] text-[#141412] focus:border-[#4a8c6a] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-2 border-t border-[#f0ede8] px-5 py-4">
              <button
                onClick={handleClose}
                disabled={isCompleting}
                className="flex h-[42px] flex-1 items-center justify-center rounded-xl border border-[#e2ddd6] text-[13px] font-semibold text-[#72706a] transition-colors hover:bg-[#f5f3ee] disabled:opacity-40"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isValid || isCompleting}
                className="flex h-[42px] flex-[2] items-center justify-center rounded-xl bg-[#2d6a4f] text-[13px] font-bold text-white transition-all hover:bg-[#235840] active:scale-[0.98] disabled:opacity-40"
              >
                {isCompleting ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    처리중...
                  </span>
                ) : "거래 완료"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
