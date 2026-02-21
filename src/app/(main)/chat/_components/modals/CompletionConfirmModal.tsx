"use client";

import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import type { ChatRoomDetail } from "@/types";

interface CompletionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedRoom: ChatRoomDetail | null;
  isConfirming: boolean;
  setLightboxImages: (imgs: string[]) => void;
  setLightboxIndex: (idx: number) => void;
}

export function CompletionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  selectedRoom,
  isConfirming,
  setLightboxImages,
  setLightboxIndex,
}: CompletionConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="서비스 완료 확인"
      size="md"
    >
      <p className="text-[14px] text-[#72706a]">
        업체가 보낸 완료 사진을 확인하고 서비스 완료를 승인해주세요.
      </p>

      {selectedRoom?.matching?.completionImages && (selectedRoom.matching.completionImages as string[]).length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {(selectedRoom.matching.completionImages as string[]).map((url, idx) => (
            <button
              type="button"
              key={idx}
              className="relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-[#e2ddd6]"
              aria-label={`완료 사진 ${idx + 1} 확대 보기`}
              onClick={() => {
                setLightboxImages(selectedRoom.matching!.completionImages as string[]);
                setLightboxIndex(idx);
              }}
            >
              <Image src={url} alt={`완료 사진 ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <p className="mt-3 text-[13px] text-[#72706a]">
        완료 확인 후 리뷰를 작성할 수 있습니다.
      </p>

      <div className="mt-5 flex gap-2">
        <button
          onClick={onClose}
          className="flex h-[38px] flex-1 items-center justify-center rounded-lg border border-[#e2ddd6] text-[13px] font-medium text-[#1a1918] transition-colors hover:bg-[#f0ede8] active:scale-95"
        >
          닫기
        </button>
        <button
          onClick={onConfirm}
          disabled={isConfirming}
          className="flex h-[38px] flex-1 items-center justify-center rounded-lg bg-[#2d6a4f] text-[13px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#235840] disabled:opacity-50 active:scale-95"
        >
          {isConfirming ? "처리중..." : "완료 확인"}
        </button>
      </div>
    </Modal>
  );
}
