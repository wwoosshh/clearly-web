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

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-bold text-[#141412]">이용약관</h1>
          <p className="mt-2 text-sm text-[#72706a]">최종 수정일: 2026년 2월 21일</p>
        </motion.div>

        <motion.div
          variants={stagger}
          className="mt-8 space-y-8 text-[14px] leading-relaxed text-[#1a1918]"
        >
          {/* 제1조 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">제1조 (목적)</h2>
            <p className="mt-2">
              본 약관은 바른오더(이하 &quot;회사&quot;)가 운영하는
              웹사이트(clearly.co.kr) 및 관련 서비스(이하 &quot;서비스&quot;)의
              이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타
              필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </motion.section>

          {/* 제2조 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              제2조 (정의)
            </h2>
            <p className="mt-2">본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>
                &quot;서비스&quot;란 회사가 운영하는 웹사이트 및 모바일
                애플리케이션을 통해 제공하는 이사청소 업체 매칭 플랫폼 서비스를
                말합니다. 이용자가 이사청소 업체를 검색·비교하고, 업체에 견적을
                요청하며, 채팅을 통해 소통할 수 있는 중개 서비스를 포함합니다.
              </li>
              <li>
                &quot;이용자&quot;란 본 약관에 따라 회사가 제공하는 서비스를
                이용하는 고객회원, 업체회원 및 비회원을 포괄하여 말합니다.
              </li>
              <li>
                &quot;고객회원&quot;이란 이사청소 서비스를 이용하고자 회원가입을
                한 개인 이용자를 말합니다.
              </li>
              <li>
                &quot;업체회원&quot;이란 이사청소 서비스를 제공하기 위해
                회원가입을 한 사업자를 말합니다.
              </li>
              <li>
                &quot;비회원&quot;이란 회원가입 없이 회사가 제공하는 서비스의
                일부를 이용하는 자를 말합니다.
              </li>
              <li>
                &quot;구독 서비스&quot;란 업체회원이 월 단위로 이용료를
                지불하고 프리미엄 기능을 이용할 수 있는 유료 서비스를 말합니다.
              </li>
            </ol>
          </motion.section>

          {/* 제3조 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              제3조 (회사 정보)
            </h2>
            <div className="mt-2 rounded-lg border border-[#e2ddd6] bg-[#f0ede8] p-4 space-y-1">
              <p>상호: 바른오더</p>
              <p>대표자: [추후 기재]</p>
              <p>소재지: [추후 기재]</p>
              <p>사업자등록번호: [추후 기재]</p>
              <p>통신판매업 신고번호: [추후 기재]</p>
              <p>연락처: [추후 기재]</p>
              <p>이메일: support@clearly.co.kr</p>
            </div>
          </motion.section>

          {/* 제4조 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              제4조 (약관의 효력 및 변경)
            </h2>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>
                본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게
                공지함으로써 효력이 발생합니다.
              </li>
              <li>
                회사는 「약관의 규제에 관한 법률」, 「정보통신망 이용촉진 및
                정보보호 등에 관한 법률」 등 관련 법령에 위배되지 않는 범위에서
                본 약관을 변경할 수 있습니다.
              </li>
              <li>
                회사가 약관을 변경할 경우에는 적용일자 및 변경사유를 명시하여
                현행 약관과 함께 서비스 내에 그 적용일자 7일 전부터
                공지합니다. 다만, 이용자에게 불리한 약관 변경의 경우에는
                적용일자 30일 전부터 공지하며, 이메일 등 전자적 수단을 통해
                개별 통지합니다.
              </li>
              <li>
                이용자가 변경된 약관의 적용에 동의하지 않는 경우, 이용자는
                서비스 이용을 중단하고 회원 탈퇴를 할 수 있습니다. 변경된
                약관의 효력 발생일 이후에도 서비스를 계속 이용하는 경우에는
                약관 변경에 동의한 것으로 봅니다.
              </li>
            </ol>
          </motion.section>

          {/* 제5조 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              제5조 (서비스의 내용 및 제공)
            </h2>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>
                회사가 제공하는 서비스의 내용은 다음과 같습니다.
                <ul className="mt-1 ml-4 list-inside list-disc space-y-1">
                  <li>이사청소 업체 검색 및 매칭 서비스</li>
                  <li>견적 요청 및 비교 서비스</li>
                  <li>업체 리뷰 확인 및 작성</li>
                  <li>채팅을 통한 고객-업체 간 소통 서비스</li>
                  <li>업체회원 대상 구독(프리미엄) 서비스</li>
                  <li>기타 회사가 추가 개발하거나 제휴를 통해 제공하는 서비스</li>
                </ul>
              </li>
              <li>
                회사는 이사청소 업체와 고객 간의 매칭을 중개하는 플랫폼을
                제공할 뿐이며, 실제 이사청소 서비스의 제공 주체가 아닙니다.
                이사청소 서비스에 관한 계약은 고객과 업체 간에 직접
                체결됩니다.
              </li>
              <li>
                회사는 서비스의 품질 향상을 위해 서비스의 내용을 변경할 수
                있으며, 중요한 변경 시에는 사전에 공지합니다.
              </li>
              <li>
                서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.
                다만, 시스템 점검, 장비 교체, 기타 운영상 필요한 경우 서비스
                제공을 일시 중단할 수 있으며, 이 경우 사전에 공지합니다.
              </li>
            </ol>
          </motion.section>

          {/* 제6조 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              제6조 (회원가입)
            </h2>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>
                만 14세 이상인 자는 회사가 정한 양식에 따라 회원정보를 기입한
                후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을
                신청할 수 있습니다.
              </li>
              <li>
                회원가입은 자체 이메일/비밀번호 가입 또는 제3자 소셜
                로그인(카카오, 네이버, 구글)을 통해 가능합니다.
              </li>
              <li>
                회사는 다음 각 호에 해당하는 경우 회원가입을 승인하지 않거나
                사후에 이용 계약을 해지할 수 있습니다.
                <ul className="mt-1 ml-4 list-inside list-disc space-y-1">
                  <li>만 14세 미만인 경우</li>
                  <li>가입 신청자가 본 약관에 의해 이전에 회원 자격을 상실한 적이 있는 경우</li>
                  <li>허위 정보를 기재하거나 타인의 명의를 도용한 경우</li>
                  <li>
                    업체회원이 유효한 사업자등록증을 보유하지 않은 경우
                  </li>
                  <li>기타 회사가 정한 이용 기준에 부합하지 않는 경우</li>
                </ul>
              </li>
              <li>
                회원은 가입 시 등록한 정보에 변경이 있는 경우 즉시 수정하여야
                하며, 변경하지 않아 발생한 불이익에 대한 책임은 회원에게
                있습니다.
              </li>
            </ol>
          </motion.section>

          {/* 제7조 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              제7조 (회원 탈퇴 및 자격 상실)
            </h2>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>
                회원은 언제든지 서비스 내 마이페이지 또는 고객센터를 통해
                탈퇴를 요청할 수 있으며, 회사는 즉시 처리합니다.
              </li>
              <li>
                탈퇴 시 회원의 개인정보는 「개인정보처리방침」에 따라
                처리됩니다. 다만, 관련 법령에 따라 일정 기간 보관이 필요한
                정보는 해당 기간 동안 보관 후 파기합니다.
              </li>
              <li>
                업체회원이 탈퇴하는 경우 진행 중인 구독 서비스는 해당 구독
                기간 만료일까지 유지되며, 이미 결제된 구독료는 환불되지
                않습니다. 다만, 관련 법령에 따른 환불 사유에 해당하는 경우는
                예외로 합니다.
              </li>
              <li>
                회원이 다음 각 호에 해당하는 경우 회사는 회원 자격을
                제한하거나 정지시킬 수 있습니다.
                <ul className="mt-1 ml-4 list-inside list-disc space-y-1">
                  <li>가입 시 허위 내용을 등록한 경우</li>
                  <li>서비스를 이용하여 법령 또는 본 약관이 금지하는 행위를 하는 경우</li>
                  <li>다른 이용자의 서비스 이용을 방해하거나 그 정보를 도용하는 경우</li>
                  <li>서비스를 이용하여 공공질서, 미풍양속에 반하는 행위를 하는 경우</li>
                </ul>
              </li>
            </ol>
          </motion.section>

          {/* 제8조 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              제8조 (구독 서비스 및 결제)
            </h2>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>
                회사는 업체회원을 대상으로 프리미엄 기능을 제공하는 유료 구독
                서비스를 운영할 수 있습니다. 구독 서비스의 종류, 가격, 기능
                범위는 서비스 내에 별도로 안내합니다.
              </li>
              <li>
                구독 서비스는 회사가 안내하는 결제 방법(계좌이체 등)을 통해
                결제되며, 구독 기간 및 갱신 방법은 서비스 내에서 별도로
                안내합니다.
              </li>
              <li>
                업체회원은 구독 서비스를 언제든지 해지할 수 있으며, 해지 시
                해당 구독 기간 종료일까지 서비스를 이용할 수 있습니다.
              </li>
              <li>
                구독 서비스 결제 후 환불은 「콘텐츠산업 진흥법」 및
                관련 법령에 따르며, 구체적인 환불 정책은 서비스 내에서
                별도로 안내합니다.
              </li>
              <li>
                고객회원의 서비스 이용(업체 검색, 매칭 요청, 견적 비교, 채팅
                등)은 무료입니다.
              </li>
              <li>
                고객과 업체 간의 이사청소 서비스 대금은 회사의 플랫폼을
                통하지 않고 고객과 업체 간에 직접 결제·정산되며, 회사는
                이에 대한 책임을 지지 않습니다.
              </li>
            </ol>
          </motion.section>

          {/* 제9조 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              제9조 (이용자의 의무)
            </h2>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>
                이용자는 서비스 이용 시 관련 법령 및 본 약관의 규정을
                준수하여야 합니다.
              </li>
              <li>
                이용자는 다음 각 호의 행위를 하여서는 안 됩니다.
                <ul className="mt-1 ml-4 list-inside list-disc space-y-1">
                  <li>가입 신청 또는 정보 변경 시 허위 내용을 등록하는 행위</li>
                  <li>타인의 개인정보, 계정을 도용하는 행위</li>
                  <li>허위 리뷰 작성 또는 리뷰를 조작하는 행위</li>
                  <li>회사의 서비스를 이용하여 얻은 정보를 회사의 사전 동의 없이 복제, 유통, 상업적으로 이용하는 행위</li>
                  <li>회사 또는 제3자의 지식재산권을 침해하는 행위</li>
                  <li>회사 또는 제3자의 명예를 훼손하거나 업무를 방해하는 행위</li>
                  <li>서비스의 안정적 운영을 방해하는 행위(해킹, 바이러스 유포 등)</li>
                  <li>기타 관련 법령에 위반되거나 선량한 풍속에 반하는 행위</li>
                </ul>
              </li>
              <li>
                업체회원은 사업자등록증 등 사업 관련 정보를 정확하게
                제공하여야 하며, 허위 또는 과장된 서비스 정보를 게시하여서는
                안 됩니다.
              </li>
            </ol>
          </motion.section>

          {/* 제10조 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              제10조 (회사의 의무)
            </h2>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>
                회사는 관련 법령과 본 약관이 금지하는 행위를 하지 않으며,
                지속적이고 안정적으로 서비스를 제공하기 위해 최선을 다합니다.
              </li>
              <li>
                회사는 이용자의 개인정보를 안전하게 관리하며,
                「개인정보처리방침」에 따라 처리합니다.
              </li>
              <li>
                회사는 이용자로부터 제기되는 의견이나 불만이 정당하다고
                인정할 경우 적절한 절차를 통해 처리합니다.
              </li>
            </ol>
          </motion.section>

          {/* 제11조 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              제11조 (서비스 이용 제한)
            </h2>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>
                회사는 이용자가 본 약관을 위반하거나 서비스의 정상적인
                운영을 방해한 경우, 경고, 일시 정지, 영구 정지 등으로
                서비스 이용을 단계적으로 제한할 수 있습니다.
              </li>
              <li>
                회사는 전항에 따른 이용 제한 시 그 사유, 제한 유형, 기간 등을
                이용자에게 통지합니다. 다만, 긴급하게 조치할 필요가 있는
                경우에는 사후에 통지할 수 있습니다.
              </li>
              <li>
                이용자는 이용 제한 조치에 대해 이의가 있는 경우 회사에
                이의신청을 할 수 있으며, 회사는 이의 신청이 정당하다고
                인정되는 경우 즉시 서비스 이용을 재개합니다.
              </li>
            </ol>
          </motion.section>

          {/* 제12조 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              제12조 (지식재산권)
            </h2>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>
                서비스에 포함된 콘텐츠(디자인, 텍스트, 그래픽, 로고, 소프트웨어
                등)에 대한 지식재산권은 회사에 귀속됩니다.
              </li>
              <li>
                이용자가 서비스 내에 게시한 콘텐츠(리뷰, 사진 등)의
                지식재산권은 해당 이용자에게 귀속됩니다. 다만, 회사는 서비스
                운영, 개선, 홍보 목적으로 이용자가 게시한 콘텐츠를 서비스 내에
                사용할 수 있습니다.
              </li>
              <li>
                이용자는 회사의 사전 서면 동의 없이 서비스를 이용하여 얻은
                정보를 영리 목적으로 이용하거나 제3자에게 제공할 수 없습니다.
              </li>
            </ol>
          </motion.section>

          {/* 제13조 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              제13조 (면책사항)
            </h2>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>
                회사는 이사청소 업체와 고객 간에 체결된 서비스 계약의 이행,
                품질, 하자 등에 대해 직접적인 책임을 지지 않습니다. 회사는
                매칭 중개 플랫폼을 제공할 뿐이며, 실제 이사청소 서비스에 관한
                분쟁은 고객과 업체 간에 해결하여야 합니다.
              </li>
              <li>
                회사는 천재지변, 전쟁, 테러, 정전, 통신 장애, 시스템 장애 등
                불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지
                않습니다.
              </li>
              <li>
                회사는 이용자의 귀책 사유로 인한 서비스 이용 장애에 대해
                책임을 지지 않습니다.
              </li>
              <li>
                회사는 이용자가 서비스를 통해 얻은 정보(업체 정보, 견적 등)의
                정확성, 완전성을 보증하지 않습니다. 이용자는 중요한 결정을
                내리기 전에 해당 정보를 독립적으로 확인할 책임이 있습니다.
              </li>
              <li>
                다만, 회사의 고의 또는 중대한 과실로 인하여 이용자에게 손해가
                발생한 경우에는 그러하지 아니합니다.
              </li>
            </ol>
          </motion.section>

          {/* 제14조 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              제14조 (손해배상)
            </h2>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>
                회사 또는 이용자는 본 약관을 위반하여 상대방에게 손해를 입힌
                경우, 그 손해를 배상할 책임이 있습니다.
              </li>
              <li>
                회사가 개별 서비스에 대한 별도의 이용조건 및 정책에서 손해배상에
                관한 사항을 정하고 있는 경우, 해당 조건 및 정책이 우선
                적용됩니다.
              </li>
            </ol>
          </motion.section>

          {/* 제15조 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              제15조 (분쟁 해결)
            </h2>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>
                본 약관과 관련하여 회사와 이용자 간에 분쟁이 발생한 경우
                당사자 간 상호 협의하여 해결하도록 합니다.
              </li>
              <li>
                협의가 이루어지지 않는 경우, 이용자는
                한국소비자원(www.kca.go.kr), 전자거래분쟁조정위원회
                등 관련 분쟁조정기관에 분쟁 해결을 신청할 수 있습니다.
              </li>
              <li>
                전항에도 불구하고 소송이 제기되는 경우 「민사소송법」에 따른
                관할 법원에 소를 제기합니다.
              </li>
            </ol>
          </motion.section>

          {/* 제16조 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              제16조 (준거법)
            </h2>
            <p className="mt-2">
              본 약관의 해석 및 회사와 이용자 간의 분쟁에 관하여는 대한민국
              법률을 적용합니다.
            </p>
          </motion.section>

          {/* 부칙 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">부칙</h2>
            <p className="mt-2">본 약관은 2026년 2월 21일부터 시행합니다.</p>
          </motion.section>
        </motion.div>
      </motion.div>
    </div>
  );
}
