import Link from "next/link";

export const metadata = { title: "성공 사례 - 여긴 비즈센터" };

const CASES = [
  {
    company: "강남 파스타 신상점",
    category: "맛집 / 방문형",
    headline: "오픈 한 달, 네이버 1페이지 점령 + 매출 3배",
    metrics: [
      { label: "캠페인 진행", value: "8건" },
      { label: "확보 리뷰", value: "53건" },
      { label: "매출 변화", value: "+312%" },
    ],
    quote: "리뷰 한 건당 검색 노출이 누적되니까, 광고비 대비 효율이 훨씬 좋아요. 이제 단골 손님까지 생겼습니다.",
    person: "김OO 점장",
    cover: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=900&q=80",
  },
  {
    company: "달콤한 디저트 카페",
    category: "카페 / 인스타",
    headline: "릴스 12개 누적 도달 28만, 신규 손님 2.4배",
    metrics: [
      { label: "캠페인 진행", value: "5건" },
      { label: "릴스 노출", value: "284K" },
      { label: "신규 방문", value: "+143%" },
    ],
    quote: "특히 인플루언서들이 '핫플' 코드와 함께 올려주니까 인스타 알고리즘이 자연스럽게 밀어주더라구요.",
    person: "이OO 대표",
    cover: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=900&q=80",
  },
  {
    company: "글로우뷰티 비건 라인",
    category: "뷰티 / 배송형",
    headline: "신제품 출시 3주 만에 누적 후기 200+",
    metrics: [
      { label: "캠페인 진행", value: "3건" },
      { label: "확보 리뷰", value: "215건" },
      { label: "재구매율", value: "31%" },
    ],
    quote: "초기 신뢰 자산을 쌓는 데 체험단만 한 게 없었어요. 인증된 사용자들의 후기가 광고보다 훨씬 강력합니다.",
    person: "박OO 마케팅팀",
    cover: "https://images.unsplash.com/photo-1522335789203-aaa2f6f0e0fb?w=900&q=80",
  },
  {
    company: "프리미엄 견과 브랜드",
    category: "식품 / 배송형",
    headline: "포인트 30만으로 후기 100건 + 검색량 2배",
    metrics: [
      { label: "투입 포인트", value: "300,000P" },
      { label: "확보 리뷰", value: "112건" },
      { label: "브랜드 검색량", value: "+108%" },
    ],
    quote: "ROI 리포트로 '도달 1명당 비용'이 명확하게 나오니까 다음 캠페인 예산을 잡기가 쉬워졌어요.",
    person: "정OO 대표",
    cover: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&q=80",
  },
];

export default function CasesPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link href="/advertiser" className="text-xs text-ink-500">
          ← 비즈센터
        </Link>
        <h1 className="mt-1 text-3xl font-black leading-tight">
          여긴 광고주 성공 사례
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-500">
          캠페인 한 번으로 끝나지 않습니다. 누적된 리뷰가 검색 노출과 매출로
          이어진 실제 광고주 사례를 모았습니다.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="누적 광고주" value="3,200+" />
        <Stat label="누적 캠페인" value="58,400+" />
        <Stat label="누적 리뷰" value="312,000+" />
        <Stat label="평균 만족도" value="★ 4.7" />
      </div>

      <div className="space-y-6">
        {CASES.map((c, i) => (
          <article
            key={c.company}
            className="card overflow-hidden md:flex"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.cover}
              alt=""
              className={`aspect-[16/10] w-full object-cover md:aspect-auto md:w-[40%] ${
                i % 2 === 1 ? "md:order-2" : ""
              }`}
            />
            <div className="space-y-4 p-6 md:flex-1">
              <div>
                <div className="text-xs font-semibold text-brand-600">{c.category}</div>
                <h2 className="mt-1 text-xl font-black">{c.company}</h2>
                <p className="mt-1 text-base font-bold text-ink-700 dark:text-ink-200">
                  {c.headline}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {c.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-lg bg-brand-50 p-3 text-center dark:bg-ink-900"
                  >
                    <div className="text-[10px] text-ink-500">{m.label}</div>
                    <div className="mt-0.5 text-sm font-black text-brand-600">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
              <blockquote className="border-l-4 border-brand-300 bg-ink-50 p-3 text-sm italic text-ink-700 dark:bg-ink-900 dark:text-ink-300">
                "{c.quote}"
                <div className="mt-1 text-[11px] text-ink-500 not-italic">
                  — {c.person}
                </div>
              </blockquote>
            </div>
          </article>
        ))}
      </div>

      <div className="card border-brand-300 bg-brand-50 p-8 text-center dark:bg-brand-900/20">
        <h2 className="text-xl font-black">우리 매장도 이렇게 만들 수 있어요</h2>
        <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
          5분 만에 가입하고 첫 캠페인을 등록해보세요.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link href="/advertiser/signup" className="btn-primary">
            광고주 가입
          </Link>
          <Link href="/advertiser/billing/charge" className="btn-outline">
            요금 안내
          </Link>
        </div>
      </div>

      <p className="text-[11px] text-ink-400">
        ※ 본 페이지의 사례는 데모 목적으로 작성된 가상 사례입니다.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-xs text-ink-500">{label}</div>
      <div className="mt-1 text-2xl font-black text-brand-600">{value}</div>
    </div>
  );
}
