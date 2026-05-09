import Link from "next/link";

export const metadata = {
  title: "캠페인 신청 가이드 - 여긴",
  description: "체험단 신청부터 리뷰 작성까지 전체 절차와 주의사항",
};

const STEPS = [
  {
    n: "1",
    icon: "🔍",
    title: "캠페인 찾기",
    body: "전체 캠페인 / 내 주변 / 후기 / 매거진에서 마음에 드는 캠페인을 둘러보세요. 매칭 점수가 높은 캠페인일수록 선정 확률이 올라갑니다.",
    extras: [
      { label: "지역 빠른선택", href: "/campaigns" },
      { label: "내 주변", href: "/campaigns?nearby=1" },
    ],
  },
  {
    n: "2",
    icon: "📝",
    title: "신청하기",
    body: "캠페인 상세 페이지에서 활동할 SNS 채널 URL과 한 줄 자기소개를 작성하면 신청 완료. 자기소개에 매장에 대한 관심·강점을 구체적으로 적으면 선정 확률이 올라갑니다.",
  },
  {
    n: "3",
    icon: "✨",
    title: "선정 발표",
    body: "광고주가 신청자 중 선정자를 발표하면 알림함과 마이페이지에 표시됩니다. 빠른선정 캠페인은 24시간 내 결과가 나와요.",
  },
  {
    n: "4",
    icon: "🍽️",
    title: "체험 진행",
    body: "방문형은 광고주와 일정 조율 후 매장 방문, 배송형은 등록 주소로 제품을 받습니다. 가이드의 미션(사진 매수·글자 수·키워드)을 꼭 확인하세요.",
  },
  {
    n: "5",
    icon: "📸",
    title: "리뷰 작성 + 등록",
    body: "리뷰 마감일 안에 콘텐츠를 작성하고 마이페이지에서 리뷰 URL을 등록합니다. 본문 발췌를 함께 입력하면 키워드 자동 검수가 동작합니다.",
  },
  {
    n: "6",
    icon: "💰",
    title: "검수 + 포인트 적립",
    body: "광고주 검수가 끝나면 1,000P 적립과 함께 신뢰등급이 올라갑니다. 미작성·가이드 미준수 시 패널티(-300~1,000P)가 부과됩니다.",
  },
];

export default function ApplyGuidePage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">📘 캠페인 신청 가이드</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          처음이신가요? 6단계로 정리한 체험단 신청 절차를 확인하세요.
        </p>
      </div>

      <div className="space-y-3">
        {STEPS.map((s) => (
          <div key={s.n} className="card flex gap-4 p-5">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-2xl dark:bg-brand-900/30">
                {s.icon}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">
                  STEP {s.n}
                </span>
                <h2 className="text-base font-bold">{s.title}</h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-ink-200">
                {s.body}
              </p>
              {s.extras && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.extras.map((e) => (
                    <Link
                      key={e.href}
                      href={e.href}
                      className="badge bg-ink-100 px-2.5 py-1 text-ink-700 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-200"
                    >
                      {e.label} →
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <section className="card border-amber-200 bg-amber-50 p-5 dark:border-amber-700 dark:bg-amber-900/20">
        <h2 className="text-base font-bold text-amber-800 dark:text-amber-300">
          ⚠️ 꼭 알아두세요
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm text-ink-700 dark:text-ink-200">
          <li>• 선정 후 정당한 사유 없이 취소하면 -500P가 차감됩니다.</li>
          <li>• 리뷰 마감일을 지키지 못하면 -1,000P + 신뢰등급 강등.</li>
          <li>• 가이드의 필수 키워드가 누락되면 광고주 검수에서 반려될 수 있어요.</li>
          <li>• 협찬 표기(공정위 문구)는 게시물 최상단에 명시해야 합니다.</li>
          <li>• 작성한 콘텐츠는 6개월간 유지하며, 광고주가 홍보 자료로 활용할 수 있습니다.</li>
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="text-base font-bold">💡 선정 확률 올리는 꿀팁</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-ink-700 dark:text-ink-200">
          <li>① <b>SNS 채널 인증</b> — 인증 시 매칭 점수 +13점, 광고주 신뢰도 ↑</li>
          <li>② <b>활동지역 등록</b> — 방문형 캠페인 매칭 점수 +25점</li>
          <li>③ <b>관심 카테고리 누적</b> — 같은 카테고리 신청 이력 = 우선 노출</li>
          <li>④ <b>구체적 자기소개</b> — "잘 부탁드립니다" 보다는 매장 특징 언급</li>
          <li>⑤ <b>꾸준한 활동</b> — 출석체크·후기 누적으로 신뢰등급 자연 상승</li>
        </ul>
      </section>

      <div className="card flex flex-wrap items-center justify-between gap-3 bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white">
        <div>
          <div className="text-base font-bold">바로 시작해볼까요?</div>
          <div className="text-xs opacity-90">매일 새 캠페인이 열립니다</div>
        </div>
        <div className="flex gap-2">
          <Link href="/campaigns" className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-brand-600">
            캠페인 둘러보기
          </Link>
          <Link href="/faq" className="rounded-lg border border-white/40 px-4 py-2 text-sm font-bold text-white">
            FAQ 보기
          </Link>
        </div>
      </div>
    </article>
  );
}
