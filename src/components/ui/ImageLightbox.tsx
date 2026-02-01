"use client";

import { useState, useEffect, useCallback } from "react";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  onClose,
}: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, goPrev, goNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      {/* 닫기 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl z-10 hover:opacity-70"
      >
        &times;
      </button>

      {/* 좌측 화살표 */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute left-4 text-white text-4xl z-10 hover:opacity-70 select-none"
        >
          &#8249;
        </button>
      )}

      {/* 이미지 */}
      <img
        src={images[index]}
        alt={`이미지 ${index + 1}`}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded"
        onClick={(e) => e.stopPropagation()}
      />

      {/* 우측 화살표 */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="absolute right-4 text-white text-4xl z-10 hover:opacity-70 select-none"
        >
          &#8250;
        </button>
      )}

      {/* 인디케이터 */}
      {images.length > 1 && (
        <div className="absolute bottom-4 text-white text-sm">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
