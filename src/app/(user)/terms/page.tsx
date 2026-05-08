export const metadata = { title: "이용약관 - 여긴" };

export default function TermsPage() {
  return (
    <article className="prose-custom mx-auto max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold">이용약관</h1>
      <p className="text-xs text-ink-500">시행일: 2026년 5월 1일</p>

      <Section n="제1조" title="목적">
        본 약관은 여긴(이하 "회사")이 제공하는 체험단 중개 플랫폼(이하 "서비스")의
        이용 조건 및 절차, 회원과 회사의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
      </Section>

      <Section n="제2조" title="용어 정의">
        <ol className="list-decimal space-y-1 pl-5">
          <li>"회원"이란 본 약관에 동의하고 서비스에 가입한 자(체험단 신청자, 광고주)를 말합니다.</li>
          <li>"캠페인"이란 광고주가 등록한 체험단 모집 게시물을 말합니다.</li>
          <li>"리뷰"란 회원이 캠페인 참여 후 작성한 후기 콘텐츠를 말합니다.</li>
          <li>"포인트"란 서비스 내에서 적립·차감되는 가상의 보상 단위로, 현금성 가치가 없습니다.</li>
        </ol>
      </Section>

      <Section n="제3조" title="회원 가입">
        본인 명의의 정확한 정보로 가입해야 하며, 타인 명의 도용 시 즉시 이용이 제한될 수 있습니다.
        만 14세 미만은 가입할 수 없습니다.
      </Section>

      <Section n="제4조" title="캠페인 신청 및 선정">
        <ol className="list-decimal space-y-1 pl-5">
          <li>회원은 캠페인 페이지에 명시된 모집 조건에 따라 신청합니다.</li>
          <li>선정 여부는 광고주의 판단에 따르며, 선정 후 정당한 사유 없는 취소 시 패널티가 부과됩니다.</li>
          <li>선정된 회원은 발표일 이후 가이드를 확인하고, 리뷰 작성 기간 내 콘텐츠를 게시해야 합니다.</li>
        </ol>
      </Section>

      <Section n="제5조" title="리뷰 작성 의무">
        선정된 회원은 캠페인 가이드(필수 키워드, 분량, 사진 매수 등)를 준수하여 솔직한 리뷰를
        작성해야 합니다. 정당한 사유 없이 리뷰를 게시하지 않거나 가이드를 미준수할 경우
        포인트 차감, 신뢰등급 강등, 서비스 이용 제한이 가해질 수 있습니다.
      </Section>

      <Section n="제6조" title="금지 행위">
        <ul className="list-disc space-y-1 pl-5">
          <li>허위 정보 등록, 타인 명의 도용</li>
          <li>리뷰 매크로·AI 생성 콘텐츠 무단 사용</li>
          <li>제공받은 상품의 환금 또는 양도</li>
          <li>광고주에 대한 부당한 금전 요구</li>
        </ul>
      </Section>

      <Section n="제7조" title="회사의 면책">
        회사는 회원과 광고주 간에 발생한 분쟁에 대해 중재 노력을 다하나, 직접 당사자가 아닌
        한도에서 책임을 부담하지 않습니다.
      </Section>

      <Section n="제8조" title="약관 변경">
        본 약관은 관련 법령 또는 정책 변경 시 개정될 수 있으며, 시행 7일 전 사이트에 공지합니다.
      </Section>

      <p className="rounded-lg bg-ink-50 p-4 text-xs text-ink-600">
        ※ 본 약관은 데모용 샘플입니다. 실제 운영 전 법무 검토를 받으시기 바랍니다.
      </p>
    </article>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-bold">
        {n} ({title})
      </h2>
      <div className="text-sm leading-relaxed text-ink-700">{children}</div>
    </section>
  );
}
