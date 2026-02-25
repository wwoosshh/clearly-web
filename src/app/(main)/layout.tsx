"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { QuickNav } from "@/components/layout/QuickNav";
import PageTransition from "@/components/animation/PageTransition";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const HIDE_QUICKNAV = ["/", "/chat", "/admin"];

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const isChat = pathname.startsWith("/chat");
  const showQuickNav =
    !HIDE_QUICKNAV.includes(pathname) &&
    !pathname.startsWith("/chat") &&
    !pathname.startsWith("/admin");

  useEffect(() => {
    if (!isInitialized) return;
    if (isAuthenticated && user?.role === "ADMIN" && !pathname.startsWith("/admin")) {
      router.replace("/admin");
    }
  }, [isInitialized, isAuthenticated, user, pathname, router]);

  if (isInitialized && isAuthenticated && user?.role === "ADMIN" && !pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className={cn("flex flex-col", isChat ? "h-screen overflow-hidden" : "min-h-screen")}>
      <Header />
      {showQuickNav && (
        <div className="sticky top-[60px] z-30 border-b border-[#f0ede8] bg-white/95 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <QuickNav />
          </div>
        </div>
      )}
      <main className={cn("flex-1", isChat ? "overflow-hidden" : "overflow-x-clip")}>
        <ErrorBoundary>
          <PageTransition>{children}</PageTransition>
        </ErrorBoundary>
      </main>
      {!isChat && <Footer />}
    </div>
  );
}
