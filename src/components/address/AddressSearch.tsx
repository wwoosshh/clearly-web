"use client";

import { useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    daum: any;
  }
}

interface AddressData {
  zonecode: string;
  address: string;
  roadAddress: string;
  jibunAddress: string;
  buildingName: string;
}

interface AddressSearchProps {
  onComplete: (data: AddressData) => void;
  className?: string;
}

function AddressSearch({ onComplete, className }: AddressSearchProps) {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current || typeof window === "undefined") return;

    if (window.daum?.Postcode) {
      scriptLoaded.current = true;
      return;
    }

    const script = document.createElement("script");
    script.src =
      "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
    };
    document.head.appendChild(script);
  }, []);

  const handleClick = useCallback(() => {
    if (!window.daum?.Postcode) {
      alert("주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data: AddressData) => {
        onComplete(data);
      },
    }).open();
  }, [onComplete]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ||
        "h-[44px] rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50 whitespace-nowrap"
      }
    >
      주소 검색
    </button>
  );
}

export { AddressSearch };
export type { AddressData, AddressSearchProps };
