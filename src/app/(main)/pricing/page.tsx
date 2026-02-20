"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { SubscriptionPlan } from "@/types";
import { cn } from "@/lib/utils";
import FadeIn from "@/components/animation/FadeIn";
import ScrollReveal from "@/components/animation/ScrollReveal";

const TIER_INFO = {
  BASIC: { label: "Basic", desc: "기본형", limit: "3건/일", weight: "1.0x" },
  PRO: { label: "Pro", desc: "성장형", limit: "10건/일", weight: "2.0x" },
  PREMIUM: { label: "Premium", desc: "프리미엄", limit: "50건/일", weight: "3.0x" },
};

const FEATURES = [
  { label: "견적 제출", basic: true, pro: true, premium: true },
  { label: "견적요청 열람", basic: true, pro: true, premium: true },
  { label: "채팅 상담", basic: true, pro: true, premium: true },
  { label: "검색 가중치", basic: "1.0x", pro: "2.0x", premium: "3.0x" },
  { label: "일일 견적 한도", basic: "3건", pro: "10건", premium: "50건" },
  { label: "고객관리 기능", basic: false, pro: true, premium: true },
  { label: "우선 지원", basic: false, pro: false, premium: true },
];

export default function PricingPage() {
  const [plans, setPlans] = useState<{
    BASIC: SubscriptionPlan[];
    PRO: SubscriptionPlan[];
    PREMIUM: SubscriptionPlan[];
  } | null>(null);
  const [bankInfo, setBankInfo] = useState<{ bankName: string; bankAccount: string; accountHolder: string } | null>(null);

  useEffect(() => {
    api.get("/subscriptions/plans").then(({ data }) => {
      setPlans(data?.data ?? data);
    }).catch(() => {});
    api.get("/settings/payment-info").then(({ data }) => {
      const info = data?.data ?? data;
      if (info && (info.bankName || info.bankAccount || info.accountHolder)) {
        setBankInfo(info);
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <FadeIn>
        <h1 className="text-center text-2xl font-bold text-gray-900">요금제</h1>
        <p className="mt-2 text-center text-[14px] text-gray-500">
          바른오더와 함께 성장하세요. 신규 업체는 Basic 3개월 무료 체험이 제공됩니다.
        </p>
      </FadeIn>

      {/* 요금 카드 */}
      <FadeIn delay={0.15}>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["BASIC", "PRO", "PREMIUM"] as const).map((tier) => {
          const info = TIER_INFO[tier];
          const tierPlans = plans?.[tier] || [];
          const mainPlan = tierPlans[0];
          return (
            <div
              key={tier}
              className={cn(
                "hover-lift rounded-xl border p-5",
                tier === "PREMIUM"
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white"
              )}
            >
              <div className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
                {info.desc}
              </div>
              <div className={cn("mt-1 text-lg font-bold", tier === "PREMIUM" ? "text-white" : "text-gray-900")}>
                {info.label}
              </div>
              <div className={cn("mt-3 text-2xl font-bold", tier === "PREMIUM" ? "text-white" : "text-gray-900")}>
                {mainPlan ? `${mainPlan.price.toLocaleString()}원` : "-"}
                <span className={cn("text-[13px] font-normal", tier === "PREMIUM" ? "text-gray-300" : "text-gray-500")}>
                  /월
                </span>
              </div>
              <div className={cn("mt-1 text-[12px]", tier === "PREMIUM" ? "text-gray-300" : "text-gray-500")}>
                일일 견적 {info.limit}
              </div>
              {tierPlans.length > 1 && (
                <div className={cn("mt-3 space-y-1 border-t pt-3", tier === "PREMIUM" ? "border-gray-700" : "border-gray-100")}>
                  {tierPlans.map((p) => (
                    <div key={p.id} className="flex justify-between text-[12px]">
                      <span className={tier === "PREMIUM" ? "text-gray-400" : "text-gray-500"}>
                        {p.durationMonths}개월
                      </span>
                      <span className={cn("font-medium", tier === "PREMIUM" ? "text-white" : "text-gray-900")}>
                        {p.price.toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      </FadeIn>

      {/* 기능 비교 테이블 */}
      <ScrollReveal>
      <div className="mt-12">
        <h2 className="text-[15px] font-bold text-gray-900">기능 비교</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500">기능</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold text-gray-500">Basic</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold text-gray-500">Pro</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold text-gray-500">Premium</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feat) => (
                <tr key={feat.label} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 text-[13px] text-gray-700">{feat.label}</td>
                  <td className="px-4 py-3 text-center text-[13px]">
                    {renderFeatureCell(feat.basic)}
                  </td>
                  <td className="px-4 py-3 text-center text-[13px]">
                    {renderFeatureCell(feat.pro)}
                  </td>
                  <td className="px-4 py-3 text-center text-[13px]">
                    {renderFeatureCell(feat.premium)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </ScrollReveal>

      {/* 결제 안내 */}
      <ScrollReveal delay={0.1}>
      <div className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-5">
        <h2 className="text-[15px] font-bold text-gray-900">결제 안내</h2>
        <p className="mt-2 text-[13px] text-gray-600 leading-relaxed">
          요금제 구매는 계좌이체로 진행됩니다. 아래 계좌로 입금 후 관리자에게 연락해 주시면 확인 후 구독이 활성화됩니다.
        </p>
        {bankInfo ? (
          <div className="mt-3 rounded-lg bg-white border border-gray-200 px-4 py-3">
            <p className="text-[14px] font-semibold text-gray-900">
              {[bankInfo.bankName, bankInfo.bankAccount, bankInfo.accountHolder ? `예금주: ${bankInfo.accountHolder}` : ""].filter(Boolean).join(" / ")}
            </p>
          </div>
        ) : (
          <div className="mt-3 rounded-lg bg-white border border-gray-200 px-4 py-3">
            <p className="text-[13px] text-gray-500">계좌 정보 준비 중입니다. 관리자에게 문의해 주세요.</p>
          </div>
        )}
        <p className="mt-3 text-[12px] text-gray-400">
          입금 확인 후 영업일 기준 1일 이내 구독이 활성화됩니다.
        </p>
      </div>

      </ScrollReveal>
      <div className="mt-4 text-center text-[12px] text-gray-400">
        신규 업체는 Basic 3개월 무료 체험이 제공됩니다.
      </div>
    </div>
  );
}

function renderFeatureCell(value: boolean | string) {
  if (typeof value === "string") {
    return <span className="font-medium text-gray-900">{value}</span>;
  }
  if (value) {
    return <span className="text-gray-900">O</span>;
  }
  return <span className="text-gray-300">-</span>;
}
