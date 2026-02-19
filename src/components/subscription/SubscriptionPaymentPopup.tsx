"use client";

import { useState, useEffect } from "react";
import { useSubscriptionStore } from "@/stores/subscription.store";
import Link from "next/link";
import api from "@/lib/api";

interface BankInfo {
  bankName: string;
  bankAccount: string;
  accountHolder: string;
}

export default function SubscriptionPaymentPopup() {
  const { showPaymentPopup, setShowPaymentPopup, plans, fetchPlans, subscription } =
    useSubscriptionStore();
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);

  const isTrial = subscription?.isTrial === true;

  useEffect(() => {
    if (showPaymentPopup) {
      if (!plans) fetchPlans();
      api.get("/settings/payment-info").then(({ data }) => {
        const info = data?.data ?? data;
        if (info && (info.bankName || info.bankAccount || info.accountHolder)) {
          setBankInfo(info);
        } else {
          setBankInfo(null);
        }
      }).catch(() => {});
    }
  }, [showPaymentPopup, plans, fetchPlans]);

  if (!showPaymentPopup) return null;

  const allTiers = [
    { key: "BASIC" as const, label: "Basic", plans: plans?.BASIC || [] },
    { key: "PRO" as const, label: "Pro", plans: plans?.PRO || [] },
    { key: "PREMIUM" as const, label: "Premium", plans: plans?.PREMIUM || [] },
  ];

  const title = isTrial ? "유료 구독 안내" : "구독 안내";
  const message = isTrial
    ? "현재 무료 체험 중입니다. 유료 구독으로 업그레이드하여 더 많은 기능을 이용해 보세요."
    : "서비스 이용을 위해 구독이 필요합니다. 아래 계좌로 입금 후 관리자 확인을 통해 활성화됩니다.";

  const bankDisplay = bankInfo
    ? [bankInfo.bankName, bankInfo.bankAccount, bankInfo.accountHolder ? `예금주: ${bankInfo.accountHolder}` : ""].filter(Boolean).join(" / ")
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="mt-1 text-[13px] text-gray-500">
          {message}
        </p>

        {/* 계좌 정보 */}
        <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
          <p className="text-[12px] font-medium text-gray-500">입금 계좌</p>
          {bankDisplay ? (
            <p className="mt-1 text-[14px] font-semibold text-gray-900">{bankDisplay}</p>
          ) : (
            <p className="mt-1 text-[13px] text-gray-400">계좌 정보 준비 중 - 관리자에게 문의해 주세요.</p>
          )}
        </div>

        {/* 요금제 요약 */}
        <div className="mt-4 space-y-3">
          {allTiers.map((tier) => (
            <div key={tier.key}>
              <p className="text-[13px] font-semibold text-gray-900">{tier.label}</p>
              {tier.plans.length > 0 ? (
                <div className="mt-1 space-y-0.5">
                  {tier.plans.map((plan) => (
                    <div key={plan.id} className="flex justify-between text-[12px]">
                      <span className="text-gray-500">{plan.durationMonths}개월</span>
                      <span className="font-medium text-gray-900">{plan.price.toLocaleString()}원</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-gray-400">-</p>
              )}
            </div>
          ))}
        </div>

        <p className="mt-4 text-[12px] text-gray-400">
          입금 확인 후 영업일 기준 1일 이내 구독이 활성화됩니다.
        </p>

        <div className="mt-5 flex gap-2">
          <button
            onClick={() => setShowPaymentPopup(false)}
            className="flex-1 rounded-lg border border-gray-200 py-2.5 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            닫기
          </button>
          <Link
            href="/pricing"
            onClick={() => setShowPaymentPopup(false)}
            className="flex-1 flex items-center justify-center rounded-lg bg-gray-900 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
          >
            요금제 상세보기
          </Link>
        </div>
      </div>
    </div>
  );
}
