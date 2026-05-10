import Link from "next/link";
import { db } from "@/lib/db";
import { CampaignCard } from "@/components/CampaignCard";
import { CATEGORIES } from "@/lib/format";
import { HeroRollingBanner } from "@/components/HeroRollingBanner";
import { getUserSession } from "@/lib/session";
import { matchScore, buildCategoryFrequency } from "@/lib/matching";
import { getRecommendedCampaigns } from "@/lib/recommend";
import { promoteScheduledCampaigns } from "@/lib/campaign-publish";

const QUICK_MENUS = [
  { href: "/campaigns", label: "체험단 검색", emoji: "🔎", bg: "bg-brand-100", hover: "hover:bg-brand-200" },
  { href: "/community", label: "커뮤니티", emoji: "💬", bg: "bg-sky-100", hover: "hover:bg-sky-200" },
  { href: "/magazine", label: "공지/이벤트", emoji: "🎉", bg: "bg-pink-100", hover: "hover:bg-pink-200", badge: "N" },
  { href: "/guides/apply", label: "이용가이드", emoji: "📘", bg: "bg-emerald-100", hover: "hover:bg-emerald-200" },
];

export default async function HomePage() {
  await promoteScheduledCampaigns();
  const session = await getUserSession();
  const recommended = session ? await getRecommendedCampaigns(session.id, 4) : [];
  const now = new Date();
  const [premium, hot, ending, fresh] = await Promise.all([
    db.campaign.findMany({
      where: { status: "OPEN", applyEnd: { gt: now }, fastMatch: true },
      orderBy: { offerValue: "desc" },
      take: 4,
    }),
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
      where: { status: "OPEN", applyEnd: { gt: now } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const allCampaigns = [...premium, ...hot, ...ending, ...fresh, ...recommended];
  const allIds = allCampaigns.map((c) => c.id);
  let favSet = new Set<string>();
  const scoreMap = new Map<string, number>();
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

      {/* 빠른 메뉴 4개 (리뷰노트 형태) */}
      <section className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
        {QUICK_MENUS.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="quick-icon-3d flex flex-col items-center justify-center"
          >
            <div
              className={`quick-icon-bg relative flex h-16 w-16 items-center justify-center rounded-full text-3xl sm:h-20 sm:w-20 ${m.bg} ${m.hover}`}
            >
              {m.emoji}
              {m.badge && (
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
                  {m.badge}
                </span>
              )}
            </div>
            <div className="mt-2 text-xs font-semibold text-ink-700 dark:text-ink-200 sm:text-sm">
              {m.label}
            </div>
          </Link>
        ))}
      </section>

      {/* 카테고리 (작게) */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold">카테고리</h2>
          <Link href="/tags" className="text-xs text-ink-500">
            인기 태그 →
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-11">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/campaigns?category=${encodeURIComponent(c)}`}
              className="card flex flex-col items-center justify-center px-2 py-3 text-xs font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-600 dark:text-ink-200"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* 개인화 추천 (로그인 시) */}
      {session && recommended.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-black">
              ✨ {session.name}님을 위한 추천
              <span className="text-xs font-normal text-ink-500">관심사 + 활동 기반</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {recommended.map(card)}
          </div>
        </section>
      )}

      {/* 프리미엄 체험단 */}
      {premium.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between sm:mb-5">
            <h2 className="flex items-center gap-2 text-xl font-black md:text-2xl">
              🌟 프리미엄 체험단
              <span className="text-xs font-normal text-ink-500">고가치 + 빠른선정</span>
            </h2>
            <Link href="/campaigns?fast=1&sort=point" className="text-xs text-ink-500">
              더보기 →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {premium.map(card)}
          </div>
        </section>
      )}

      {/* 인기 체험단 */}
      <section>
        <div className="mb-3 flex items-center justify-between sm:mb-5">
          <h2 className="text-xl font-black md:text-2xl">🔥 인기 체험단</h2>
          <Link href="/campaigns?sort=popular" className="text-xs text-ink-500">
            더보기 →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {hot.map(card)}
        </div>
      </section>

      {/* 마감 임박 체험단 */}
      <section>
        <div className="mb-3 flex items-center justify-between sm:mb-5">
          <h2 className="text-xl font-black md:text-2xl">⏰ 마감 임박 체험단</h2>
          <Link href="/campaigns?sort=ending" className="text-xs text-ink-500">
            더보기 →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {ending.map(card)}
        </div>
      </section>

      {/* 신규 체험단 */}
      <section>
        <div className="mb-3 flex items-center justify-between sm:mb-5">
          <h2 className="text-xl font-black md:text-2xl">✨ 신규 체험단</h2>
          <Link href="/campaigns?sort=latest" className="text-xs text-ink-500">
            더보기 →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {fresh.map(card)}
        </div>
      </section>
    </div>
  );
}
