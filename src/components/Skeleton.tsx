export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-ink-200 dark:bg-ink-700 ${className}`}
    >
      <div className="ygn-shimmer absolute inset-0" />
    </div>
  );
}

export function CampaignCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex justify-between pt-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CampaignCardSkeleton key={i} />
      ))}
    </div>
  );
}

const TIPS = [
  "💡 SNS 채널을 인증하면 매칭 점수가 +13점 올라가요",
  "✨ 마이페이지에 활동지역을 등록하면 내 주변 캠페인이 자동 노출돼요",
  "🎁 친구 초대 코드로 양쪽 1,000P 즉시 적립!",
  "🔥 7일 연속 출석 시 +200P 보너스",
  "📍 빠른선정 캠페인은 24시간 내 매칭됩니다",
  "★ 광고주 평점이 좋은 매장이 우선 노출됩니다",
];

export function FunLoader({ message }: { message?: string }) {
  // 매번 다른 팁을 보여주지 않으면 SSR/CSR 불일치 → 첫 팁 고정
  const tip = TIPS[Math.floor((Date.now() / 86_400_000) % TIPS.length)];
  return (
    <div className="card flex flex-col items-center justify-center gap-4 p-10 text-center">
      <div className="ygn-bouncer">
        <span>🍽️</span>
        <span>☕</span>
        <span>💄</span>
        <span>🧴</span>
      </div>
      <div className="space-y-1">
        <div className="text-sm font-bold text-ink-900 dark:text-ink-100">
          {message ?? "딱 맞는 캠페인을 찾고 있어요…"}
        </div>
        <div className="text-xs text-ink-500 dark:text-ink-400">{tip}</div>
      </div>
    </div>
  );
}
