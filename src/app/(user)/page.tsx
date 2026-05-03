import Link from "next/link";
import { db } from "@/lib/db";
import { CampaignCard } from "@/components/CampaignCard";
import { CATEGORIES } from "@/lib/format";

export default async function HomePage() {
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

  return (
    <div className="space-y-12">
      <section className="card overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700 p-8 text-white">
        <div className="text-xs font-semibold opacity-90">대한민국 무료 체험단 1위</div>
        <h1 className="mt-2 text-3xl font-black leading-tight md:text-4xl">
          진짜 후기로 연결되는<br />
          매일 새로운 체험단, 여긴
        </h1>
        <p className="mt-3 max-w-md text-sm opacity-90">
          맛집·뷰티·식품·여행까지. 무료로 체험하고, 솔직한 후기를 남기세요.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/campaigns" className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-brand-600">
            캠페인 둘러보기
          </Link>
          <Link href="/signup" className="rounded-lg border border-white/40 px-4 py-2 text-sm font-bold text-white">
            무료 가입
          </Link>
        </div>
      </section>

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
            {fast.map((c) => <CampaignCard key={c.id} c={c} />)}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">🔥 인기 캠페인</h2>
          <Link href="/campaigns" className="text-xs text-ink-500">전체보기 →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {hot.map((c) => <CampaignCard key={c.id} c={c} />)}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">⏰ 마감임박</h2>
          <Link href="/campaigns?sort=ending" className="text-xs text-ink-500">전체보기 →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {ending.map((c) => <CampaignCard key={c.id} c={c} />)}
        </div>
      </section>
    </div>
  );
}
