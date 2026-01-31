export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900">개인정보처리방침</h1>
      <p className="mt-2 text-sm text-gray-500">최종 수정일: 2025년 1월 1일</p>

      <div className="mt-8 space-y-8 text-[14px] leading-relaxed text-gray-700">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            1. 개인정보의 처리 목적
          </h2>
          <p className="mt-2">
            Clearly(이하 &quot;회사&quot;)는 다음의 목적을 위하여 개인정보를
            처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는
            이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를
            받는 등 필요한 조치를 이행할 예정입니다.
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>회원 가입 및 관리: 회원 가입, 본인 확인, 서비스 부정이용 방지</li>
            <li>
              서비스 제공: 이사청소 업체 매칭, 견적 요청 및 비교, 채팅 서비스
              제공
            </li>
            <li>고객 문의 처리: 문의 접수 및 답변, 불만 처리</li>
            <li>서비스 개선: 서비스 이용 통계 분석, 서비스 품질 향상</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            2. 수집하는 개인정보의 항목
          </h2>
          <div className="mt-2 space-y-3">
            <div>
              <h3 className="font-medium text-gray-800">
                필수 수집 항목
              </h3>
              <ul className="mt-1 list-inside list-disc space-y-1">
                <li>회원가입: 이메일, 비밀번호, 이름, 휴대전화번호</li>
                <li>업체 등록: 상호명, 사업자등록번호, 대표자명, 사업장 주소</li>
                <li>문의하기: 이름, 이메일, 문의 내용</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">
                선택 수집 항목
              </h3>
              <ul className="mt-1 list-inside list-disc space-y-1">
                <li>프로필 이미지, 상세 주소, 서비스 지역</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">
                자동 수집 항목
              </h3>
              <ul className="mt-1 list-inside list-disc space-y-1">
                <li>
                  서비스 이용 기록, 접속 로그, 접속 IP 정보, 브라우저 종류
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            3. 개인정보의 보유 및 이용 기간
          </h2>
          <p className="mt-2">
            회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터
            개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서
            개인정보를 처리·보유합니다.
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>회원 정보: 회원 탈퇴 시까지</li>
            <li>
              계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래 등에서의
              소비자보호에 관한 법률)
            </li>
            <li>
              소비자의 불만 또는 분쟁처리에 관한 기록: 3년
              (전자상거래 등에서의 소비자보호에 관한 법률)
            </li>
            <li>
              웹사이트 방문 기록: 3개월 (통신비밀보호법)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            4. 개인정보의 제3자 제공
          </h2>
          <p className="mt-2">
            회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
            다만, 아래의 경우에는 예외로 합니다.
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>이용자가 사전에 동의한 경우</li>
            <li>
              매칭 서비스 제공을 위해 이사청소 업체에 필요 최소한의 정보
              (이름, 연락처, 주소)를 제공하는 경우
            </li>
            <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            5. 개인정보의 파기 절차 및 방법
          </h2>
          <p className="mt-2">
            회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가
            불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              전자적 파일 형태: 기록을 재생할 수 없도록 안전하게 삭제
            </li>
            <li>종이 문서: 분쇄기로 분쇄하거나 소각</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            6. 정보주체의 권리·의무 및 행사 방법
          </h2>
          <p className="mt-2">
            이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나
            수정할 수 있으며, 가입 해지를 요청할 수도 있습니다.
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>개인정보 조회/수정: 마이페이지에서 직접 수정</li>
            <li>회원 탈퇴: 마이페이지에서 탈퇴 요청</li>
            <li>
              개인정보 열람/삭제 요청: 고객센터 또는 문의하기를 통해 요청
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            7. 개인정보의 안전성 확보 조치
          </h2>
          <p className="mt-2">
            회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고
            있습니다.
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>개인정보의 암호화: 비밀번호 등 중요 정보는 암호화하여 저장</li>
            <li>접근 통제: 개인정보 접근 권한을 최소한의 인원으로 제한</li>
            <li>보안 프로그램 설치: 해킹 등에 대비한 보안 프로그램 운영</li>
            <li>개인정보 접근 기록 보관: 접근 기록을 최소 1년 이상 보관</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            8. 개인정보 보호책임자
          </h2>
          <p className="mt-2">
            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보
            처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와
            같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="font-medium text-gray-800">개인정보 보호책임자</p>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>담당부서: 개인정보보호팀</li>
              <li>이메일: privacy@clearly.co.kr</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            9. 개인정보 처리방침의 변경
          </h2>
          <p className="mt-2">
            이 개인정보처리방침은 2025년 1월 1일부터 적용됩니다.
            개인정보처리방침이 변경되는 경우 변경사항은 서비스 내 공지사항을
            통해 고지합니다.
          </p>
        </section>
      </div>
    </div>
  );
}
