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
        <section className="pt-16 pb-20 sm:pt-24 sm:pb-32">
          <div className="mx-auto max-w-6xl px-6">
            <h1 className="text-[36px] font-bold leading-[1.18] tracking-[-0.025em] text-gray-900 sm:text-[52px]">
              이사청소,
              <br />
              검증된 업체와 함께.
            </h1>
            <p className="mt-5 max-w-[460px] text-[16px] leading-[1.75] text-gray-500 sm:mt-6 sm:text-[17px]">
              사업자 인증부터 서비스 품질, 고객 평가까지 꼼꼼하게 검증된
              이사청소 업체를 매칭해드립니다.
            </p>

            <div className="mt-10 flex max-w-[500px] items-center rounded-lg border border-gray-300 bg-white transition-colors focus-within:border-gray-900">
              <div className="flex items-center pl-4 text-gray-400">
                <svg
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
              </div>
              <input
                type="text"
                placeholder="청소할 주소를 입력하세요"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-[50px] flex-1 bg-transparent px-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
              <button
                onClick={handleSearch}
                className="my-1.5 mr-1.5 h-[38px] shrink-0 rounded-md bg-gray-900 px-5 text-[14px] font-medium text-white transition-colors hover:bg-gray-800"
              >
                업체 찾기
              </button>
            </div>
          </div>
        </section>

        {/* Numbers */}
        <section className="border-y border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { value: "120+", label: "검증된 업체" },
                { value: "4.8", label: "평균 평점" },
                { value: "2,400+", label: "매칭 완료" },
                { value: "97%", label: "고객 만족도" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-[28px] font-bold tabular-nums tracking-tight text-gray-900 sm:text-[32px]">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-[13px] text-gray-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-[13px] font-semibold tracking-widest text-gray-400">
              이용 방법
            </p>
            <h2 className="mt-2.5 text-[26px] font-bold tracking-[-0.02em] text-gray-900 sm:text-[32px]">
              간단한 3단계
            </h2>

            <div className="mt-16 grid grid-cols-1 gap-14 sm:grid-cols-3 sm:gap-10">
              {[
                {
                  num: "01",
                  title: "주소와 일정 입력",
                  desc: "청소할 주소, 평수, 희망 일정을 입력하면 조건에 맞는 업체를 추천해드립니다.",
                },
                {
                  num: "02",
                  title: "업체 선택 및 매칭",
                  desc: "추천된 업체의 평점, 리뷰, 가격대를 비교하고 원하는 업체에 매칭을 요청하세요.",
                },
                {
                  num: "03",
                  title: "채팅으로 상담",
                  desc: "매칭이 수락되면 1:1 채팅방에서 세부 일정과 비용을 직접 조율합니다.",
                },
              ].map((item) => (
                <div key={item.num}>
                  <p className="text-[13px] font-semibold tabular-nums text-gray-300">
                    {item.num}
                  </p>
                  <h3 className="mt-3 text-[17px] font-bold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-[1.7] text-gray-500">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section className="border-t border-gray-100 bg-gray-50 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-[13px] font-semibold tracking-widest text-gray-400">
              왜 clearly인가요
            </p>
            <h2 className="mt-2.5 text-[26px] font-bold tracking-[-0.02em] text-gray-900 sm:text-[32px]">
              다른 플랫폼과 다릅니다
            </h2>

            <div className="mt-14 grid grid-cols-1 gap-x-16 gap-y-10 sm:grid-cols-2">
              {[
                {
                  title: "전수 검증 시스템",
                  desc: "사업자등록증 확인, 보험가입 여부, 실제 서비스 이력까지 다단계로 검증합니다. 승인된 업체만 플랫폼에 등록됩니다.",
                },
                {
                  title: "낮은 이용 수수료",
                  desc: "타 플랫폼 대비 낮은 수수료 구조로 업체와 고객 모두에게 합리적인 가격을 제공합니다.",
                },
                {
                  title: "이사청소 전문",
                  desc: "범용 플랫폼이 아닌 이사청소 전문 서비스입니다. 입주, 퇴거 청소에 특화된 검색과 매칭을 경험하세요.",
                },
                {
                  title: "투명한 직접 소통",
                  desc: "매칭 후 1:1 채팅으로 업체와 직접 소통합니다. 플랫폼은 매칭까지만 관여하고, 이후는 자유롭게 조율하세요.",
                },
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="text-[17px] font-bold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-[1.7] text-gray-500">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h2 className="text-[26px] font-bold tracking-[-0.02em] text-gray-900 sm:text-[32px]">
              깨끗한 시작, 지금 바로.
            </h2>
            <p className="mt-4 text-[15px] text-gray-500">
              회원가입 후 바로 매칭을 시작할 수 있습니다.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="inline-flex h-[48px] items-center rounded-lg bg-gray-900 px-7 text-[15px] font-semibold text-white transition-colors hover:bg-gray-800"
              >
                무료로 시작하기
              </Link>
              <Link
                href="/register/company"
                className="inline-flex h-[48px] items-center rounded-lg border border-gray-300 px-7 text-[15px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
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
