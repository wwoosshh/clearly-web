"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import PageTransition from "@/components/animation/PageTransition";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const isChat = pathname.startsWith("/chat");

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
      <main className={cn("flex-1", isChat ? "overflow-hidden" : "overflow-x-clip")}>
        <ErrorBoundary>
          <PageTransition>{children}</PageTransition>
        </ErrorBoundary>
      </main>
      {!isChat && <Footer />}
    </div>
  );
}
