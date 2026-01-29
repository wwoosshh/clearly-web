"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  const router = useRouter();
  const [address, setAddress] = useState("");

  const handleSearch = () => {
    if (address.trim()) {
      router.push(`/search?address=${encodeURIComponent(address.trim())}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-white">
          <div className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:pb-28 sm:pt-24">
            <div className="max-w-[580px]">
              <p className="text-[14px] font-semibold text-[#1a56db] tracking-tight">
                이사청소 전문 매칭 플랫폼
              </p>
              <h1 className="mt-3 text-[36px] font-extrabold leading-[1.2] tracking-tight text-gray-900 sm:text-[48px]">
                검증된 업체와
                <br />
                확실한 매칭.
              </h1>
              <p className="mt-5 text-[16px] leading-relaxed text-gray-500 sm:text-[18px]">
                사업자 인증, 서비스 품질, 고객 평가까지
                <br className="hidden sm:block" />
                꼼꼼하게 검증된 이사청소 업체를 만나보세요.
              </p>

              {/* Search CTA */}
              <div className="mt-9 flex flex-col gap-2.5 sm:flex-row">
                <div className="relative flex-1">
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="청소할 주소를 입력하세요"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="h-[52px] w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="h-[52px] rounded-xl bg-gray-900 px-7 text-[15px] font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto"
                >
                  업체 찾기
                </button>
              </div>
            </div>
          </div>

          {/* Subtle grid background */}
          <div
            className="absolute inset-0 -z-10 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </section>

        {/* Numbers */}
        <section className="border-y border-gray-100 bg-gray-50/50">
          <div className="mx-auto max-w-6xl px-5 py-14">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { value: "120+", label: "검증된 업체" },
                { value: "4.8", label: "평균 평점" },
                { value: "2,400+", label: "매칭 완료" },
                { value: "97%", label: "고객 만족도" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-[28px] font-extrabold tracking-tight text-gray-900 sm:text-[32px]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[13px] font-medium text-gray-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-[13px] font-semibold text-[#1a56db] tracking-tight">
              이용 방법
            </p>
            <h2 className="mt-2 text-[28px] font-extrabold tracking-tight text-gray-900 sm:text-[32px]">
              간단한 3단계로 끝
            </h2>

            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
              {[
                {
                  step: "01",
                  title: "주소와 일정 입력",
                  desc: "청소할 주소, 평수, 희망 일정을 입력하면 조건에 맞는 업체를 추천해드립니다.",
                },
                {
                  step: "02",
                  title: "업체 선택 및 매칭",
                  desc: "추천된 업체의 평점, 리뷰, 가격대를 비교하고 원하는 업체에 매칭을 요청하세요.",
                },
                {
                  step: "03",
                  title: "채팅으로 상담",
                  desc: "매칭이 수락되면 1:1 채팅방에서 세부 일정과 비용을 직접 조율합니다.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="group relative rounded-2xl border border-gray-200 bg-white p-7 transition-all hover:border-gray-300 hover:shadow-sm"
                >
                  <span className="text-[13px] font-bold text-[#1a56db] tabular-nums">
                    {item.step}
                  </span>
                  <h3 className="mt-4 text-[17px] font-bold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-gray-500">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section className="border-t border-gray-100 bg-gray-50/50 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-[13px] font-semibold text-[#1a56db] tracking-tight">
              왜 clearly인가요
            </p>
            <h2 className="mt-2 text-[28px] font-extrabold tracking-tight text-gray-900 sm:text-[32px]">
              다른 플랫폼과 다릅니다
            </h2>

            <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-2">
              {[
                {
                  title: "전수 검증 시스템",
                  desc: "사업자등록증 확인, 보험가입 여부, 실제 서비스 이력까지 다단계로 검증합니다. 승인된 업체만 플랫폼에 등록됩니다.",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                  ),
                },
                {
                  title: "낮은 이용 수수료",
                  desc: "타 플랫폼 대비 낮은 수수료 구조로 업체와 고객 모두에게 합리적인 가격을 제공합니다.",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  ),
                },
                {
                  title: "이사청소 전문",
                  desc: "범용 플랫폼이 아닌 이사청소 전문 서비스입니다. 입주/퇴거 청소에 특화된 검색과 매칭을 경험하세요.",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  ),
                },
                {
                  title: "투명한 직접 소통",
                  desc: "매칭 후 1:1 채팅으로 업체와 직접 소통합니다. 플랫폼은 매칭까지만 관여하고, 이후는 자유롭게 조율하세요.",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.title} className="bg-white p-8 sm:p-9">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                    {item.icon}
                  </div>
                  <h3 className="mt-5 text-[16px] font-bold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-gray-500">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-5 text-center">
            <h2 className="text-[28px] font-extrabold tracking-tight text-gray-900 sm:text-[32px]">
              깨끗한 시작, 지금 바로
            </h2>
            <p className="mt-3 text-[15px] text-gray-500">
              회원가입 후 3분이면 매칭이 시작됩니다.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center rounded-xl bg-gray-900 px-7 text-[15px] font-semibold text-white transition-colors hover:bg-gray-800"
              >
                무료로 시작하기
              </Link>
              <Link
                href="/register/company"
                className="inline-flex h-12 items-center rounded-xl border border-gray-200 bg-white px-7 text-[15px] font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                업체 등록 신청
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
