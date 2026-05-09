import Link from "next/link";

export const metadata = {
  title: "신뢰등급 안내 - 여긴",
  description: "Bronze부터 Diamond까지 — 여긴 신뢰등급이 캠페인 선정에 어떻게 도움이 되는지",
};

const GRADES = [
  {
    name: "Bronze",
    icon: "🥉",
    color: "from-amber-700 to-amber-900",
    threshold: "승인 리뷰 0건",
    bonus: "+0점",
    desc: "가입 직후 기본 등급",
  },
  {
    name: "Silver",
    icon: "🥈",
    color: "from-ink-300 to-ink-500",
    threshold: "승인 리뷰 1건+",
    bonus: "+5점",
    desc: "첫 리뷰가 승인되면 자동 승급",
  },
  {
    name: "Gold",
    icon: "🥇",
    color: "from-yellow-400 to-amber-600",
    threshold: "승인 리뷰 5건+",
    bonus: "+10점",
    desc: "꾸준히 활동하는 검증된 인플루언서",
  },
  {
    name: "Platinum",
    icon: "💎",
    color: "from-cyan-400 to-blue-600",
    threshold: "승인 리뷰 15건+",
    bonus: "+15점",
    desc: "고품질 콘텐츠 작성자, 우선 선정 후보",
  },
  {
    name: "Diamond",
    icon: "👑",
    color: "from-pink-500 to-purple-600",
    threshold: "승인 리뷰 30건+",
    bonus: "+20점",
    desc: "최상위 등급 — 프리미엄 캠페인 우선권",
  },
];

export default function TrustGradePage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">🏆 신뢰등급 안내</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          여긴은 단순 팔로워 수가 아닌 <b className="text-ink-900 dark:text-ink-100">실제 활동과 후기 품질</b>로 인플루언서를 평가합니다.
        </p>
      </div>

      <section className="space-y-3">
        {GRADES.map((g) => (
          <div
            key={g.name}
            className={`card overflow-hidden bg-gradient-to-r ${g.color}`}
          >
            <div className="flex items-center gap-4 p-5 text-white">
              <div className="text-5xl">{g.icon}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black">{g.name}</h2>
                  <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-bold">
                    매칭 {g.bonus}
                  </span>
                </div>
                <div className="mt-1 text-sm opacity-95">{g.desc}</div>
                <div className="mt-1 text-[11px] opacity-80">조건: {g.threshold}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="card p-5">
        <h2 className="text-base font-bold">⚠️ 등급 강등</h2>
        <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
          패널티 1건당 한 단계 강등됩니다. 최저 등급은 Bronze이며, 패널티는 마이페이지에서 확인할 수 있습니다.
        </p>
        <ul className="mt-3 space-y-1 text-sm text-ink-700 dark:text-ink-300">
          <li>• 선정 후 부당 취소 → -500P</li>
          <li>• 리뷰 미작성 → -1,000P</li>
          <li>• 가이드 미준수 → -300P</li>
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="text-base font-bold">💎 등급이 주는 혜택</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-700 dark:text-ink-300">
          <li>1. <b>매칭 점수 보너스</b>: 광고주가 보는 매칭 점수에 자동 가산</li>
          <li>2. <b>선정 우선권</b>: Platinum/Diamond는 같은 조건일 때 우선 선정</li>
          <li>3. <b>프리미엄 캠페인 노출</b>: Diamond 전용 비공개 캠페인 (개발 예정)</li>
          <li>4. <b>포인트 보너스</b>: 리뷰 승인 시 등급별 추가 적립 (개발 예정)</li>
        </ul>
      </section>

      <div className="card p-5 text-sm text-ink-600 dark:text-ink-300">
        💡 등급을 빠르게 올리고 싶다면{" "}
        <Link href="/mypage/shop" className="font-bold text-brand-600">
          포인트샵의 즉시 승급권
        </Link>
        도 확인해보세요.
      </div>
    </article>
  );
}
