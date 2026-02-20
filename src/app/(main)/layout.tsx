"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import PageTransition from "@/components/animation/PageTransition";
import { useAuthStore } from "@/stores/auth.store";
import type { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();

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
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 overflow-x-hidden">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  );
}
