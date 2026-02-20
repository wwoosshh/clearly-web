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
    <footer style={{ backgroundColor: "#141412" }}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="select-none">
              <span className="text-[20px] font-extrabold tracking-tight text-[#f5f3ee]">
                바른오더
              </span>
            </Link>
            <p className="mt-3 text-[13px] leading-relaxed text-[#6a6864]">
              검증된 이사청소 업체 매칭
            </p>
          </div>

          {/* Service */}
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-widest text-[#4a4a48]">
              서비스
            </h3>
            <ul className="mt-4 space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-[#8a8880] transition-colors hover:text-[#d4ede4]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-widest text-[#4a4a48]">
              고객지원
            </h3>
            <ul className="mt-4 space-y-2.5">
              {[
                { href: "/faq", label: "자주 묻는 질문" },
                { href: "/contact", label: "문의하기" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-[#8a8880] transition-colors hover:text-[#d4ede4]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-widest text-[#4a4a48]">
              약관 및 정책
            </h3>
            <ul className="mt-4 space-y-2.5">
              {[
                { href: "/terms", label: "이용약관" },
                { href: "/privacy", label: "개인정보처리방침" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-[#8a8880] transition-colors hover:text-[#d4ede4]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-[#2a2a28] pt-6">
          <p className="text-[12px] leading-relaxed text-[#4a4a48]">
            &copy; {new Date().getFullYear()} 바른오더. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
