export default function AdminLoading() {
  return (
    <>
      <div className="ygn-topbar" />
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 w-40 rounded bg-ink-200 dark:bg-ink-700" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-24 animate-pulse rounded-lg bg-ink-200 dark:bg-ink-700"
            />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse">
              <div className="ygn-shimmer h-full" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
