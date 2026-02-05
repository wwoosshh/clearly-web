"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  /** 모달 열림/닫힘 상태 */
  isOpen: boolean;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 모달 제목 */
  title?: string;
  /** 모달 내용 */
  children: ReactNode;
  /** 모달 크기 */
  size?: "sm" | "md" | "lg";
  /** 추가 클래스명 */
  className?: string;
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // ESC 키로 닫기
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* 오버레이 배경 — 클릭 시 닫기 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 모달 본문 */}
      <div
        className={cn(
          "relative w-full rounded-xl bg-white shadow-xl flex flex-col max-h-[85vh]",
          "animate-in fade-in zoom-in-95 duration-200",
          sizeStyles[size],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* 헤더 — 항상 상단 고정 */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0 border-b border-transparent">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-gray-900"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* 콘텐츠 — 내용이 길면 스크롤 */}
        <div className={cn("overflow-y-auto overscroll-contain px-6 pb-6", title ? "pt-2" : "pt-6")}>
          {children}
        </div>
      </div>
    </div>
  );
}

export { Modal };
export type { ModalProps };
