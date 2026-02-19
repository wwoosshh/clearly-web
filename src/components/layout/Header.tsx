"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useSubscriptionStore } from "@/stores/subscription.store";
import SubscriptionBadge from "@/components/subscription/SubscriptionBadge";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";

const Header = React.memo(function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized, logout } = useAuthStore();
  const { subscription } = useSubscriptionStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 0);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isCompany = isAuthenticated && user?.role === "COMPANY";

  const navLinks = [
    { href: "/search", label: "업체 찾기" },
    ...(!isCompany ? [{ href: "/matching", label: "매칭 내역" }] : []),
    { href: "/chat", label: "채팅" },
    ...(isCompany
      ? [
          { href: "/estimates", label: "견적 리스트" },
          { href: "/estimates/submitted", label: "내 견적" },
        ]
      : []),
    ...(isAuthenticated && user?.role === "ADMIN"
      ? [{ href: "/admin", label: "관리자" }]
      : []),
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled
          ? "border-b border-gray-200/80 bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          : "bg-white"
      )}
    >
      <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 select-none">
          <span className="text-[22px] font-extrabold tracking-tight text-gray-900">
            바른오더
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative px-4 py-2 text-[14px] font-medium transition-colors",
                pathname === link.href
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-gray-900 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Right */}
        <div className="hidden items-center gap-2 md:flex">
          {!isInitialized ? (
            <div className="h-7 w-20" />
          ) : isAuthenticated && user ? (
            <>
            <NotificationBell />
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm text-gray-700 transition-colors hover:bg-gray-100"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white overflow-hidden">
                  {user.profileImage ? (
                    <Image src={user.profileImage} alt="" width={28} height={28} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold leading-none">
                      {user.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-[13px] font-medium">{user.name}</span>
                {isCompany && subscription && (
                  <SubscriptionBadge tier={subscription.tier} />
                )}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-1.5 w-52 rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg shadow-gray-200/50">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-[13px] font-semibold text-gray-900">{user.name}</p>
                    <p className="text-[12px] text-gray-500 mt-0.5">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/mypage"
                      className="flex items-center px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      마이페이지
                    </Link>
                    <Link
                      href="/mypage/reviews"
                      className="flex items-center px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      내 리뷰
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="flex w-full items-center px-4 py-2 text-[13px] text-gray-500 hover:bg-gray-50"
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
              >
                시작하기
              </Link>
            </>
          )}
        </div>

        {/* Mobile Right */}
        <div className="flex items-center gap-1 md:hidden">
          {isInitialized && isAuthenticated && user && (
            <NotificationBell />
          )}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="메뉴"
          >
          {isMobileMenuOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          )}
        </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-[60px] z-40 bg-black/20 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute left-0 right-0 top-[60px] z-50 border-t border-gray-200 bg-white shadow-lg md:hidden">
            <nav className="flex flex-col px-5 pt-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "py-2.5 text-[15px] font-medium transition-colors",
                    pathname === link.href ? "text-gray-900" : "text-gray-500"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mx-5 mt-3 flex flex-col gap-2 border-t border-gray-200 pb-5 pt-4">
              {!isInitialized ? (
                <div className="h-11" />
              ) : isAuthenticated && user ? (
                <>
                  <Link
                    href="/mypage"
                    className="py-2 text-[15px] font-medium text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    마이페이지
                  </Link>
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="py-2 text-left text-[15px] font-medium text-gray-500"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex h-11 items-center justify-center rounded-lg border border-gray-200 text-[14px] font-medium text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/register"
                    className="flex h-11 items-center justify-center rounded-lg bg-gray-900 text-[14px] font-medium text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    시작하기
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
});

export { Header };
