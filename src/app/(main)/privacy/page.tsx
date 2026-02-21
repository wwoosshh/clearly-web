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

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-bold text-[#141412]">개인정보처리방침</h1>
          <p className="mt-2 text-sm text-[#72706a]">최종 수정일: 2026년 2월 21일</p>
        </motion.div>

        <motion.div
          variants={stagger}
          className="mt-8 space-y-8 text-[14px] leading-relaxed text-[#1a1918]"
        >
          {/* 전문 */}
          <motion.section variants={fadeUp}>
            <p>
              바른오더(이하 &quot;회사&quot;)는 「개인정보 보호법」 제30조에
              따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고
              원활하게 처리할 수 있도록 하기 위하여 다음과 같이
              개인정보처리방침을 수립·공개합니다.
            </p>
          </motion.section>

          {/* 1. 개인정보의 처리 목적 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              1. 개인정보의 처리 목적
            </h2>
            <p className="mt-2">
              회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고
              있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
              이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에
              따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                <strong>회원 가입 및 관리:</strong> 회원 가입 의사 확인, 본인
                확인, 회원 자격 유지·관리, 서비스 부정이용 방지, 연령 확인
              </li>
              <li>
                <strong>서비스 제공:</strong> 이사청소 업체 매칭, 견적 요청 및
                비교, 업체 정보 제공, 채팅 서비스 제공, 구독 서비스 제공 및
                결제 처리
              </li>
              <li>
                <strong>고객 문의 처리:</strong> 민원 접수 및 답변, 불만 처리,
                서비스 이용 관련 고지사항 전달
              </li>
              <li>
                <strong>마케팅 및 광고 활용:</strong> 이벤트·광고성 정보 제공
                및 참여 기회 제공, 서비스 이용 통계 분석 (별도 동의 시)
              </li>
              <li>
                <strong>서비스 개선:</strong> 서비스 이용 통계 분석, 신규
                서비스 개발, 서비스 품질 향상
              </li>
            </ul>
          </motion.section>

          {/* 2. 수집하는 개인정보의 항목 및 수집 방법 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              2. 수집하는 개인정보의 항목 및 수집 방법
            </h2>
            <div className="mt-2 space-y-4">
              <div>
                <h3 className="font-medium text-[#1a1918]">
                  가. 필수 수집 항목
                </h3>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>
                    고객회원 가입: 이메일, 비밀번호, 이름, 휴대전화번호
                  </li>
                  <li>
                    업체회원 가입: 이메일, 비밀번호, 이름, 휴대전화번호,
                    상호명, 사업자등록번호, 대표자명, 사업장 주소
                  </li>
                  <li>문의하기: 이름, 이메일, 문의 내용</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-[#1a1918]">
                  나. 선택 수집 항목
                </h3>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>프로필 이미지, 상세 주소, 서비스 희망 지역</li>
                  <li>마케팅 수신 동의 시: 이메일, 휴대전화번호</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-[#1a1918]">
                  다. 소셜 로그인 시 수집 항목
                </h3>
                <p className="mt-1 text-[#72706a]">
                  제3자(카카오, 네이버, 구글) 로그인 이용 시 해당 플랫폼에서
                  다음 정보를 제공받습니다.
                </p>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>카카오: 카카오 계정 식별자, 닉네임, 이메일(선택), 프로필 이미지(선택)</li>
                  <li>네이버: 네이버 계정 식별자, 이름, 이메일, 프로필 이미지(선택)</li>
                  <li>구글: 구글 계정 식별자, 이름, 이메일, 프로필 이미지(선택)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-[#1a1918]">
                  라. 자동 수집 항목
                </h3>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>
                    서비스 이용 기록, 접속 로그, 접속 IP 정보, 쿠키,
                    브라우저 종류 및 버전, 기기 정보, 운영체제 정보
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-[#1a1918]">
                  마. 수집 방법
                </h3>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>웹사이트 회원가입, 문의하기 등 이용자의 직접 입력</li>
                  <li>소셜 로그인 연동을 통한 자동 수집</li>
                  <li>서비스 이용 과정에서 자동으로 생성·수집되는 정보</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* 3. 개인정보의 보유 및 이용 기간 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              3. 개인정보의 보유 및 이용 기간
            </h2>
            <p className="mt-2">
              회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터
              개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서
              개인정보를 처리·보유합니다. 각 개인정보의 보유 기간은 다음과
              같습니다.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse border border-[#e2ddd6] text-sm">
                <thead>
                  <tr className="bg-[#f0ede8]">
                    <th className="border border-[#e2ddd6] px-3 py-2 text-left font-medium">보유 항목</th>
                    <th className="border border-[#e2ddd6] px-3 py-2 text-left font-medium">보유 기간</th>
                    <th className="border border-[#e2ddd6] px-3 py-2 text-left font-medium">근거 법률</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-[#e2ddd6] px-3 py-2">회원 정보</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">회원 탈퇴 시까지</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">-</td>
                  </tr>
                  <tr className="bg-[#faf9f7]">
                    <td className="border border-[#e2ddd6] px-3 py-2">계약 또는 청약철회 등에 관한 기록</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">5년</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">전자상거래법</td>
                  </tr>
                  <tr>
                    <td className="border border-[#e2ddd6] px-3 py-2">대금결제 및 재화 등의 공급에 관한 기록</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">5년</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">전자상거래법</td>
                  </tr>
                  <tr className="bg-[#faf9f7]">
                    <td className="border border-[#e2ddd6] px-3 py-2">소비자의 불만 또는 분쟁처리에 관한 기록</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">3년</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">전자상거래법</td>
                  </tr>
                  <tr>
                    <td className="border border-[#e2ddd6] px-3 py-2">표시·광고에 관한 기록</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">6개월</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">전자상거래법</td>
                  </tr>
                  <tr className="bg-[#faf9f7]">
                    <td className="border border-[#e2ddd6] px-3 py-2">웹사이트 방문 기록</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">3개월</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">통신비밀보호법</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.section>

          {/* 4. 개인정보의 제3자 제공 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              4. 개인정보의 제3자 제공
            </h2>
            <p className="mt-2">
              회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서
              명시한 범위 내에서만 처리하며, 원칙적으로 정보주체의 동의 없이
              본래 목적을 초과하여 처리하거나 제3자에게 제공하지 않습니다.
              다만, 다음의 경우에는 예외로 합니다.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse border border-[#e2ddd6] text-sm">
                <thead>
                  <tr className="bg-[#f0ede8]">
                    <th className="border border-[#e2ddd6] px-3 py-2 text-left font-medium">제공받는 자</th>
                    <th className="border border-[#e2ddd6] px-3 py-2 text-left font-medium">제공 목적</th>
                    <th className="border border-[#e2ddd6] px-3 py-2 text-left font-medium">제공 항목</th>
                    <th className="border border-[#e2ddd6] px-3 py-2 text-left font-medium">보유 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-[#e2ddd6] px-3 py-2">매칭된 이사청소 업체</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">이사청소 서비스 연결</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">이름, 연락처, 주소</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">서비스 완료 후 파기</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ul className="mt-3 list-inside list-disc space-y-1">
              <li>정보주체가 사전에 별도 동의한 경우</li>
              <li>
                법령의 규정에 의하거나, 수사 목적으로 법령에 정해진 절차와
                방법에 따라 수사기관의 요구가 있는 경우
              </li>
            </ul>
          </motion.section>

          {/* 5. 개인정보 처리의 위탁 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              5. 개인정보 처리의 위탁
            </h2>
            <p className="mt-2">
              회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보
              처리업무를 위탁하고 있습니다.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse border border-[#e2ddd6] text-sm">
                <thead>
                  <tr className="bg-[#f0ede8]">
                    <th className="border border-[#e2ddd6] px-3 py-2 text-left font-medium">수탁업체</th>
                    <th className="border border-[#e2ddd6] px-3 py-2 text-left font-medium">위탁 업무</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-[#e2ddd6] px-3 py-2">Railway Corporation</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">백엔드 서버 호스팅 및 운영</td>
                  </tr>
                  <tr className="bg-[#faf9f7]">
                    <td className="border border-[#e2ddd6] px-3 py-2">Supabase Inc.</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">데이터베이스 호스팅 및 관리</td>
                  </tr>
                  <tr>
                    <td className="border border-[#e2ddd6] px-3 py-2">Amazon Web Services, Inc.</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">데이터 저장 및 클라우드 인프라</td>
                  </tr>
                  <tr className="bg-[#faf9f7]">
                    <td className="border border-[#e2ddd6] px-3 py-2">Vercel Inc.</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">프론트엔드 웹사이트 호스팅</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2">
              회사는 위탁 계약 시 「개인정보 보호법」 제26조에 따라
              위탁업무 수행목적 외 개인정보 처리 금지, 기술적·관리적 보호조치,
              재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한
              사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게
              처리하는지를 감독합니다.
            </p>
          </motion.section>

          {/* 6. 개인정보의 국외 이전 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              6. 개인정보의 국외 이전
            </h2>
            <p className="mt-2">
              회사는 서비스 제공을 위하여 다음과 같이 개인정보를 국외로
              이전하고 있습니다.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse border border-[#e2ddd6] text-sm">
                <thead>
                  <tr className="bg-[#f0ede8]">
                    <th className="border border-[#e2ddd6] px-3 py-2 text-left font-medium">이전받는 자</th>
                    <th className="border border-[#e2ddd6] px-3 py-2 text-left font-medium">이전되는 국가</th>
                    <th className="border border-[#e2ddd6] px-3 py-2 text-left font-medium">이전 목적</th>
                    <th className="border border-[#e2ddd6] px-3 py-2 text-left font-medium">이전 항목</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-[#e2ddd6] px-3 py-2">Amazon Web Services, Inc.</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">미국</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">데이터 저장 및 클라우드 인프라</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">서비스 이용 과정에서 수집되는 모든 개인정보</td>
                  </tr>
                  <tr className="bg-[#faf9f7]">
                    <td className="border border-[#e2ddd6] px-3 py-2">Supabase Inc.</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">미국</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">데이터베이스 호스팅</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">회원정보, 서비스 이용기록</td>
                  </tr>
                  <tr>
                    <td className="border border-[#e2ddd6] px-3 py-2">Vercel Inc.</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">미국</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">웹사이트 호스팅</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">접속 로그, 쿠키 정보</td>
                  </tr>
                  <tr className="bg-[#faf9f7]">
                    <td className="border border-[#e2ddd6] px-3 py-2">Railway Corporation</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">미국</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">서버 호스팅 및 운영</td>
                    <td className="border border-[#e2ddd6] px-3 py-2">서비스 이용 과정에서 수집되는 모든 개인정보</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2">
              개인정보는 서비스 제공 기간 동안 보유·이용되며, 보유 기간 경과
              또는 처리 목적 달성 후 지체 없이 파기됩니다.
            </p>
          </motion.section>

          {/* 7. 개인정보의 파기 절차 및 방법 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              7. 개인정보의 파기 절차 및 방법
            </h2>
            <p className="mt-2">
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가
              불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                <strong>파기 절차:</strong> 이용자가 입력한 정보는 목적 달성
                후 별도의 DB에 옮겨져(종이의 경우 별도의 서류) 내부 방침 및
                기타 관련 법령에 따라 일정 기간 저장된 후 또는 즉시
                파기됩니다.
              </li>
              <li>
                <strong>전자적 파일 형태:</strong> 기록을 재생할 수 없도록
                안전하게 삭제
              </li>
              <li>
                <strong>종이 문서:</strong> 분쇄기로 분쇄하거나 소각
              </li>
            </ul>
          </motion.section>

          {/* 8. 정보주체의 권리·의무 및 행사 방법 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              8. 정보주체의 권리·의무 및 행사 방법
            </h2>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>
                정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호
                관련 권리를 행사할 수 있습니다.
                <ul className="mt-1 ml-4 list-inside list-disc space-y-1">
                  <li>개인정보 열람 요구</li>
                  <li>오류 등이 있을 경우 정정 요구</li>
                  <li>삭제 요구</li>
                  <li>처리 정지 요구</li>
                </ul>
              </li>
              <li>
                권리 행사는 서비스 내 마이페이지에서 직접 처리하거나,
                고객센터 또는 이메일(privacy@clearly.co.kr)을 통해 요청할 수
                있으며, 회사는 이에 대해 지체 없이 조치하겠습니다.
              </li>
              <li>
                정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한
                경우에는, 정정 또는 삭제를 완료할 때까지 당해 개인정보를
                이용하거나 제공하지 않습니다.
              </li>
              <li>
                정보주체의 권리 행사는 법정대리인이나 위임을 받은 자 등
                대리인을 통하여 할 수 있습니다. 이 경우 「개인정보 보호법」
                시행규칙 별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.
              </li>
            </ol>
          </motion.section>

          {/* 9. 만 14세 미만 아동의 개인정보 보호 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              9. 만 14세 미만 아동의 개인정보 보호
            </h2>
            <p className="mt-2">
              회사는 만 14세 미만 아동의 회원가입을 받지 않습니다. 따라서
              만 14세 미만 아동의 개인정보를 수집하지 않습니다. 만약 만 14세
              미만 아동의 개인정보가 수집된 사실을 알게 되는 경우, 회사는
              해당 개인정보를 지체 없이 파기하겠습니다.
            </p>
          </motion.section>

          {/* 10. 쿠키의 설치·운영 및 거부 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              10. 쿠키의 설치·운영 및 거부
            </h2>
            <ol className="mt-2 list-inside list-decimal space-y-2">
              <li>
                회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해
                쿠키(cookie)를 사용합니다. 쿠키는 웹사이트를 운영하는 데
                이용되는 서버가 이용자의 브라우저에게 보내는 소량의 정보이며,
                이용자의 기기에 저장됩니다.
              </li>
              <li>
                <strong>쿠키 사용 목적:</strong> 이용자의 로그인 상태 유지,
                서비스 이용 패턴 분석, 방문 빈도 확인, 맞춤형 서비스 제공
              </li>
              <li>
                <strong>쿠키 거부 방법:</strong> 이용자는 웹 브라우저의 옵션
                설정을 통해 모든 쿠키를 허용하거나 쿠키가 저장될 때마다
                확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.
                다만, 쿠키 저장을 거부할 경우 로그인이 필요한 일부 서비스
                이용에 어려움이 있을 수 있습니다.
              </li>
            </ol>
          </motion.section>

          {/* 11. 마케팅 및 광고 활용 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              11. 마케팅 및 광고 활용
            </h2>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>
                회사는 이용자의 별도 동의를 받은 경우에 한하여 이메일, SMS
                등을 통해 서비스 관련 정보, 이벤트, 프로모션 등 광고성
                정보를 전송할 수 있습니다.
              </li>
              <li>
                이용자는 마케팅 정보 수신에 동의한 후에도 언제든지 수신을
                거부할 수 있으며, 수신 거부 방법은 마이페이지 설정 또는
                수신된 메시지 내 안내에 따릅니다.
              </li>
              <li>
                회사는 광고성 정보를 전송하는 경우 「정보통신망 이용촉진 및
                정보보호 등에 관한 법률」에 따라 제목란 및 본문에 광고성
                정보임을 표시하고, 수신 거부 방법을 안내합니다.
              </li>
            </ol>
          </motion.section>

          {/* 12. 개인정보의 안전성 확보 조치 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              12. 개인정보의 안전성 확보 조치
            </h2>
            <p className="mt-2">
              회사는 「개인정보 보호법」 제29조에 따라 다음과 같이 안전성
              확보에 필요한 기술적·관리적·물리적 조치를 하고 있습니다.
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                <strong>개인정보의 암호화:</strong> 비밀번호 등 중요 정보는
                암호화하여 저장·관리하며, 개인정보의 전송 시에는 SSL/TLS
                등 암호화 통신을 사용합니다.
              </li>
              <li>
                <strong>접근 권한 관리:</strong> 개인정보에 대한 접근 권한을
                업무 수행에 필요한 최소한의 인원으로 제한합니다.
              </li>
              <li>
                <strong>보안 프로그램 설치·운영:</strong> 해킹이나 악성코드
                등에 대비한 보안 프로그램을 설치·운영합니다.
              </li>
              <li>
                <strong>접근 기록 보관:</strong> 개인정보 처리시스템에 대한
                접근 기록을 최소 1년 이상 보관·관리합니다.
              </li>
              <li>
                <strong>개인정보 취급 직원 교육:</strong> 개인정보를 취급하는
                직원을 대상으로 정기적인 보안 교육을 실시합니다.
              </li>
            </ul>
          </motion.section>

          {/* 13. 개인정보 보호책임자 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              13. 개인정보 보호책임자
            </h2>
            <p className="mt-2">
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보
              처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와
              같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="mt-3 rounded-lg border border-[#e2ddd6] bg-[#f0ede8] p-4">
              <p className="font-medium text-[#1a1918]">개인정보 보호책임자</p>
              <ul className="mt-2 space-y-1 text-[#72706a]">
                <li>성명: [추후 기재]</li>
                <li>직위: [추후 기재]</li>
                <li>담당부서: 개인정보보호팀</li>
                <li>이메일: privacy@clearly.co.kr</li>
                <li>연락처: [추후 기재]</li>
              </ul>
            </div>
          </motion.section>

          {/* 14. 권익침해 구제방법 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              14. 권익침해 구제방법
            </h2>
            <p className="mt-2">
              정보주체는 개인정보침해로 인한 구제를 받기 위하여 아래의 기관에
              분쟁해결이나 상담 등을 신청할 수 있습니다.
            </p>
            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-[#e2ddd6] bg-[#f0ede8] p-4 space-y-1 text-sm">
                <p className="font-medium text-[#1a1918]">개인정보분쟁조정위원회</p>
                <p className="text-[#72706a]">소관 업무: 개인정보 분쟁조정 신청, 집단분쟁조정</p>
                <p className="text-[#72706a]">홈페이지: www.kopico.go.kr</p>
                <p className="text-[#72706a]">전화: 1833-6972</p>
              </div>
              <div className="rounded-lg border border-[#e2ddd6] bg-[#f0ede8] p-4 space-y-1 text-sm">
                <p className="font-medium text-[#1a1918]">개인정보침해신고센터 (한국인터넷진흥원)</p>
                <p className="text-[#72706a]">소관 업무: 개인정보 침해 사실 신고, 상담 신청</p>
                <p className="text-[#72706a]">홈페이지: privacy.kisa.or.kr</p>
                <p className="text-[#72706a]">전화: (국번없이) 118</p>
              </div>
              <div className="rounded-lg border border-[#e2ddd6] bg-[#f0ede8] p-4 space-y-1 text-sm">
                <p className="font-medium text-[#1a1918]">대검찰청 사이버수사과</p>
                <p className="text-[#72706a]">홈페이지: www.spo.go.kr</p>
                <p className="text-[#72706a]">전화: (국번없이) 1301</p>
              </div>
              <div className="rounded-lg border border-[#e2ddd6] bg-[#f0ede8] p-4 space-y-1 text-sm">
                <p className="font-medium text-[#1a1918]">경찰청 사이버수사국</p>
                <p className="text-[#72706a]">홈페이지: ecrm.cyber.go.kr</p>
                <p className="text-[#72706a]">전화: (국번없이) 182</p>
              </div>
            </div>
          </motion.section>

          {/* 15. 개인정보 처리방침의 변경 */}
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold text-[#141412]">
              15. 개인정보 처리방침의 변경
            </h2>
            <p className="mt-2">
              이 개인정보처리방침은 2026년 2월 21일부터 적용됩니다.
              개인정보처리방침 내용의 추가, 삭제 및 수정이 있을 경우에는
              변경사항의 시행 7일 전부터 서비스 내 공지사항을 통하여
              고지할 것입니다. 다만, 개인정보의 수집·이용 목적, 제3자 제공
              등 중요한 변경사항이 있을 경우에는 최소 30일 전에 고지합니다.
            </p>
          </motion.section>
        </motion.div>
      </motion.div>
    </div>
  );
}
