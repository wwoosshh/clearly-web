"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";

function Footer() {
  const { user, isAuthenticated } = useAuthStore();

  const isCompany = isAuthenticated && user?.role === "COMPANY";
  const isAdmin = isAuthenticated && user?.role === "ADMIN";

  const serviceLinks = [
    { href: "/search", label: "업체 찾기" },
    ...(!isCompany ? [{ href: "/matching", label: "매칭 내역" }] : []),
    { href: "/chat", label: "채팅" },
    ...(isCompany
      ? [
          { href: "/estimates", label: "견적 리스트" },
          { href: "/estimates/submitted", label: "내 견적" },
        ]
      : []),
    ...(isAdmin ? [{ href: "/admin", label: "관리자" }] : []),
  ];

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="select-none">
              <span className="text-[18px] font-extrabold tracking-tight text-gray-900">
                바른오더
              </span>
            </Link>
            <p className="mt-3 text-[13px] leading-relaxed text-gray-500">
              검증된 이사청소 업체 매칭
            </p>
          </div>

          {/* Service */}
          <div>
            <h3 className="text-[13px] font-semibold text-gray-900">
              서비스
            </h3>
            <ul className="mt-3 space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-gray-500 transition-colors hover:text-gray-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-[13px] font-semibold text-gray-900">
              고객지원
            </h3>
            <ul className="mt-3 space-y-2">
              {[
                { href: "/faq", label: "자주 묻는 질문" },
                { href: "/contact", label: "문의하기" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-gray-500 transition-colors hover:text-gray-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[13px] font-semibold text-gray-900">
              약관 및 정책
            </h3>
            <ul className="mt-3 space-y-2">
              {[
                { href: "/terms", label: "이용약관" },
                { href: "/privacy", label: "개인정보처리방침" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-gray-500 transition-colors hover:text-gray-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-gray-100 pt-6">
          <p className="text-[12px] leading-relaxed text-gray-400">
            &copy; {new Date().getFullYear()} 바른오더. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
