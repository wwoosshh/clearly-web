"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/stores/auth.store";
import { useSubscriptionStore } from "@/stores/subscription.store";
import SubscriptionBadge from "@/components/subscription/SubscriptionBadge";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";

const Header = React.memo(function Header() {
  const { user, isAuthenticated, isInitialized, logout } = useAuthStore();
  const { subscription } = useSubscriptionStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
  const isAdmin = isAuthenticated && user?.role === "ADMIN";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled
          ? "border-b border-[#e2ddd6] bg-white/95 backdrop-blur-md shadow-[0_1px_12px_rgba(2,132,199,0.06)]"
          : "bg-white"
      )}
    >
      <div className="mx-auto flex h-[60px] max-w-6xl items-center px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 select-none">
          <span className="text-[22px] font-extrabold tracking-tight text-[#141412]">
            바른오더
          </span>
        </Link>

        {/* Right — 모바일/PC 동일 */}
        <div className="ml-auto flex items-center gap-2">
          {!isInitialized ? (
            <div className="h-7 w-20" />
          ) : isAuthenticated && user ? (
            <>
              <NotificationBell />
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm text-[#1a1918] transition-colors hover:bg-[#f0ede8]"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0284C7] text-[#f5f3ee] overflow-hidden">
                    {user.profileImage ? (
                      <Image
                        src={user.profileImage}
                        alt=""
                        width={28}
                        height={28}
                        className="h-full w-full object-cover"
                      />
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

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="absolute right-0 mt-1.5 w-52 rounded-xl border border-[#e2ddd6] bg-white py-1.5 shadow-[0_8px_30px_rgba(2,132,199,0.10)]"
                    >
                      <div className="px-4 py-2.5 border-b border-[#f0ede8]">
                        <p className="text-[13px] font-semibold text-[#1a1918]">{user.name}</p>
                        <p className="text-[12px] text-[#72706a] mt-0.5">{user.email}</p>
                      </div>
                      {!isAdmin && (
                        <div className="py-1">
                          <Link
                            href="/mypage"
                            className="flex items-center px-4 py-2 text-[13px] text-[#1a1918] hover:bg-[#f0ede8] transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            마이페이지
                          </Link>
                          <Link
                            href="/my-reviews"
                            className="flex items-center px-4 py-2 text-[13px] text-[#1a1918] hover:bg-[#f0ede8] transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            내 리뷰
                          </Link>
                        </div>
                      )}
                      <div className="border-t border-[#f0ede8] pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setIsProfileOpen(false);
                          }}
                          className="flex w-full items-center px-4 py-2 text-[13px] text-[#72706a] hover:bg-[#f0ede8] transition-colors"
                        >
                          로그아웃
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-[13px] font-medium text-[#72706a] hover:text-[#1a1918] transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[#0284C7] px-4 py-2 text-[13px] font-medium text-[#f5f3ee] transition-colors hover:bg-[#0369A1]"
              >
                시작하기
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
});

export { Header };
