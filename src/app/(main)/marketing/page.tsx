"use client";

import { motion } from "framer-motion";

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

export default function MarketingConsentPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-bold text-[#141412]">
            마케팅 정보 수신 동의 안내
          </h1>
          <p className="mt-2 text-sm text-[#72706a]">
            최종 수정일: 2026년 2월 21일
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          className="mt-8 space-y-8 text-[14px] leading-relaxed text-[#1a1918]"
        >
          {/* 안내문 */}
          <motion.section variants={fadeUp}>
            <p>
              바른오더(이하 &quot;회사&quot;)는 이용자에게 유용한 서비스 정보와
              혜택을 제공하기 위하여 아래와 같이 마케팅 정보 수신 동의를 받고
              있습니다. 마케팅 정보 수신 동의는 선택 사항이며, 동의하지 않더라도
              서비스 이용에는 제한이 없습니다.
            </p>
          </motion.section>

          {/* 1. 수집 항목 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              1. 수집 항목
            </h2>
            <p className="mt-2">
              마케팅 정보 발송을 위해 다음의 개인정보를 수집·이용합니다.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse border border-[#e2ddd6] text-sm">
                <thead>
                  <tr className="bg-[#f0ede8]">
                    <th className="border border-[#e2ddd6] px-3 py-2 text-left font-medium">
                      수집 항목
                    </th>
                    <th className="border border-[#e2ddd6] px-3 py-2 text-left font-medium">
                      수집 목적
                    </th>
                    <th className="border border-[#e2ddd6] px-3 py-2 text-left font-medium">
                      보유 기간
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-[#e2ddd6] px-3 py-2">
                      이메일
                    </td>
                    <td className="border border-[#e2ddd6] px-3 py-2">
                      이메일을 통한 마케팅 정보 발송
                    </td>
                    <td className="border border-[#e2ddd6] px-3 py-2">
                      동의 철회 시까지
                    </td>
                  </tr>
                  <tr className="bg-[#faf9f7]">
                    <td className="border border-[#e2ddd6] px-3 py-2">
                      휴대전화번호
                    </td>
                    <td className="border border-[#e2ddd6] px-3 py-2">
                      SMS/알림톡을 통한 마케팅 정보 발송
                    </td>
                    <td className="border border-[#e2ddd6] px-3 py-2">
                      동의 철회 시까지
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.section>

          {/* 2. 이용 목적 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              2. 이용 목적
            </h2>
            <p className="mt-2">
              수집된 개인정보는 다음의 마케팅 목적으로만 이용됩니다.
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                <strong>이벤트·할인 정보:</strong> 프로모션, 할인 쿠폰, 특별
                이벤트 등 혜택 안내
              </li>
              <li>
                <strong>신규 서비스 안내:</strong> 새로운 기능 출시, 서비스
                업데이트, 파트너십 소식 안내
              </li>
              <li>
                <strong>맞춤 프로모션:</strong> 이용자의 서비스 이용 패턴에
                기반한 맞춤형 추천 및 혜택 제공
              </li>
            </ul>
          </motion.section>

          {/* 3. 수신 채널 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              3. 수신 채널
            </h2>
            <p className="mt-2">
              마케팅 정보는 다음의 채널을 통해 발송됩니다.
            </p>
            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-[#e2ddd6] bg-[#f0ede8] p-4 space-y-1 text-sm">
                <p className="font-medium text-[#1a1918]">이메일</p>
                <p className="text-[#72706a]">
                  서비스 관련 소식, 이벤트, 프로모션 정보를 이메일로
                  발송합니다.
                </p>
              </div>
              <div className="rounded-lg border border-[#e2ddd6] bg-[#f0ede8] p-4 space-y-1 text-sm">
                <p className="font-medium text-[#1a1918]">SMS / 알림톡</p>
                <p className="text-[#72706a]">
                  긴급 혜택, 할인 정보, 맞춤 추천 등을 문자 메시지 또는
                  카카오 알림톡으로 발송합니다.
                </p>
              </div>
            </div>
          </motion.section>

          {/* 4. 동의 철회 방법 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              4. 동의 철회 방법
            </h2>
            <p className="mt-2">
              마케팅 정보 수신에 동의한 후에도 언제든지 다음의 방법으로 동의를
              철회(수신 거부)할 수 있습니다.
            </p>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>
                <strong>마이페이지 설정:</strong> 서비스 내 마이페이지 &gt;
                알림 설정에서 마케팅 수신 동의를 직접 해제할 수 있습니다.
              </li>
              <li>
                <strong>수신 메시지 내 거부:</strong> 수신된 이메일 또는 문자
                메시지 하단의 &quot;수신 거부&quot; 링크를 통해 즉시 수신을
                거부할 수 있습니다.
              </li>
              <li>
                <strong>고객센터 연락:</strong> 이메일(support@clearly.co.kr)
                또는 고객센터를 통해 수신 거부를 요청할 수 있습니다.
              </li>
            </ol>
          </motion.section>

          {/* 5. 유의사항 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              5. 유의사항
            </h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                마케팅 정보 수신 동의는 선택 사항이며, 동의하지 않아도
                바른오더의 기본 서비스를 이용할 수 있습니다.
              </li>
              <li>
                동의 철회 후에도 이미 발송된 마케팅 정보는 수신될 수 있으며,
                처리에 최대 48시간이 소요될 수 있습니다.
              </li>
              <li>
                서비스 이용에 필수적인 공지사항(약관 변경, 서비스 중단 등)은
                마케팅 수신 동의 여부와 관계없이 발송됩니다.
              </li>
              <li>
                회사는 광고성 정보 전송 시 「정보통신망 이용촉진 및 정보보호
                등에 관한 법률」을 준수하며, 제목란 및 본문에 광고임을
                표시하고 수신 거부 방법을 명시합니다.
              </li>
            </ul>
          </motion.section>
        </motion.div>
      </motion.div>
    </div>
  );
}
