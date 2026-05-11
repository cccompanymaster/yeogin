import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { CampaignCard } from "@/components/CampaignCard";
import { StarRating } from "@/components/StarRating";
import { fmtDate } from "@/lib/format";
import { getUserSession } from "@/lib/session";
import { EmptyState } from "@/components/EmptyState";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const adv = await db.advertiser.findUnique({
    where: { id },
    select: { companyName: true },
  });
  if (!adv) return { title: "매장" };
  return {
    title: `${adv.companyName} - 여긴`,
    description: `${adv.companyName}의 진행중·완료 캠페인과 후기를 확인하세요.`,
  };
}

export default async function StoreProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const adv = await db.advertiser.findUnique({
    where: { id },
    include: {
      campaigns: {
        where: { status: { in: ["OPEN", "CLOSED", "COMPLETED"] } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!adv) notFound();

  const [ratingAgg, reviewSamples] = await Promise.all([
    db.advertiserRating.aggregate({
      where: { advertiserId: adv.id },
      _avg: { rating: true },
      _count: { _all: true },
    }),
    db.review.findMany({
      where: { status: "APPROVED", campaign: { advertiserId: adv.id } },
      include: { user: true, campaign: { select: { title: true } } },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      take: 4,
    }),
  ]);
  const avg = ratingAgg._avg.rating || 0;
  const cnt = ratingAgg._count._all;
  const openCampaigns = adv.campaigns.filter((c) => c.status === "OPEN");
  const closedCampaigns = adv.campaigns.filter((c) => c.status !== "OPEN");

  const session = await getUserSession();
  let favSet = new Set<string>();
  if (session && adv.campaigns.length > 0) {
    const favs = await db.favorite.findMany({
      where: { userId: session.id, campaignId: { in: adv.campaigns.map((c) => c.id) } },
      select: { campaignId: true },
    });
    favSet = new Set(favs.map((f) => f.campaignId));
  }

  return (
    <div className="space-y-8">
      {/* 매장 헤더 */}
      <header className="card overflow-hidden">
        <div className="bg-gradient-to-br from-ink-900 to-ink-700 px-6 py-8 text-white">
          <div className="text-xs font-semibold opacity-80">광고주</div>
          <h1 className="mt-1 text-3xl font-black md:text-4xl">{adv.companyName}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            {cnt > 0 && (
              <span className="flex items-center gap-1">
                <StarRating rating={Math.round(avg)} />
                <b>{avg.toFixed(1)}</b>
                <span className="text-ink-300">({cnt}건)</span>
              </span>
            )}
            <span className="text-ink-300">·</span>
            <span>가입 {fmtDate(adv.createdAt)}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 p-4">
          <Stat label="진행중 캠페인" value={`${openCampaigns.length}`} />
          <Stat label="누적 캠페인" value={`${adv.campaigns.length}`} />
          <Stat label="평가" value={cnt > 0 ? `★ ${avg.toFixed(1)}` : "—"} />
        </div>
      </header>

      {/* 진행중 캠페인 */}
      <section>
        <h2 className="mb-3 text-lg font-bold">진행중 캠페인 ({openCampaigns.length})</h2>
        {openCampaigns.length === 0 ? (
          <EmptyState
            icon="🌱"
            title="진행중인 캠페인이 없어요"
            description="새 캠페인이 열리면 다시 확인해보세요."
            cta={{ href: "/campaigns", label: "전체 캠페인" }}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {openCampaigns.map((c) => (
              <CampaignCard
                key={c.id}
                c={c}
                favorited={favSet.has(c.id)}
                loggedIn={!!session}
              />
            ))}
          </div>
        )}
      </section>

      {/* 후기 샘플 */}
      {reviewSamples.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-bold">📣 인플루언서 후기</h2>
            <Link
              href={`/reviews?storeId=${adv.id}`}
              className="text-xs text-brand-600 hover:underline"
            >
              전체 후기 →
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {reviewSamples.map((r) => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="card p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold">{r.user.nickname}</div>
                  {r.rating && <StarRating rating={r.rating} size="sm" />}
                </div>
                <div className="mt-1 line-clamp-1 text-xs text-ink-500 dark:text-ink-400">
                  {r.campaign.title}
                </div>
                {r.highlight && (
                  <p className="mt-2 line-clamp-2 text-sm italic text-amber-900 dark:text-amber-300">
                    "{r.highlight}"
                  </p>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 종료된 캠페인 */}
      {closedCampaigns.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-bold text-ink-500">
            지난 캠페인 ({closedCampaigns.length})
          </h2>
          <div className="grid grid-cols-2 gap-3 opacity-70 sm:grid-cols-3 lg:grid-cols-4">
            {closedCampaigns.slice(0, 8).map((c) => (
              <CampaignCard
                key={c.id}
                c={c}
                favorited={favSet.has(c.id)}
                loggedIn={!!session}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink-50 p-3 text-center dark:bg-ink-900">
      <div className="text-[10px] text-ink-500 dark:text-ink-400">{label}</div>
      <div className="mt-1 text-base font-black text-ink-900 dark:text-ink-100">
        {value}
      </div>
    </div>
  );
}
