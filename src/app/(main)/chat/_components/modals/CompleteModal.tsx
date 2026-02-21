"use client";

import { Modal } from "@/components/ui/Modal";

interface CompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  isCompleting: boolean;
}

export function CompleteModal({
  isOpen,
  onClose,
  onComplete,
  isCompleting,
}: CompleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="거래 완료"
      size="sm"
    >
      <p className="text-[14px] text-[#72706a]">거래를 완료 처리하시겠습니까?</p>
      <p className="mt-2 text-[13px] text-[#72706a]">
        거래 완료 후 리뷰를 작성할 수 있습니다.
      </p>
      <div className="mt-5 flex gap-2">
        <button
          onClick={onClose}
          className="flex h-[38px] flex-1 items-center justify-center rounded-lg border border-[#e2ddd6] text-[13px] font-medium text-[#1a1918] transition-colors hover:bg-[#f0ede8] active:scale-95"
        >
          취소
        </button>
        <button
          onClick={onComplete}
          disabled={isCompleting}
          className="flex h-[38px] flex-1 items-center justify-center rounded-lg bg-[#2d6a4f] text-[13px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#235840] disabled:opacity-50 active:scale-95"
        >
          {isCompleting ? "처리중..." : "거래 완료"}
        </button>
      </div>
    </Modal>
  );
}
