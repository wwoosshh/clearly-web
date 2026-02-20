import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import { ToastContainer } from "@/components/ui/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "바른오더 - 검증된 이사청소 매칭 플랫폼",
    template: "%s | 바른오더",
  },
  description:
    "검증된 이사청소 업체를 빠르고 간편하게 매칭해드립니다. 합리적인 가격, 믿을 수 있는 서비스.",
  keywords: [
    "이사청소",
    "입주청소",
    "이사청소업체",
    "청소매칭",
    "이사청소견적",
  ],
  icons: {
    icon: "/favicon-barunorder.svg",
    apple: "/icon-barunorder.svg",
  },
  openGraph: {
    title: "바른오더 - 검증된 이사청소 매칭 플랫폼",
    description:
      "검증된 이사청소 업체를 빠르고 간편하게 매칭해드립니다.",
    type: "website",
    locale: "ko_KR",
    siteName: "바른오더",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <NotificationProvider>
            {children}
            <ToastContainer />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
