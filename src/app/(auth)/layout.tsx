import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Brand */}
      <div
        className="relative hidden w-[480px] flex-col justify-between overflow-hidden p-12 lg:flex"
        style={{ backgroundColor: "#141412" }}
      >
        {/* Abstract geometric background — SVG shapes */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <circle cx="460" cy="60" r="220" fill="#2d6a4f" fillOpacity="0.07" />
          <circle cx="-30" cy="280" r="170" fill="#2d6a4f" fillOpacity="0.10" />
          <circle cx="380" cy="520" r="90" fill="#4a8c6a" fillOpacity="0.14" />
          <circle cx="120" cy="520" r="24" fill="#2d6a4f" fillOpacity="0.20" />
          <rect x="48" y="460" width="100" height="1.5" fill="#4a8c6a" fillOpacity="0.22" rx="1" />
          <rect x="48" y="468" width="54" height="1.5" fill="#2d6a4f" fillOpacity="0.14" rx="1" />
          <rect x="300" y="140" width="140" height="140" fill="none" stroke="#2d6a4f" strokeWidth="1" strokeOpacity="0.08" rx="12" />
        </svg>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="select-none">
            <span
              className="text-[22px] font-extrabold tracking-tight"
              style={{ color: "#f5f3ee" }}
            >
              바른오더
            </span>
          </Link>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <p
            className="text-[40px] font-extrabold leading-[1.2] tracking-tight"
            style={{ color: "#f5f3ee" }}
          >
            검증된 업체,
            <br />
            확실한 매칭.
          </p>
          <p
            className="mt-6 text-[15px] leading-[1.8]"
            style={{ color: "#6a6864" }}
          >
            이사청소 전문 매칭 플랫폼 바른오더에서
            <br />
            믿을 수 있는 청소 업체를 만나보세요.
          </p>
        </div>

        {/* Copyright */}
        <div className="relative z-10">
          <p className="text-[12px]" style={{ color: "#4a4a48" }}>
            &copy; {new Date().getFullYear()} 바른오더
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div
        className="flex flex-1 flex-col"
        style={{ backgroundColor: "#f5f3ee" }}
      >
        {/* Mobile Header */}
        <div
          className="flex h-[60px] items-center border-b px-5 lg:hidden"
          style={{ borderColor: "#e2ddd6" }}
        >
          <Link href="/" className="select-none">
            <span
              className="text-[22px] font-extrabold tracking-tight"
              style={{ color: "#141412" }}
            >
              바른오더
            </span>
          </Link>
        </div>

        {/* Form Area */}
        <div className="flex flex-1 items-center justify-center px-5 py-12">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
