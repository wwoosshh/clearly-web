import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left - Brand */}
      <div className="hidden w-[480px] flex-col justify-between bg-gray-900 p-10 lg:flex">
        <Link href="/" className="select-none">
          <span className="text-[22px] font-extrabold tracking-tight text-white">
            바른오더
          </span>
        </Link>

        <div>
          <p className="text-[32px] font-extrabold leading-[1.3] tracking-tight text-white">
            검증된 업체,
            <br />
            확실한 매칭.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-400">
            이사청소 전문 매칭 플랫폼 바른오더에서
            <br />
            믿을 수 있는 청소 업체를 만나보세요.
          </p>
        </div>

        <p className="text-[12px] text-gray-600">
          &copy; {new Date().getFullYear()} 바른오더
        </p>
      </div>

      {/* Right - Form */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <div className="flex h-[60px] items-center px-5 lg:hidden">
          <Link href="/" className="select-none">
            <span className="text-[22px] font-extrabold tracking-tight text-gray-900">
              바른오더
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
