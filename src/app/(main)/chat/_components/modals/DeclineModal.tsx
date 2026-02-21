"use client";

import { Modal } from "@/components/ui/Modal";

interface DeclineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDecline: () => void;
  isDeclining: boolean;
}

export function DeclineModal({
  isOpen,
  onClose,
  onDecline,
  isDeclining,
}: DeclineModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="거래 취소"
      size="sm"
    >
      <p className="text-[14px] text-[#72706a]">거래 취소를 요청하시겠습니까?</p>
      <p className="mt-2 text-[13px] text-[#72706a]">
        양쪽 모두 거래 취소를 요청하면 환불 절차가 진행됩니다.
      </p>
      <div className="mt-5 flex gap-2">
        <button
          onClick={onClose}
          className="flex h-[38px] flex-1 items-center justify-center rounded-lg border border-[#e2ddd6] text-[13px] font-medium text-[#1a1918] transition-colors hover:bg-[#f0ede8] active:scale-95"
        >
          취소
        </button>
        <button
          onClick={onDecline}
          disabled={isDeclining}
          className="flex h-[38px] flex-1 items-center justify-center rounded-lg bg-[#141412] text-[13px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#2a2a28] disabled:opacity-50 active:scale-95"
        >
          거래 취소 요청
        </button>
      </div>
    </Modal>
  );
}
