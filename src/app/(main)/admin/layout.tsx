"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/admin", label: "대시보드", icon: "📊" },
  { href: "/admin/users", label: "사용자 관리", icon: "👤" },
  { href: "/admin/companies", label: "업체 관리", icon: "🏢" },
  { href: "/admin/reports", label: "신고 관리", icon: "🚨" },
  { href: "/admin/chat-rooms", label: "채팅 모니터링", icon: "💬" },
  { href: "/admin/reviews", label: "리뷰 관리", icon: "⭐" },
  { href: "/admin/matchings", label: "매칭 관리", icon: "🤝" },
  { href: "/admin/estimate-requests", label: "견적요청", icon: "📋" },
  { href: "/admin/faq", label: "FAQ 관리", icon: "❓" },
  { href: "/admin/inquiries", label: "문의 관리", icon: "📩" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && (!isAuthenticated || user?.role !== "ADMIN")) {
      router.replace("/");
    }
  }, [isInitialized, isAuthenticated, user, router]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 pb-20 sm:px-6 sm:py-8 md:pb-8">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 md:block">
        <nav className="sticky top-[76px] space-y-1">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            관리자 메뉴
          </p>
          {sidebarLinks.map((link) => {
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <span className="text-sm">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white md:hidden">
        <nav className="-mb-px flex overflow-x-auto scrollbar-none">
          {sidebarLinks.map((link) => {
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex shrink-0 flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium",
                  isActive
                    ? "text-gray-900 border-t-2 border-gray-900"
                    : "text-gray-400 border-t-2 border-transparent"
                )}
              >
                <span className="text-sm">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
