export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900">이용약관</h1>
      <p className="mt-2 text-sm text-gray-500">최종 수정일: 2025년 1월 1일</p>

      <div className="mt-8 space-y-8 text-[14px] leading-relaxed text-gray-700">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">제1조 (목적)</h2>
          <p className="mt-2">
            본 약관은 Clearly(이하 &quot;회사&quot;)가 제공하는 이사청소 업체 매칭
            서비스(이하 &quot;서비스&quot;)의 이용과 관련하여 회사와 이용자 간의
            권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            제2조 (정의)
          </h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>
              &quot;서비스&quot;란 회사가 운영하는 웹사이트 및 모바일
              애플리케이션을 통해 제공하는 이사청소 업체 매칭 서비스를 말합니다.
            </li>
            <li>
              &quot;이용자&quot;란 본 약관에 따라 회사가 제공하는 서비스를
              이용하는 회원 및 비회원을 말합니다.
            </li>
            <li>
              &quot;회원&quot;이란 회사에 개인정보를 제공하여 회원 등록을 한 자로서,
              회사의 서비스를 지속적으로 이용할 수 있는 자를 말합니다.
            </li>
            <li>
              &quot;업체&quot;란 서비스를 통해 이사청소 서비스를 제공하는
              사업자를 말합니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            제3조 (약관의 효력 및 변경)
          </h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>
              본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게
              공지함으로써 효력이 발생합니다.
            </li>
            <li>
              회사는 관련 법령에 위배되지 않는 범위에서 본 약관을 변경할 수
              있으며, 변경된 약관은 적용일자 및 변경사유를 명시하여 현행 약관과
              함께 서비스 내에 그 적용일자 7일 전부터 공지합니다.
            </li>
            <li>
              이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고
              탈퇴할 수 있습니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            제4조 (서비스의 제공)
          </h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>
              회사는 이사청소 업체 매칭, 견적 요청 및 비교, 업체 리뷰 확인,
              채팅을 통한 소통 등의 서비스를 제공합니다.
            </li>
            <li>
              회사는 서비스의 품질 향상을 위해 서비스의 내용을 변경할 수
              있으며, 변경 시 사전에 공지합니다.
            </li>
            <li>
              회사는 이사청소 업체와 이용자 간의 매칭을 중개할 뿐, 실제
              청소 서비스의 제공 주체가 아닙니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            제5조 (회원가입)
          </h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>
              이용자는 회사가 정한 양식에 따라 회원정보를 기입한 후 본 약관에
              동의한다는 의사표시를 함으로써 회원가입을 신청합니다.
            </li>
            <li>
              회사는 회원가입 신청자가 다음 각 호에 해당하지 않는 한
              회원으로 등록합니다.
            </li>
            <li>
              허위 정보를 기재한 경우, 타인의 명의를 사용한 경우,
              기타 회사가 정한 기준에 부합하지 않는 경우 가입이 제한될 수
              있습니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            제6조 (이용자의 의무)
          </h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>
              이용자는 서비스 이용 시 관련 법령 및 본 약관의 규정을
              준수하여야 합니다.
            </li>
            <li>
              이용자는 타인의 개인정보를 침해하거나 서비스의 정상적인 운영을
              방해하는 행위를 하여서는 안 됩니다.
            </li>
            <li>
              이용자는 허위 리뷰 작성, 부정한 방법으로의 서비스 이용 등
              서비스의 신뢰성을 저해하는 행위를 하여서는 안 됩니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            제7조 (서비스 이용 제한)
          </h2>
          <p className="mt-2">
            회사는 이용자가 본 약관을 위반하거나 서비스의 정상적인 운영을
            방해한 경우, 서비스 이용을 제한하거나 계정을 정지할 수 있습니다.
            이 경우 회사는 이용자에게 사전 통지하며, 긴급한 경우에는 사후
            통지할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            제8조 (면책조항)
          </h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>
              회사는 이사청소 업체와 이용자 간의 거래에 대해 직접적인
              책임을 지지 않습니다.
            </li>
            <li>
              회사는 천재지변, 시스템 장애 등 불가항력적인 사유로 인한
              서비스 중단에 대해 책임을 지지 않습니다.
            </li>
            <li>
              이용자가 서비스를 통해 제공받은 정보의 정확성, 완전성에 대해
              회사는 보증하지 않습니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">
            제9조 (분쟁 해결)
          </h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>
              본 약관과 관련하여 분쟁이 발생한 경우 회사와 이용자는 상호
              협의하여 해결하도록 합니다.
            </li>
            <li>
              협의가 이루어지지 않는 경우 관할 법원은 회사의 소재지를
              관할하는 법원으로 합니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">부칙</h2>
          <p className="mt-2">본 약관은 2025년 1월 1일부터 시행합니다.</p>
        </section>
      </div>
    </div>
  );
}
