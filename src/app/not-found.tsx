import Link from "next/link";

const POPULAR = [
  { href: "/campaigns", icon: "🎁", label: "전체 캠페인" },
  { href: "/ranking", icon: "🏆", label: "실시간 랭킹" },
  { href: "/calendar", icon: "📅", label: "캠페인 캘린더" },
  { href: "/reviews", icon: "📣", label: "체험 후기" },
  { href: "/magazine", icon: "📰", label: "매거진" },
  { href: "/faq", icon: "💬", label: "자주 묻는 질문" },
];

export default function NotFound() {
  return (
    <html lang="ko">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('yeogin_theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-ink-50 text-ink-900 dark:bg-ink-900 dark:text-ink-100">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-10 text-center">
          <div className="relative">
            <div className="text-[120px] font-black leading-none text-brand-500/20">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              🧭
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-black md:text-3xl">
            길을 잃었네요
          </h1>
          <p className="mt-2 max-w-md text-sm text-ink-500 dark:text-ink-400">
            찾으시는 페이지가 사라졌거나, 주소가 틀렸어요.
            <br />
            아래에서 인기 페이지를 둘러보거나 검색해보세요.
          </p>

          {/* 검색 폼 */}
          <form
            action="/search"
            method="get"
            className="mt-6 flex w-full max-w-md gap-2"
          >
            <input
              name="q"
              required
              placeholder="🔍  찾고 있는 캠페인·매장·태그"
              className="input flex-1 h-11"
            />
            <button type="submit" className="btn-primary px-5">
              검색
            </button>
          </form>

          {/* 인기 페이지 */}
          <div className="mt-8 w-full max-w-md">
            <div className="mb-3 text-[11px] font-bold text-ink-400">인기 페이지</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {POPULAR.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm font-semibold text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200"
                >
                  <span className="mr-1">{p.icon}</span>
                  {p.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Link href="/" className="btn-primary">
              홈으로 가기
            </Link>
            <Link href="/support" className="btn-outline">
              문의하기
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
