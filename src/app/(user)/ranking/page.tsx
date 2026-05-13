import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { CampaignCard } from "@/components/CampaignCard";
import { StarRating } from "@/components/StarRating";
import { getUserSession } from "@/lib/session";
import { fmtDate, won } from "@/lib/format";

export const metadata: Metadata = {
  title: "랭킹 · 여긴",
  description: "인기 캠페인·마감임박·신규·고평점 매장 TOP 10",
};

const TABS = [
  { id: "hot", label: "🔥 인기", desc: "신청 경쟁률이 높은 캠페인 TOP 10" },
  { id: "deadline", label: "⏰ 마감임박", desc: "곧 마감되는 캠페인 TOP 10" },
  { id: "new", label: "🆕 신규", desc: "이번 주 새로 오픈한 캠페인" },
  { id: "store", label: "🏪 매장평점", desc: "후기 기반 고평점 매장 TOP 10" },
];

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab = TABS.find((t) => t.id === sp.tab)?.id ?? "hot";

  const session = await getUserSession();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let campaigns: Array<{
    id: string;
    title: string;
    thumbnail: string;
    type: string;
    channel: string;
    category: string;
    region: string | null;
    offer: string;
    offerValue: number;
    capacity: number;
    appliedCount: number;
    applyEnd: Date;
    fastMatch: boolean;
  }> = [];

  if (tab === "hot") {
    campaigns = await db.campaign.findMany({
      where: { status: "OPEN" },
      orderBy: [{ appliedCount: "desc" }, { offerValue: "desc" }],
      take: 10,
    });
  } else if (tab === "deadline") {
    campaigns = await db.campaign.findMany({
      where: { status: "OPEN", applyEnd: { gte: now } },
      orderBy: { applyEnd: "asc" },
      take: 10,
    });
  } else if (tab === "new") {
    campaigns = await db.campaign.findMany({
      where: { status: "OPEN", createdAt: { gte: sevenDaysAgo } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }

  let topStores: Array<{
    id: string;
    companyName: string;
    avg: number;
    count: number;
    openCount: number;
  }> = [];

  if (tab === "store") {
    const groups = await db.advertiserRating.groupBy({
      by: ["advertiserId"],
      _avg: { rating: true },
      _count: { _all: true },
      orderBy: { _avg: { rating: "desc" } },
      take: 20,
    });
    const ids = groups.map((g) => g.advertiserId);
    const advs = await db.advertiser.findMany({
      where: { id: { in: ids } },
      include: { _count: { select: { campaigns: { where: { status: "OPEN" } } } } },
    });
    const advMap = new Map(advs.map((a) => [a.id, a]));
    topStores = groups
      .map((g) => {
        const a = advMap.get(g.advertiserId);
        if (!a) return null;
        return {
          id: a.id,
          companyName: a.companyName,
          avg: g._avg.rating || 0,
          count: g._count._all,
          openCount: a._count.campaigns,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .slice(0, 10);
  }

  let favSet = new Set<string>();
  if (session && campaigns.length > 0) {
    const favs = await db.favorite.findMany({
      where: { userId: session.id, campaignId: { in: campaigns.map((c) => c.id) } },
      select: { campaignId: true },
    });
    favSet = new Set(favs.map((f) => f.campaignId));
  }

  const current = TABS.find((t) => t.id === tab)!;

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs font-semibold text-brand-600">RANKING</div>
        <h1 className="text-2xl font-black">실시간 랭킹</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          {fmtDate(now)} 기준 · 매일 자정 갱신
        </p>
      </header>

      {/* 탭 */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/ranking?tab=${t.id}`}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              t.id === tab
                ? "bg-ink-900 text-white shadow-md dark:bg-white dark:text-ink-900"
                : "border border-ink-200 bg-white text-ink-700 hover:bg-ink-100 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <p className="text-sm text-ink-600 dark:text-ink-300">{current.desc}</p>

      {/* 캠페인 TOP 10 */}
      {tab !== "store" && (
        <>
          {campaigns.length === 0 ? (
            <div className="card p-10 text-center text-sm text-ink-500">
              해당 조건의 캠페인이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.slice(0, 3).map((c, i) => (
                <PodiumCard
                  key={c.id}
                  rank={i + 1}
                  c={c}
                  favorited={favSet.has(c.id)}
                  loggedIn={!!session}
                />
              ))}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {campaigns.slice(3).map((c, i) => (
                  <div key={c.id} className="relative">
                    <span className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-ink-900/90 text-[11px] font-black text-white shadow-md">
                      {i + 4}
                    </span>
                    <CampaignCard
                      c={c}
                      favorited={favSet.has(c.id)}
                      loggedIn={!!session}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 매장 TOP 10 */}
      {tab === "store" && (
        <>
          {topStores.length === 0 ? (
            <div className="card p-10 text-center text-sm text-ink-500">
              평가 데이터가 부족합니다.
            </div>
          ) : (
            <ul className="card divide-y divide-ink-100 dark:divide-ink-700">
              {topStores.map((s, i) => {
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                return (
                  <li key={s.id}>
                    <Link
                      href={`/store/${s.id}`}
                      className="flex items-center justify-between gap-3 p-4 transition hover:bg-ink-50 dark:hover:bg-ink-900"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-black ${
                            i < 3
                              ? "bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-md"
                              : "bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-200"
                          }`}
                        >
                          {medal ?? i + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-base font-bold">
                            {s.companyName}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">
                            <StarRating rating={Math.round(s.avg)} size="sm" />
                            <b>{s.avg.toFixed(1)}</b>
                            <span>({s.count}건)</span>
                            <span>·</span>
                            <span>진행중 {s.openCount}건</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-ink-400">→</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function PodiumCard({
  rank,
  c,
  favorited,
  loggedIn,
}: {
  rank: number;
  c: {
    id: string;
    title: string;
    thumbnail: string;
    category: string;
    appliedCount: number;
    capacity: number;
    offer: string;
    offerValue: number;
    applyEnd: Date;
  };
  favorited: boolean;
  loggedIn: boolean;
}) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
  const ratio = c.capacity > 0 ? Math.round((c.appliedCount / c.capacity) * 100) : 0;
  void favorited;
  void loggedIn;
  return (
    <Link
      href={`/campaigns/${c.id}`}
      className="card flex items-stretch gap-3 overflow-hidden p-3 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md sm:h-32 sm:w-32">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.thumbnail} alt="" className="h-full w-full object-cover" />
        <span className="absolute left-1 top-1 text-2xl drop-shadow">{medal}</span>
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="text-[11px] font-bold text-brand-600">{c.category}</div>
        <h3 className="line-clamp-2 text-base font-black">{c.title}</h3>
        <p className="line-clamp-1 text-xs text-ink-500 dark:text-ink-400">{c.offer}</p>
        <div className="flex items-center gap-3 text-xs">
          <span className="font-bold text-emerald-600">{won(c.offerValue)}</span>
          <span className="text-ink-400">·</span>
          <span className="text-ink-500 dark:text-ink-400">
            경쟁률 {ratio}% ({c.appliedCount}/{c.capacity})
          </span>
        </div>
      </div>
    </Link>
  );
}
