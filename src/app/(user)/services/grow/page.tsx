import Link from "next/link";

export const metadata = {
  title: "이웃·팔로워 늘리는 4단계 전략 - 여긴",
  description:
    "단순한 숫자가 아닌 '진짜 이웃·진성 팔로워'를 늘리는 4단계 핵심 전략. 채널의 체급을 키워야 캠페인 선정이 쉬워집니다.",
};

export default function GrowGuidePage() {
  return (
    <article className="mx-auto max-w-3xl space-y-10">
      {/* 헤더 */}
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            성장 가이드
          </span>
          <span className="badge bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-200">
            블로그 · 인스타그램
          </span>
        </div>
        <h1 className="text-3xl font-black leading-tight md:text-4xl">
          🤝 블로그 이웃·팔로워<br />
          폭발적으로 늘리는 4단계 핵심 전략
        </h1>
        <p className="text-sm leading-relaxed text-ink-600 dark:text-ink-300">
          체험단 선정의 기본기를 다졌다면, 이제 내 채널의 <b className="text-ink-900 dark:text-ink-100">체급</b>을
          키울 차례입니다. 네이버 블로그의 <b>'이웃'</b>과 인스타그램의 <b>'팔로워'</b>는
          채널의 영향력을 보여주는 가장 직관적인 지표입니다.
          <br />
          <br />
          단순히 숫자만 늘리는 <b className="text-red-500">'유령 이웃'</b>이 아닌, 내 글을 진짜로
          읽어주고 반응해 주는{" "}
          <b className="text-emerald-600 dark:text-emerald-400">'찐 이웃(진성 팔로워)'</b>를
          늘리는 4단계 핵심 전략을 정리해 드립니다.
        </p>
      </header>

      {/* STEP 1 */}
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-r from-brand-500 to-orange-500 px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <span className="rounded bg-white/25 px-2 py-0.5 text-xs font-bold">STEP 1</span>
            <span className="text-xs font-bold opacity-90">아웃바운드</span>
          </div>
          <h2 className="mt-1 text-xl font-black md:text-2xl">
            먼저 다가가는 '선제적 아웃바운드' 전략
          </h2>
        </div>
        <div className="space-y-4 p-6 text-sm leading-relaxed text-ink-700 dark:text-ink-200">
          <p>
            초보 시절에는 내 글이 검색 상위에 노출되기 어렵기 때문에, 가만히
            기다려서는 이웃이 늘지 않습니다. <b>직접 찾아가야 합니다.</b>
          </p>
          <div className="space-y-3 rounded-lg bg-ink-50 p-4 dark:bg-ink-900">
            <div>
              <div className="text-sm font-bold text-ink-900 dark:text-ink-100">
                🎯 타겟 이웃 찾기
              </div>
              <p className="mt-1 text-xs">
                나와 <b>'같은 관심사(주제)'</b>를 가진 블로거를 찾아야 합니다.
                예를 들어 내가 맛집 블로거라면, 최근 올라온 다른 맛집 리뷰 글에{" "}
                <b>공감</b>을 누른 사람들을 찾아가 서로이웃을 신청하세요.
                활동성이 보장된 유저들입니다.
              </p>
            </div>
            <div>
              <div className="text-sm font-bold text-ink-900 dark:text-ink-100">
                🚫 기본 멘트는 절대 금물
              </div>
              <p className="mt-1 text-xs">
                "우리 서로이웃 해요~" 같은 기본 멘트는 매크로(봇)로 오해받기
                쉽습니다.
              </p>
              <div className="mt-2 rounded-md border-l-4 border-emerald-500 bg-white p-3 text-xs italic dark:bg-ink-800">
                "안녕하세요! OO님 블로그에서 OO 맛집 포스팅 보고 너무 유익해서
                찾아왔습니다. 저도 맛집 탐방을 좋아하는데 소통하고 싶어
                서이추(서로이웃 추가) 남깁니다!"
              </div>
              <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                → <b>진정성 있는 맞춤형 멘트</b>를 사용하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 2 */}
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <span className="rounded bg-white/25 px-2 py-0.5 text-xs font-bold">STEP 2</span>
            <span className="text-xs font-bold opacity-90">소통</span>
          </div>
          <h2 className="mt-1 text-xl font-black md:text-2xl">
            영혼을 담은 '진정성 있는 소통'
          </h2>
        </div>
        <div className="space-y-4 p-6 text-sm leading-relaxed text-ink-700 dark:text-ink-200">
          <p>
            이웃 숫자를 늘리는 것보다 <b>유지하는 것</b>이 더 중요합니다. 소통의
            질이 곧 내 채널의 지수로 연결됩니다.
          </p>

          {/* 비교 표 */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
              <div className="mb-2 flex items-center gap-1 text-xs font-bold text-red-700 dark:text-red-300">
                <span>❌</span>
                <span>최악의 소통 (매크로형)</span>
              </div>
              <ul className="space-y-2 text-xs text-ink-700 dark:text-ink-200">
                <li>• "잘 보고 갑니다~ 서이추 환영해요"</li>
                <li>• 본문 내용은 보지도 않고 댓글</li>
                <li>• 무의미한 스티커 하나 띡</li>
              </ul>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-900/20">
              <div className="mb-2 flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <span>⭕</span>
                <span>최고의 소통 (체류형)</span>
              </div>
              <ul className="space-y-2 text-xs text-ink-700 dark:text-ink-200">
                <li>
                  • "OO 식당 볶음밥 비주얼이 장난 아니네요! 🤤 저도 주말에 근처
                  가는데 꼭 들러봐야겠어요"
                </li>
                <li>• 본문을 1분+ 읽고 (체류 시간 확보) 구체적 공감</li>
                <li>• 질문형 댓글 → 상대방이 답방하게 만들기</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 3 */}
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <span className="rounded bg-white/25 px-2 py-0.5 text-xs font-bold">STEP 3</span>
            <span className="text-xs font-bold opacity-90">콘텐츠</span>
          </div>
          <h2 className="mt-1 text-xl font-black md:text-2xl">
            알아서 찾아오게 만드는 '인바운드 세팅'
          </h2>
        </div>
        <div className="space-y-4 p-6 text-sm leading-relaxed text-ink-700 dark:text-ink-200">
          <p>
            결국 본질은 <b>'내 채널에 볼거리가 있는가'</b>입니다. 유용한 정보가
            있으면 사람들은 알아서 이웃 추가를 누릅니다.
          </p>
          <div className="space-y-3">
            <div className="rounded-lg bg-ink-50 p-4 dark:bg-ink-900">
              <div className="text-sm font-bold">📝 정보성 글 70% 룰</div>
              <p className="mt-1 text-xs">
                단순 일기장 형식의 글보다는 사람들이 검색해서 들어올 만한
                정보성 글을 <b>70% 비율</b>로 작성하세요.
                <br />
                <span className="mt-1 inline-block text-ink-500 dark:text-ink-400">
                  예: "OO 지역 주차장 꿀팁", "OO 제품 한 달 사용기"
                </span>
              </p>
            </div>
            <div className="rounded-lg bg-ink-50 p-4 dark:bg-ink-900">
              <div className="text-sm font-bold">🪧 명확한 채널 컨셉(간판)</div>
              <p className="mt-1 text-xs">
                블로그 스킨, 프로필 사진, 소개 글에 내 채널의 정체성을 명확히
                적어두세요. 방문자가 내 채널을 구독해야 할 이유를{" "}
                <b>시각적으로</b> 보여줘야 합니다.
              </p>
              <div className="mt-2 rounded-md border-l-4 border-sky-500 bg-white p-3 text-xs italic dark:bg-ink-800">
                "수도권 핫플을 발 빠르게 전하는 직장인 블로거"
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 4 */}
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <span className="rounded bg-white/25 px-2 py-0.5 text-xs font-bold">STEP 4</span>
            <span className="text-xs font-bold opacity-90">관리</span>
          </div>
          <h2 className="mt-1 text-xl font-black md:text-2xl">
            정기적인 '이웃 관리 (물갈이)'
          </h2>
        </div>
        <div className="space-y-4 p-6 text-sm leading-relaxed text-ink-700 dark:text-ink-200">
          <p>
            <b>유령 이웃은 내 블로그의 참여율(인게이지먼트) 지수를 깎아먹는
            원인</b>이 됩니다.
          </p>
          <ul className="space-y-2 rounded-lg bg-ink-50 p-4 text-xs dark:bg-ink-900">
            <li>👻 서로이웃만 맺고 내 글은 전혀 읽지 않는 계정</li>
            <li>📢 광고성 글만 올리는 계정</li>
            <li>🚪 이미 블로그를 접은 계정 (1년+ 미활동)</li>
          </ul>
          <p>
            정기적으로 <b>이웃을 정리</b>하고, 새로운 활동성 높은 이웃으로
            교체하는 작업이 필요합니다.
          </p>
        </div>
      </section>

      {/* 은근한 우리 서비스 안내 */}
      <section className="card border-brand-200 bg-gradient-to-br from-brand-50 to-pink-50 p-6 dark:border-brand-700 dark:from-brand-900/20 dark:to-pink-900/20">
        <div className="flex items-start gap-3">
          <div className="text-3xl">💡</div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black text-ink-900 dark:text-ink-100">
              혼자 하기 부담스러우시다면…
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-ink-200">
              위 4단계는 효과적이지만, 솔직히 말해 <b>매일 3시간 이상</b>
              꾸준히 투자해야 의미 있는 결과가 나옵니다. 본업이 따로 있는 분들
              에게는 쉽지 않은 일이에요.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-ink-200">
              여긴은 인플루언서분들이 본업과 콘텐츠 제작에 집중하실 수 있도록{" "}
              <b className="text-brand-600 dark:text-brand-400">
                채널 성장 어시스트 프로그램
              </b>
              을 조용히 운영하고 있습니다. 관심 있으신 분들은 가볍게 살펴보세요.
            </p>

            {/* 3개 미니 카드 */}
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-white p-4 dark:bg-ink-800">
                <div className="text-xl">🤝</div>
                <div className="mt-2 text-sm font-bold">진성 이웃 매칭</div>
                <p className="mt-1 text-[11px] text-ink-500 dark:text-ink-400">
                  같은 카테고리 활동성 높은 블로거 큐레이션. 직접 신청·답방
                  부담을 줄여드려요.
                </p>
              </div>
              <div className="rounded-lg bg-white p-4 dark:bg-ink-800">
                <div className="text-xl">🌱</div>
                <div className="mt-2 text-sm font-bold">콘텐츠 컨설팅</div>
                <p className="mt-1 text-[11px] text-ink-500 dark:text-ink-400">
                  채널 컨셉 진단 + 정보성 글 주제 추천. 검색 노출이 잘 되는
                  글 구조 가이드.
                </p>
              </div>
              <div className="rounded-lg bg-white p-4 dark:bg-ink-800">
                <div className="text-xl">🧹</div>
                <div className="mt-2 text-sm font-bold">유령 이웃 정리</div>
                <p className="mt-1 text-[11px] text-ink-500 dark:text-ink-400">
                  활동성 낮은 이웃 자동 분류. 인게이지먼트 지수 회복 도움.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              <Link
                href="/support"
                className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-4 py-2 font-bold text-white hover:bg-brand-600"
              >
                자세히 문의하기 →
              </Link>
              <Link
                href="/optimized-blog"
                className="inline-flex items-center gap-1 text-ink-600 underline-offset-2 hover:underline dark:text-ink-300"
              >
                최적화 블로그란? 먼저 읽기
              </Link>
            </div>

            <p className="mt-4 text-[11px] text-ink-500 dark:text-ink-400">
              ※ 모든 사용자는 위 4단계 가이드만 따라하셔도 충분히 성장하실 수
              있어요. 어시스트 프로그램은 <b>선택 사항</b>입니다. 부담 없이
              둘러보고 결정하세요.
            </p>
          </div>
        </div>
      </section>

      {/* 다음 단계 CTA */}
      <section className="grid gap-3 md:grid-cols-3">
        <Link
          href="/optimized-blog"
          className="card flex items-center gap-3 p-4 hover:shadow-md"
        >
          <div className="text-2xl">📈</div>
          <div className="min-w-0">
            <div className="text-sm font-bold">최적화 블로그란?</div>
            <div className="text-[11px] text-ink-500 dark:text-ink-400">
              지수 등급 기초 가이드
            </div>
          </div>
        </Link>
        <Link
          href="/guides/apply"
          className="card flex items-center gap-3 p-4 hover:shadow-md"
        >
          <div className="text-2xl">📘</div>
          <div className="min-w-0">
            <div className="text-sm font-bold">캠페인 신청 가이드</div>
            <div className="text-[11px] text-ink-500 dark:text-ink-400">
              6단계 절차 + 꿀팁
            </div>
          </div>
        </Link>
        <Link
          href="/campaigns"
          className="card flex items-center gap-3 p-4 hover:shadow-md"
        >
          <div className="text-2xl">🎁</div>
          <div className="min-w-0">
            <div className="text-sm font-bold">바로 신청하기</div>
            <div className="text-[11px] text-ink-500 dark:text-ink-400">
              매일 새 캠페인 오픈
            </div>
          </div>
        </Link>
      </section>
    </article>
  );
}
