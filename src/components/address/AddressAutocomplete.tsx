"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAddressSuggestions, type AddressSuggestion } from "@/hooks/useAddressSuggestions";
import { cn } from "@/lib/utils";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  onClear,
  placeholder = "주소를 입력하세요 (예: 서울시 강남구)",
  className,
}: AddressAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = "address-suggestions-listbox";

  const { suggestions, isLoading, clear: clearSuggestions } = useAddressSuggestions(value);

  // 추천 결과가 있으면 드롭다운 열기
  useEffect(() => {
    if (suggestions.length > 0) {
      setIsOpen(true);
      setActiveIndex(-1);
    } else {
      setIsOpen(false);
    }
  }, [suggestions]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSuggestion = useCallback(
    (suggestion: AddressSuggestion) => {
      const displayAddress = suggestion.roadAddress || suggestion.jibunAddress || suggestion.address;
      onChange(displayAddress);
      setIsOpen(false);
      clearSuggestions();
      onSelect(suggestion);
    },
    [onChange, onSelect, clearSuggestions]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          selectSuggestion(suggestions[activeIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  // 활성 항목이 보이도록 스크롤
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex]);

  const handleClear = () => {
    onChange("");
    clearSuggestions();
    setIsOpen(false);
    inputRef.current?.focus();
    onClear?.();
  };

  return (
    <div ref={containerRef} className={cn("relative flex-1", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
          }
          aria-autocomplete="list"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="h-[46px] w-full rounded-lg border border-gray-200 px-4 pr-10 text-[14px] placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 focus:outline-none"
        />

        {/* 로딩 스피너 또는 클리어 버튼 */}
        {isLoading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="h-4 w-4 animate-spin text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-25"
              />
              <path
                d="M4 12a8 8 0 018-8"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-75"
              />
            </svg>
          </div>
        ) : value ? (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="주소 초기화"
            type="button"
          >
            <svg
              width="16"
              height="16"
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
        ) : null}
      </div>

      {/* 드롭다운 */}
      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-[280px] w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {suggestions.map((suggestion, index) => {
            const display =
              suggestion.roadAddress ||
              suggestion.jibunAddress ||
              suggestion.address;
            const secondary =
              suggestion.placeName ||
              (suggestion.roadAddress && suggestion.jibunAddress !== suggestion.roadAddress
                ? suggestion.jibunAddress
                : "");

            return (
              <li
                key={`${suggestion.latitude}-${suggestion.longitude}-${index}`}
                id={`suggestion-${index}`}
                role="option"
                aria-selected={activeIndex === index}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(e) => {
                  e.preventDefault(); // input blur 방지
                  selectSuggestion(suggestion);
                }}
                className={cn(
                  "flex cursor-pointer items-start gap-2.5 px-4 py-2.5 text-[14px] transition-colors",
                  activeIndex === index ? "bg-gray-50" : "hover:bg-gray-50"
                )}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 shrink-0 text-gray-400"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-gray-900">
                    {suggestion.placeName ? (
                      <>
                        <span className="font-medium">{suggestion.placeName}</span>
                        <span className="ml-1.5 text-[13px] text-gray-500">{display}</span>
                      </>
                    ) : (
                      display
                    )}
                  </p>
                  {secondary && !suggestion.placeName && (
                    <p className="mt-0.5 truncate text-[12px] text-gray-400">
                      {secondary}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
