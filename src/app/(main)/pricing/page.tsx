"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import type { SubscriptionPlan } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const FEATURES = [
  "견적 제출",
  "견적요청 열람",
  "채팅 상담",
  "일일 견적 3건",
];

export default function PricingPage() {
  const [basicPlans, setBasicPlans] = useState<SubscriptionPlan[]>([]);
  const [bankInfo, setBankInfo] = useState<{ bankName: string; bankAccount: string; accountHolder: string } | null>(null);

  useEffect(() => {
    api.get("/subscriptions/plans").then(({ data }) => {
      const plans = data?.data ?? data;
      setBasicPlans(plans?.BASIC || []);
    }).catch(() => {});
    api.get("/settings/payment-info").then(({ data }) => {
      const info = data?.data ?? data;
      if (info && (info.bankName || info.bankAccount || info.accountHolder)) {
        setBankInfo(info);
      }
    }).catch(() => {});
  }, []);

  const mainPlan = basicPlans[0];

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp} className="text-center">
          <h1 className="text-2xl font-bold text-[#141412]">요금제</h1>
          <p className="mt-2 text-center text-[14px] text-[#72706a]">
            바른오더와 함께 성장하세요. 신규 업체는 3개월 무료 체험이 제공됩니다.
          </p>
        </motion.div>

        {/* Basic 요금 카드 */}
        <motion.div variants={fadeUp} className="mt-10">
          <div className="rounded-xl border border-[#2d6a4f] bg-white p-6 shadow-[0_8px_30px_rgba(45,106,79,0.12)]">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-[#72706a]">
              기본형
            </div>
            <div className="mt-1 text-xl font-bold text-[#141412]">Basic</div>
            <div className="mt-4 text-3xl font-bold text-[#141412]">
              {mainPlan ? `${mainPlan.price.toLocaleString()}원` : "-"}
              <span className="text-[14px] font-normal text-[#72706a]">/월</span>
            </div>

            {/* 기간별 가격 */}
            {basicPlans.length > 1 && (
              <div className="mt-4 space-y-1.5 border-t border-[#e2ddd6] pt-4">
                {basicPlans.map((p) => (
                  <div key={p.id} className="flex justify-between text-[13px]">
                    <span className="text-[#72706a]">{p.durationMonths}개월</span>
                    <span className="font-medium text-[#141412]">{p.price.toLocaleString()}원</span>
                  </div>
                ))}
              </div>
            )}

            {/* 포함 기능 */}
            <div className="mt-5 space-y-2.5">
              {FEATURES.map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-[13px] text-[#1a1918]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {feat}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 결제 안내 */}
        <motion.div variants={fadeUp} className="mt-8 rounded-xl border border-[#e2ddd6] bg-[#f0ede8] p-5">
          <h2 className="text-[15px] font-bold text-[#141412]">결제 안내</h2>
          <p className="mt-2 text-[13px] text-[#72706a] leading-relaxed">
            요금제 구매는 계좌이체로 진행됩니다. 아래 계좌로 입금 후 관리자에게 연락해 주시면 확인 후 구독이 활성화됩니다.
          </p>
          {bankInfo ? (
            <div className="mt-3 rounded-lg bg-white border border-[#e2ddd6] px-4 py-3">
              <p className="text-[14px] font-semibold text-[#141412]">
                {[bankInfo.bankName, bankInfo.bankAccount, bankInfo.accountHolder ? `예금주: ${bankInfo.accountHolder}` : ""].filter(Boolean).join(" / ")}
              </p>
            </div>
          ) : (
            <div className="mt-3 rounded-lg bg-white border border-[#e2ddd6] px-4 py-3">
              <p className="text-[13px] text-[#72706a]">계좌 정보 준비 중입니다. 관리자에게 문의해 주세요.</p>
            </div>
          )}
          <p className="mt-3 text-[12px] text-[#a8a49c]">
            입금 확인 후 영업일 기준 1일 이내 구독이 활성화됩니다.
          </p>
        </motion.div>
      </motion.div>

      <div className="mt-4 text-center text-[12px] text-[#a8a49c]">
        신규 업체는 3개월 무료 체험이 제공됩니다.
      </div>
    </div>
  );
}
