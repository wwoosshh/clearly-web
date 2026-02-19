"use client";

import { useState, useEffect } from "react";
import { useSubscriptionStore } from "@/stores/subscription.store";
import type { SubscriptionPlan } from "@/types";
import api from "@/lib/api";

export default function SubscriptionPaymentPopup() {
  const { showPaymentPopup, setShowPaymentPopup, plans, fetchPlans, fetchSubscription } =
    useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (showPaymentPopup && !plans) {
      fetchPlans();
    }
  }, [showPaymentPopup, plans, fetchPlans]);

  if (!showPaymentPopup) return null;

  const basicPlans = plans?.BASIC || [];

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    try {
      await api.post("/subscriptions/subscribe", { planId: selectedPlan.id });
      await fetchSubscription();
      setShowPaymentPopup(false);
      alert("구독이 시작되었습니다.");
    } catch (err: any) {
      alert(err?.response?.data?.message || "구독 신청에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-gray-900">구독 시작하기</h2>
        <p className="mt-1 text-[13px] text-gray-500">
          서비스 이용을 위해 Basic 구독을 시작해주세요.
        </p>

        <div className="mt-5 space-y-2">
          {basicPlans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                selectedPlan?.id === plan.id
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-gray-900">
                  {plan.durationMonths}개월
                </span>
                <span className="text-[14px] font-bold text-gray-900">
                  {plan.price.toLocaleString()}원
                </span>
              </div>
              {plan.durationMonths >= 3 && (
                <p className="mt-0.5 text-[12px] text-gray-500">
                  월 {Math.round(plan.price / plan.durationMonths).toLocaleString()}원
                </p>
              )}
            </button>
          ))}
        </div>

        <div className="mt-2 text-[12px] text-gray-400">
          일일 견적 제출 한도: {selectedPlan?.dailyEstimateLimit ?? 3}건
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={() => setShowPaymentPopup(false)}
            className="flex-1 rounded-lg border border-gray-200 py-2.5 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            나중에
          </button>
          <button
            onClick={handleSubscribe}
            disabled={!selectedPlan || isSubmitting}
            className="flex-1 rounded-lg bg-gray-900 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {isSubmitting ? "처리 중..." : "구독 시작"}
          </button>
        </div>
      </div>
    </div>
  );
}
