import Link from "next/link";

export const metadata = {
  title: "최적화 블로그란? - 여긴",
  description: "네이버 블로그 지수와 최적화/준최적화의 차이를 쉽게 풀어드립니다.",
};

const GRADES = [
  { key: "일반", desc: "갓 시작한 블로그", colors: "bg-ink-100 text-ink-700" },
  { key: "준최(1~7)", desc: "노출은 되지만 상위는 어려운 단계", colors: "bg-amber-100 text-amber-800" },
  { key: "최적(1~3)", desc: "검색 상위 노출 가능 시작 단계", colors: "bg-sky-100 text-sky-800" },
  { key: "최적(+1~+4)", desc: "강력한 노출 영향력, 광고주 선호 1순위", colors: "bg-violet-100 text-violet-700" },
];

export default function OptimizedBlogPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">📈 최적화 블로그란?</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          네이버 블로그의 "지수"와 최적화 / 준최적화의 차이를 쉽게 풀어드립니다.
        </p>
      </div>

      <section className="card p-5">
        <h2 className="text-base font-bold">🎯 한 줄 요약</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-ink-200">
          블로그마다 <b>"점수"</b>가 있고, 네이버는 이 점수를 보고 "좋은 블로그"인지 판단합니다.
          최적화 블로그 = <b>시험 점수가 아주 높은 학생</b>이라고 생각하면 쉽습니다.
        </p>
      </section>

      <section className="card p-5">
        <h2 className="text-base font-bold">🏫 비유로 이해하기</h2>
        <div className="mt-3 space-y-3 text-sm text-ink-700 dark:text-ink-200">
          <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
            <b>최적화 블로그</b> — 시험 점수가 매우 높은 우등생.{" "}
            네이버가 "이 블로그는 믿을 만해!" 라고 판단해 검색 결과 <b>상위에 잘 보여줍니다</b>.
          </div>
          <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
            <b>준최적화 블로그</b> — 점수가 중간 정도. 어느 정도 괜찮다고 보지만,
            최적화만큼 눈에 띄게 상위에 노출되지는 않습니다.
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold">📊 지수 등급 한눈에</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {GRADES.map((g) => (
            <div key={g.key} className="card p-4 text-center">
              <div className={`badge mx-auto ${g.colors} px-2.5 py-1`}>{g.key}</div>
              <div className="mt-2 text-xs text-ink-600 dark:text-ink-300">{g.desc}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-ink-500 dark:text-ink-400">
          ※ 최적+1 ~ 최적+4 로 갈수록 더 높은 점수의 블로그입니다.
        </p>
      </section>

      <section className="card p-5">
        <h2 className="text-base font-bold">🏪 플레이스 순위에도 영향</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-ink-200">
          최적화 블로그가 검색 상위에 뜨면, 글을 본 사람들이 자연스럽게 블로그에 있는{" "}
          <b>플레이스 링크(가게 정보)</b>를 클릭하게 됩니다.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-ink-200">
          이렇게 되면 매장의 플레이스 방문자 수가 늘어나고, 네이버가{" "}
          <b>"이 가게도 괜찮네!"</b>라고 판단해 플레이스 순위가 올라갈 확률이 커집니다.
        </p>
        <div className="mt-3 rounded-lg bg-brand-50 p-3 text-sm dark:bg-brand-900/20">
          💡 <b>한 줄 결론</b>: 최적화 블로그는 단순 노출뿐 아니라 <b>매장 플레이스
          순위 상승</b>에도 도움이 됩니다.
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-base font-bold">🎯 광고주가 알아야 할 것</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-700 dark:text-ink-200">
          <li>① 단순 팔로워/방문자 수만 보지 마세요. <b>지수가 높은 블로그가 효율적</b>입니다.</li>
          <li>② 여긴은 <b>인증된 채널 메트릭</b>을 매칭 점수에 자동 반영해요.</li>
          <li>③ 신뢰등급 Gold 이상 + 인증 블로그 = 검색 상위 노출 가능성 ↑</li>
          <li>④ 캠페인 등록 시 키워드를 <b>구체적</b>으로 (예: "강남파스타맛집") 입력하면 SEO 효과 ↑</li>
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="text-base font-bold">💪 인플루언서가 지수를 올리는 법</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-700 dark:text-ink-200">
          <li>① <b>꾸준한 발행</b> — 주 2~3회 이상 일관된 주제로</li>
          <li>② <b>1,000자 이상 + 사진 5장 이상</b>의 충실한 콘텐츠</li>
          <li>③ <b>제목·본문 키워드 일치</b> — 검색 의도에 맞는 자연스러운 키워드</li>
          <li>④ <b>체류시간 늘리기</b> — 끝까지 읽히는 글 (소제목·이미지 분산)</li>
          <li>⑤ <b>무리한 외부 링크 X</b> — 본문 안에서 가치 제공</li>
        </ul>
      </section>

      <div className="card flex flex-wrap items-center justify-between gap-3 bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white">
        <div>
          <div className="text-base font-bold">지금 내 블로그를 인증하세요</div>
          <div className="text-xs opacity-90">인증 = 매칭 점수 +13점, 광고주 신뢰 ↑</div>
        </div>
        <div className="flex gap-2">
          <Link href="/mypage" className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-brand-600">
            마이페이지 가기
          </Link>
          <Link href="/faq" className="rounded-lg border border-white/40 px-4 py-2 text-sm font-bold text-white">
            FAQ
          </Link>
        </div>
      </div>
    </article>
  );
}
