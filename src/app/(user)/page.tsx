import Link from "next/link";
import { db } from "@/lib/db";
import { CampaignCard } from "@/components/CampaignCard";
import { CATEGORIES } from "@/lib/format";
import { HeroRollingBanner } from "@/components/HeroRollingBanner";
import { getUserSession } from "@/lib/session";
import { matchScore, buildCategoryFrequency } from "@/lib/matching";

export default async function HomePage() {
  const session = await getUserSession();
  const now = new Date();
  const [hot, ending, fast] = await Promise.all([
    db.campaign.findMany({
      where: { status: "OPEN", applyEnd: { gt: now } },
      orderBy: { appliedCount: "desc" },
      take: 8,
    }),
    db.campaign.findMany({
      where: { status: "OPEN", applyEnd: { gt: now } },
      orderBy: { applyEnd: "asc" },
      take: 8,
    }),
    db.campaign.findMany({
      where: { status: "OPEN", fastMatch: true, applyEnd: { gt: now } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const allCampaigns = [...hot, ...ending, ...fast];
  const allIds = allCampaigns.map((c) => c.id);
  let favSet = new Set<string>();
  let scoreMap = new Map<string, number>();
  if (session && allIds.length > 0) {
    const [favs, me, history] = await Promise.all([
      db.favorite.findMany({
        where: { userId: session.id, campaignId: { in: allIds } },
        select: { campaignId: true },
      }),
      db.user.findUnique({ where: { id: session.id } }),
      db.application.findMany({
        where: { userId: session.id },
        include: { campaign: { select: { category: true } } },
        take: 50,
      }),
    ]);
    favSet = new Set(favs.map((f) => f.campaignId));
    if (me) {
      const freq = buildCategoryFrequency(history);
      for (const c of allCampaigns) {
        scoreMap.set(c.id, matchScore(me, c, freq).score);
      }
    }
  }
  const card = (c: (typeof hot)[number]) => (
    <CampaignCard
      key={c.id}
      c={c}
      favorited={favSet.has(c.id)}
      loggedIn={!!session}
      matchScore={scoreMap.get(c.id)}
    />
  );

  return (
    <div className="space-y-12">
      <HeroRollingBanner />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">카테고리</h2>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-9">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/campaigns?category=${encodeURIComponent(c)}`}
              className="card flex flex-col items-center justify-center px-2 py-3 text-xs font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-600"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {fast.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              ⚡ 빠른선정 캠페인
              <span className="text-xs font-normal text-ink-500">24시간 내 선정</span>
            </h2>
            <Link href="/campaigns?fast=1" className="text-xs text-ink-500">전체보기 →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {fast.map(card)}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">🔥 인기 캠페인</h2>
          <Link href="/campaigns" className="text-xs text-ink-500">전체보기 →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {hot.map(card)}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">⏰ 마감임박</h2>
          <Link href="/campaigns?sort=ending" className="text-xs text-ink-500">전체보기 →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {ending.map(card)}
        </div>
      </section>
    </div>
  );
}
