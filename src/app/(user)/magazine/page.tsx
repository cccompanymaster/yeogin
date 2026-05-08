import Link from "next/link";
import { db } from "@/lib/db";
import { fmtDate } from "@/lib/format";

export const metadata = {
  title: "매거진 - 여긴",
  description: "체험단 노하우, 인플루언서 인터뷰, 광고주 사례까지 — 여긴 매거진",
};

const CAT_LABEL: Record<string, string> = {
  TIPS: "노하우",
  NEWS: "소식",
  CASE: "사례",
};

export default async function MagazineList({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const where: Record<string, unknown> = { publishedAt: { not: null, lte: new Date() } };
  if (sp.category) where.category = sp.category;

  const articles = await db.article.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    take: 30,
  });
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">📚 여긴 매거진</h1>
        <p className="mt-1 text-sm text-ink-500">
          체험단 노하우, 인플루언서 팁, 광고주 사례를 모았습니다.
        </p>
      </div>

      <div className="flex gap-1.5">
        <Link
          href="/magazine"
          className={`badge px-3 py-1.5 ${
            !sp.category
              ? "bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900"
              : "bg-white text-ink-700 ring-1 ring-ink-200 dark:bg-ink-800 dark:text-ink-200"
          }`}
        >
          전체
        </Link>
        {Object.entries(CAT_LABEL).map(([k, v]) => (
          <Link
            key={k}
            href={`/magazine?category=${k}`}
            className={`badge px-3 py-1.5 ${
              sp.category === k
                ? "bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900"
                : "bg-white text-ink-700 ring-1 ring-ink-200 dark:bg-ink-800 dark:text-ink-200"
            }`}
          >
            {v}
          </Link>
        ))}
      </div>

      {articles.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">
          아직 발행된 글이 없습니다.
        </div>
      ) : (
        <>
          {featured && (
            <Link
              href={`/magazine/${featured.slug}`}
              className="card group block overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="grid md:grid-cols-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featured.coverImage}
                  alt=""
                  className="aspect-[16/10] w-full object-cover md:aspect-auto md:h-full"
                />
                <div className="space-y-3 p-6">
                  <span className="badge bg-brand-50 text-brand-700">
                    {CAT_LABEL[featured.category] || featured.category}
                  </span>
                  <h2 className="text-xl font-black leading-tight">{featured.title}</h2>
                  <p className="line-clamp-3 text-sm text-ink-600 dark:text-ink-300">
                    {featured.excerpt}
                  </p>
                  <div className="text-[11px] text-ink-500">
                    {featured.authorName} · {fmtDate(featured.publishedAt!)}
                  </div>
                </div>
              </div>
            </Link>
          )}

          {rest.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((a) => (
                <Link
                  key={a.id}
                  href={`/magazine/${a.slug}`}
                  className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.coverImage}
                    alt=""
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <div className="space-y-2 p-4">
                    <span className="badge bg-brand-50 text-brand-700">
                      {CAT_LABEL[a.category] || a.category}
                    </span>
                    <h3 className="line-clamp-2 text-sm font-bold leading-tight">
                      {a.title}
                    </h3>
                    <p className="line-clamp-2 text-xs text-ink-600 dark:text-ink-300">
                      {a.excerpt}
                    </p>
                    <div className="text-[11px] text-ink-500">
                      {a.authorName} · {fmtDate(a.publishedAt!)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
