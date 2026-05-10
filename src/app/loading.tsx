export default function GlobalLoading() {
  return (
    <div className="ygn-loader-screen">
      <div className="relative flex flex-col items-center gap-6">
        {/* 핀 로고 — 펄스 + 회전 */}
        <div className="ygn-loader-pin relative">
          <svg
            width="80"
            height="80"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden
          >
            <path
              d="M16 2C9.92 2 5 6.85 5 12.83c0 7.4 9.04 15.5 10.13 16.45a1.3 1.3 0 0 0 1.74 0C17.96 28.33 27 20.23 27 12.83 27 6.85 22.08 2 16 2Z"
              fill="#f97316"
            />
            <circle cx="16" cy="13" r="4.5" fill="#fff" />
            <circle cx="16" cy="13" r="2" fill="#f97316" />
          </svg>
          {/* 궤도 점들 */}
          <span className="ygn-orbit absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          <span className="ygn-orbit absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          <span className="ygn-orbit absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* 텍스트 */}
        <div className="ygn-loader-text text-center">
          <div className="text-2xl font-black text-brand-600 dark:text-brand-300">
            여긴
          </div>
          <div className="mt-1 text-xs font-medium text-ink-500 dark:text-ink-400">
            동네 단골이 시작되는 곳
          </div>
        </div>

        {/* 진행 라인 */}
        <div className="relative h-0.5 w-32 overflow-hidden rounded-full bg-ink-200 dark:bg-ink-700">
          <div
            className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-brand-500 to-transparent"
            style={{ animation: "ygn-topbar-anim 1.4s infinite" }}
          />
        </div>
      </div>
    </div>
  );
}
