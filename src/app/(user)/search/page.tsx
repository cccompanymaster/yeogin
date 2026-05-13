import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { CampaignCard } from "@/components/CampaignCard";
import { EmptyState } from "@/components/EmptyState";
import { getUserSession } from "@/lib/session";
import { fmtDate } from "@/lib/format";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `"${q}" 검색 결과 · 여긴` : "통합 검색 · 여긴",
    description: "캠페인·매장·매거진·태그를 한 번에 검색하세요.",
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  if (!q) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon="🔎"
          title="검색어를 입력해주세요"
          description="캠페인 제목·태그·매장·매거진 글을 한 번에 찾아드려요."
          cta={{ href: "/campaigns", label: "전체 캠페인 보기" }}
        />
      </div>
    );
  }

  const [campaigns, advertisers, articles] = await Promise.all([
    db.campaign.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { tags: { contains: q } },
          { category: { contains: q } },
          { region: { contains: q } },
        ],
        status: { in: ["OPEN", "CLOSED"] },
      },
      orderBy: [{ status: "asc" }, { applyEnd: "asc" }],
      take: 12,
    }),
    db.advertiser.findMany({
      where: { companyName: { contains: q } },
      take: 6,
      include: {
        _count: { select: { campaigns: true } },
      },
    }),
    db.article.findMany({
      where: {
        publishedAt: { not: null, lte: new Date() },
        OR: [
          { title: { contains: q } },
          { excerpt: { contains: q } },
          { body: { contains: q } },
        ],
      },
      orderBy: { publishedAt: "desc" },
      take: 4,
    }),
  ]);

  const session = await getUserSession();
  let favSet = new Set<string>();
  if (session && campaigns.length > 0) {
    const favs = await db.favorite.findMany({
      where: { userId: session.id, campaignId: { in: campaigns.map((c) => c.id) } },
      select: { campaignId: true },
    });
    favSet = new Set(favs.map((f) => f.campaignId));
  }

  const total = campaigns.length + advertisers.length + articles.length;

  return (
    <div className="space-y-8">
      <header>
        <div className="text-xs font-semibold text-brand-600">SEARCH</div>
        <h1 className="text-2xl font-black">
          &ldquo;<span className="text-brand-600">{q}</span>&rdquo; 검색 결과
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          캠페인 {campaigns.length} · 매장 {advertisers.length} · 매거진 {articles.length}
          {" "}
          (총 {total}건)
        </p>
      </header>

      {total === 0 && (
        <EmptyState
          icon="🌫️"
          title="검색 결과가 없습니다"
          description="다른 키워드로 시도하거나 인기 캠페인을 둘러보세요."
          cta={{ href: "/campaigns", label: "전체 캠페인" }}
        />
      )}

      {/* 캠페인 */}
      {campaigns.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-bold">🎁 캠페인 {campaigns.length}건</h2>
            <Link
              href={`/campaigns?q=${encodeURIComponent(q)}`}
              className="text-xs text-brand-600 hover:underline"
            >
              전체 캠페인에서 검색 →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {campaigns.map((c) => (
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

      {/* 매장 */}
      {advertisers.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">🏪 매장 {advertisers.length}곳</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {advertisers.map((a) => (
              <Link
                key={a.id}
                href={`/store/${a.id}`}
                className="card flex items-center justify-between p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="min-w-0">
                  <div className="truncate text-base font-bold">{a.companyName}</div>
                  <div className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
                    캠페인 {a._count.campaigns}건 · 가입 {fmtDate(a.createdAt)}
                  </div>
                </div>
                <span className="text-brand-600">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 매거진 */}
      {articles.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">📰 매거진 {articles.length}편</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {articles.map((a) => (
              <Link
                key={a.id}
                href={`/magazine/${a.slug}`}
                className="card overflow-hidden transition hover:shadow-md"
              >
                <div className="flex gap-3 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.coverImage}
                    alt=""
                    className="aspect-[4/3] w-24 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-bold">{a.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-ink-500 dark:text-ink-400">
                      {a.excerpt}
                    </p>
                    <div className="mt-1.5 text-[10px] text-ink-400">
                      {a.authorName} · {a.publishedAt ? fmtDate(a.publishedAt) : ""}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
