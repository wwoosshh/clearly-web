"use client";

import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";

interface CompletionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  completionImages: string[];
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  isSubmitting: boolean;
  isUploading: boolean;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
}

export function CompletionReportModal({
  isOpen,
  onClose,
  onSubmit,
  completionImages,
  onImageUpload,
  onRemoveImage,
  isSubmitting,
  isUploading,
  imageInputRef,
}: CompletionReportModalProps) {
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="서비스 완료 보고"
      size="md"
    >
      <p className="text-[14px] text-[#72706a]">
        서비스 완료 사진을 업로드해주세요. (최소 1장, 최대 5장)
      </p>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onImageUpload}
      />

      <div className="mt-4 grid grid-cols-3 gap-2">
        {completionImages.map((url, idx) => (
          <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border border-[#e2ddd6]">
            <Image src={url} alt={`완료 사진 ${idx + 1}`} fill className="object-cover" />
            <button
              onClick={() => onRemoveImage(idx)}
              className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
        {completionImages.length < 5 && (
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploading}
            className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-[#e2ddd6] text-[#a8a49c] transition-colors hover:border-[#2d6a4f] hover:text-[#2d6a4f] disabled:opacity-50 active:scale-95"
          >
            {isUploading ? (
              <Spinner size="sm" className="text-[#4a8c6a]" />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
          </button>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={handleClose}
          className="flex h-[38px] flex-1 items-center justify-center rounded-lg border border-[#e2ddd6] text-[13px] font-medium text-[#1a1918] transition-colors hover:bg-[#f0ede8] active:scale-95"
        >
          취소
        </button>
        <button
          onClick={onSubmit}
          disabled={completionImages.length === 0 || isSubmitting}
          className="flex h-[38px] flex-1 items-center justify-center rounded-lg bg-[#2d6a4f] text-[13px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#235840] disabled:opacity-50 active:scale-95"
        >
          {isSubmitting ? "제출중..." : "완료 보고"}
        </button>
      </div>
    </Modal>
  );
}
