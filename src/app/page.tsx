"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import FadeIn from "@/components/animation/FadeIn";
import ScrollReveal from "@/components/animation/ScrollReveal";

export default function Home() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => {
    if (keyword.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 overflow-x-clip">
        {/* Hero */}
        <section className="pt-12 pb-16 sm:pt-24 sm:pb-32 overflow-hidden">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-16">
              {/* Left - Text */}
              <div className="relative flex-shrink-0 lg:max-w-[520px]">
                <Image
                  src="/icon-barunorder.svg"
                  alt="바른오더"
                  width={512}
                  height={512}
                  className="pointer-events-none absolute -top-4 right-8 w-[56px] h-[56px] sm:-top-6 sm:right-2 sm:w-[80px] sm:h-[80px] rotate-12 drop-shadow-lg select-none"
                  priority
                />
                <FadeIn y={30} duration={0.7}>
                  <h1 className="text-[36px] font-bold leading-[1.18] tracking-[-0.025em] text-gray-900 sm:text-[52px]">
                    이사청소,
                    <br />
                    검증된 업체와 함께.
                  </h1>
                </FadeIn>
                <FadeIn y={20} delay={0.15} duration={0.7}>
                  <p className="mt-5 max-w-[460px] text-[16px] leading-[1.75] text-gray-500 sm:mt-6 sm:text-[17px]">
                    사업자 인증부터 서비스 품질, 고객 평가까지 꼼꼼하게 검증된
                    이사청소 업체를 매칭해드립니다.
                  </p>
                </FadeIn>

                <FadeIn y={20} delay={0.3} duration={0.7}>
                  <div className="mt-8 flex max-w-[500px] flex-col gap-2 sm:mt-10 sm:flex-row sm:gap-0 sm:items-center sm:rounded-lg sm:border sm:border-gray-300 sm:bg-white sm:transition-colors sm:focus-within:border-gray-900">
                    <div className="flex items-center rounded-lg border border-gray-300 bg-white sm:flex-1 sm:border-0 sm:rounded-none">
                      <div className="flex items-center pl-4 text-gray-400">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="업체명 또는 키워드로 검색"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="h-[50px] flex-1 bg-transparent px-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      className="press-scale h-[46px] w-full shrink-0 rounded-lg bg-gray-900 text-[14px] font-medium text-white transition-colors hover:bg-gray-800 sm:my-1.5 sm:mr-1.5 sm:h-[38px] sm:w-auto sm:rounded-md sm:px-5"
                    >
                      업체 찾기
                    </button>
                  </div>
                </FadeIn>
              </div>

              {/* Right - Visual */}
              <FadeIn delay={0.2} y={0} className="hidden lg:block relative w-[480px] h-[420px] flex-shrink-0">
                <div className="absolute top-6 right-0 w-[340px] h-[340px] rounded-3xl bg-gray-50 border border-gray-100" />
                <div className="absolute bottom-0 left-6 w-[180px] h-[180px] rounded-2xl bg-gray-900/[0.03]" />

                <div className="hover-lift absolute top-10 left-4 w-[300px] rounded-2xl border border-gray-200 bg-white p-5 shadow-lg shadow-gray-200/60">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-gray-900">클린하우스</p>
                      <p className="text-[12px] text-gray-400">서울 강남구 · 이사청소 전문</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span className="text-[13px] font-semibold text-gray-900">4.9</span>
                      <span className="text-[12px] text-gray-400">(128)</span>
                    </div>
                    <div className="h-3 w-px bg-gray-200" />
                    <span className="text-[12px] text-gray-400">매칭 342건</span>
                  </div>
                  <div className="mt-3.5 flex gap-1.5">
                    {["입주청소", "이사청소", "거주청소"].map((tag) => (
                      <span key={tag} className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">{tag}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3.5">
                    <p className="text-[13px] text-gray-500">예상 가격대</p>
                    <p className="text-[15px] font-bold text-gray-900">18~25만원</p>
                  </div>
                </div>

                <FadeIn delay={0.5} y={-10}>
                  <div className="absolute top-2 right-4 w-[200px] rounded-xl border border-gray-200 bg-white p-3.5 shadow-lg shadow-gray-200/60">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-gray-900">매칭 수락됨</p>
                        <p className="text-[11px] text-gray-400">방금 전</p>
                      </div>
                    </div>
                  </div>
                </FadeIn>

                <FadeIn delay={0.7} y={10}>
                  <div className="absolute bottom-8 right-0 w-[240px] rounded-xl border border-gray-200 bg-white p-4 shadow-lg shadow-gray-200/60">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <p className="mt-2 text-[13px] leading-[1.6] text-gray-600">
                      &ldquo;꼼꼼하게 청소해주셨어요. 입주 전 깔끔해져서 만족합니다!&rdquo;
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-gray-200" />
                      <p className="text-[11px] text-gray-400">김** · 서울 마포구</p>
                    </div>
                  </div>
                </FadeIn>

                <FadeIn delay={0.6} y={0}>
                  <div className="absolute bottom-[168px] left-0 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md shadow-gray-200/40">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-700">평균 응답</p>
                      <p className="text-[12px] font-bold text-gray-900">15분 이내</p>
                    </div>
                  </div>
                </FadeIn>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Numbers */}
        <ScrollReveal>
          <section className="border-y border-gray-100 bg-gray-50">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
              <div className="grid grid-cols-2 gap-4 sm:gap-8 sm:grid-cols-4">
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
                    <p className="mt-1.5 text-[13px] text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* How it works */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <ScrollReveal>
              <p className="text-[13px] font-semibold tracking-widest text-gray-400">이용 방법</p>
              <h2 className="mt-2.5 text-[26px] font-bold tracking-[-0.02em] text-gray-900 sm:text-[32px]">간단한 3단계</h2>
            </ScrollReveal>

            <div className="mt-10 grid grid-cols-1 gap-10 sm:mt-16 sm:grid-cols-3">
              {[
                { num: "01", title: "주소와 일정 입력", desc: "청소할 주소, 평수, 희망 일정을 입력하면 조건에 맞는 업체를 추천해드립니다." },
                { num: "02", title: "업체 선택 및 매칭", desc: "추천된 업체의 평점, 리뷰, 가격대를 비교하고 원하는 업체에 매칭을 요청하세요." },
                { num: "03", title: "채팅으로 상담", desc: "매칭이 수락되면 1:1 채팅방에서 세부 일정과 비용을 직접 조율합니다." },
              ].map((item, i) => (
                <ScrollReveal key={item.num} delay={i * 0.1}>
                  <div>
                    <p className="text-[13px] font-semibold tabular-nums text-gray-300">{item.num}</p>
                    <h3 className="mt-3 text-[17px] font-bold text-gray-900">{item.title}</h3>
                    <p className="mt-2.5 text-[15px] leading-[1.7] text-gray-500">{item.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section className="border-t border-gray-100 bg-gray-50 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <ScrollReveal>
              <p className="text-[13px] font-semibold tracking-widest text-gray-400">왜 바른오더인가요</p>
              <h2 className="mt-2.5 text-[26px] font-bold tracking-[-0.02em] text-gray-900 sm:text-[32px]">다른 플랫폼과 다릅니다</h2>
            </ScrollReveal>

            <div className="mt-14 grid grid-cols-1 gap-x-16 gap-y-10 sm:grid-cols-2">
              {[
                { title: "전수 검증 시스템", desc: "사업자등록증 확인, 보험가입 여부, 실제 서비스 이력까지 다단계로 검증합니다. 승인된 업체만 플랫폼에 등록됩니다." },
                { title: "낮은 이용 수수료", desc: "타 플랫폼 대비 낮은 수수료 구조로 업체와 고객 모두에게 합리적인 가격을 제공합니다." },
                { title: "이사청소 전문", desc: "범용 플랫폼이 아닌 이사청소 전문 서비스입니다. 입주, 퇴거 청소에 특화된 검색과 매칭을 경험하세요." },
                { title: "투명한 직접 소통", desc: "매칭 후 1:1 채팅으로 업체와 직접 소통합니다. 플랫폼은 매칭까지만 관여하고, 이후는 자유롭게 조율하세요." },
              ].map((item, i) => (
                <ScrollReveal key={item.title} delay={i * 0.08}>
                  <div>
                    <h3 className="text-[17px] font-bold text-gray-900">{item.title}</h3>
                    <p className="mt-2 text-[15px] leading-[1.7] text-gray-500">{item.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <ScrollReveal>
          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
              <h2 className="text-[26px] font-bold tracking-[-0.02em] text-gray-900 sm:text-[32px]">깨끗한 시작, 지금 바로.</h2>
              <p className="mt-4 text-[15px] text-gray-500">회원가입 후 바로 매칭을 시작할 수 있습니다.</p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link href="/register" className="press-scale inline-flex h-[48px] items-center rounded-lg bg-gray-900 px-7 text-[15px] font-semibold text-white transition-colors hover:bg-gray-800">
                  무료로 시작하기
                </Link>
                <Link href="/register/company" className="press-scale inline-flex h-[48px] items-center rounded-lg border border-gray-300 px-7 text-[15px] font-medium text-gray-700 transition-colors hover:bg-gray-50">
                  업체 등록 신청
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </main>

      <Footer />
    </div>
  );
}
