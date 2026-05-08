export const metadata = { title: "개인정보처리방침 - 여긴" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold">개인정보처리방침</h1>
      <p className="text-xs text-ink-500">시행일: 2026년 5월 1일</p>

      <Section title="1. 수집하는 개인정보 항목">
        <ul className="list-disc space-y-1 pl-5">
          <li>필수: 이메일, 비밀번호(해시), 닉네임</li>
          <li>선택: 연락처, 활동지역, 블로그/인스타/유튜브/틱톡 URL 및 수치, 인증샷 이미지</li>
          <li>광고주: 상호명, 사업자번호, 담당자명, 연락처</li>
          <li>자동수집: 접속 IP, 쿠키, 세션 토큰, 서비스 이용 로그</li>
        </ul>
      </Section>

      <Section title="2. 수집·이용 목적">
        <ul className="list-disc space-y-1 pl-5">
          <li>회원 식별, 본인 확인 및 부정 이용 방지</li>
          <li>캠페인 신청·선정·리뷰 검수 등 서비스 제공</li>
          <li>알림 발송 및 고객 문의 응대</li>
          <li>통계 분석을 통한 서비스 개선 (개인 식별 불가 형태)</li>
        </ul>
      </Section>

      <Section title="3. 보유 및 이용 기간">
        회원 탈퇴 시 즉시 파기합니다. 단, 관계 법령(전자상거래법 등)에 따라 일정 기간 보관이
        필요한 경우 해당 기간 동안 보관합니다.
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
          <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
          <li>소비자 불만 또는 분쟁처리에 관한 기록: 3년</li>
        </ul>
      </Section>

      <Section title="4. 제3자 제공">
        회원이 캠페인을 신청한 경우, 해당 광고주에게 신청 정보(닉네임, 채널 URL, 자기소개)가
        제공됩니다. 그 외에는 회원의 동의 없이 제3자에게 제공하지 않습니다.
      </Section>

      <Section title="5. 처리 위탁">
        서비스 제공을 위해 다음 업체에 일부 처리를 위탁할 수 있으며, 위탁 사실을 사전에
        고지합니다: 클라우드 호스팅(Vercel, Neon 등), 결제 대행(향후 추가).
      </Section>

      <Section title="6. 이용자의 권리">
        회원은 언제든지 본인의 개인정보 열람·수정·삭제·처리정지를 요청할 수 있으며,
        마이페이지에서 직접 처리하거나 고객센터를 통해 문의할 수 있습니다.
      </Section>

      <Section title="7. 안전성 확보 조치">
        비밀번호는 단방향 해시(bcrypt)로 저장되며, 세션은 서명된 JWT로 관리됩니다. 모든
        통신은 HTTPS로 암호화됩니다.
      </Section>

      <Section title="8. 개인정보 보호책임자">
        성명: (운영자 이름) / 이메일: privacy@yeogin.kr
      </Section>

      <p className="rounded-lg bg-ink-50 p-4 text-xs text-ink-600">
        ※ 본 방침은 데모용 샘플입니다. 실제 운영 전 개인정보보호위원회 가이드 및 법무 검토를
        반드시 거쳐주세요.
      </p>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-bold">{title}</h2>
      <div className="text-sm leading-relaxed text-ink-700">{children}</div>
    </section>
  );
}
