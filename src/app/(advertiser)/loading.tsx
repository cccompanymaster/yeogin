export default function AdvertiserLoading() {
  return (
    <>
      <div className="ygn-topbar" />
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded bg-ink-200 dark:bg-ink-700" />
          <div className="mt-2 h-4 w-32 rounded bg-ink-200 dark:bg-ink-700" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse">
              <div className="ygn-shimmer h-full" />
            </div>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="card h-64 animate-pulse">
            <div className="ygn-shimmer h-full" />
          </div>
          <div className="card h-64 animate-pulse">
            <div className="ygn-shimmer h-full" />
          </div>
        </div>
        <div className="ygn-bouncer flex justify-center pt-6">
          <span>📊</span>
          <span>📈</span>
          <span>📋</span>
          <span>🎯</span>
        </div>
        <p className="text-center text-xs text-ink-500">
          비즈센터 데이터를 불러오는 중이에요…
        </p>
      </div>
    </>
  );
}
