"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/",
    label: "홈",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    roles: ["all"],
  },
  // ── 고객(USER) + 비로그인 ──
  {
    href: "/estimate/request",
    label: "견적요청",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
    roles: ["USER", "guest"],
  },
  {
    href: "/matching",
    label: "매칭내역",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    roles: ["USER"],
  },
  // ── 업체(COMPANY) ──
  {
    href: "/estimates",
    label: "견적리스트",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    roles: ["COMPANY"],
  },
  {
    href: "/my-estimates",
    label: "내 견적",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <polyline points="9 14 11 16 15 12" />
      </svg>
    ),
    roles: ["COMPANY"],
  },
  {
    href: "/customers",
    label: "고객관리",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
    roles: ["COMPANY"],
  },
  {
    href: "/my-reviews",
    label: "리뷰확인",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    roles: ["COMPANY"],
  },
  {
    href: "/pricing",
    label: "요금제",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    roles: ["COMPANY"],
  },
  // ── 공통 (로그인 필요) ──
  {
    href: "/chat",
    label: "채팅",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    roles: ["USER", "COMPANY"],
  },
  {
    href: "/mypage",
    label: "마이페이지",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    roles: ["USER", "COMPANY"],
  },
  // ── 공개 ──
  {
    href: "/faq",
    label: "FAQ",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    roles: ["all"],
  },
  {
    href: "/contact",
    label: "문의",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    roles: ["all"],
  },
];

export function QuickNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const userRole = isAuthenticated && user ? user.role : "guest";

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.roles.includes("all")) return true;
    if (item.roles.includes(userRole)) return true;
    if (item.roles.includes("guest") && !isAuthenticated) return true;
    return false;
  });

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -140 : 140, behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      {/* 좌측 페이드 + 화살표 */}
      <div
        className={cn(
          "pointer-events-none absolute left-0 top-0 z-10 flex h-full w-12 items-center justify-start bg-gradient-to-r from-white via-white/80 to-transparent transition-opacity duration-200 md:hidden",
          canScrollLeft ? "opacity-100" : "opacity-0"
        )}
      >
        <button
          onClick={() => scroll("left")}
          className="pointer-events-auto ml-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-[0_1px_6px_rgba(0,0,0,0.1)]"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#72706a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {/* 우측 페이드 + 화살표 */}
      <div
        className={cn(
          "pointer-events-none absolute right-0 top-0 z-10 flex h-full w-12 items-center justify-end bg-gradient-to-l from-white via-white/80 to-transparent transition-opacity duration-200 md:hidden",
          canScrollRight ? "opacity-100" : "opacity-0"
        )}
      >
        <button
          onClick={() => scroll("right")}
          className="pointer-events-auto mr-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-[0_1px_6px_rgba(0,0,0,0.1)]"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#72706a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div
        ref={scrollRef}
        className="overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
        <div className="flex gap-2 py-2.5 md:flex-wrap md:gap-2">
          {visibleItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#0284C7] text-white shadow-[0_2px_8px_rgba(2,132,199,0.2)]"
                    : "bg-[#f7f5f0] text-[#72706a] hover:bg-[#edeae4] hover:text-[#1a1918]"
                )}
              >
                <span className={cn("shrink-0 transition-colors", isActive ? "text-white/90" : "text-[#9a958e]")}>
                  {item.icon}
                </span>
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
