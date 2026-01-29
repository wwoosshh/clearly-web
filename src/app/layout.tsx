import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Clearly - 검증된 이사청소 매칭 플랫폼",
    template: "%s | Clearly",
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
  openGraph: {
    title: "Clearly - 검증된 이사청소 매칭 플랫폼",
    description:
      "검증된 이사청소 업체를 빠르고 간편하게 매칭해드립니다.",
    type: "website",
    locale: "ko_KR",
    siteName: "Clearly",
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
        {children}
      </body>
    </html>
  );
}
