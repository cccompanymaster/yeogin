import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { fmtDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = await db.article.findUnique({ where: { slug } });
  if (!a) return { title: "글" };
  return {
    title: a.title,
    description: a.excerpt,
    openGraph: { title: a.title, description: a.excerpt, images: [a.coverImage] },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = await db.article.findUnique({ where: { slug } });
  if (!a || !a.publishedAt) notFound();

  const related = await db.article.findMany({
    where: {
      slug: { not: slug },
      category: a.category,
      publishedAt: { not: null, lte: new Date() },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link href="/magazine" className="text-xs text-ink-500">
        ← 매거진
      </Link>
      <div className="space-y-3">
        <span className="badge bg-brand-50 text-brand-700">
          {a.category === "TIPS" ? "노하우" : a.category === "NEWS" ? "소식" : "사례"}
        </span>
        <h1 className="text-3xl font-black leading-tight">{a.title}</h1>
        <p className="text-sm text-ink-500">
          {a.authorName} · {fmtDate(a.publishedAt)}
        </p>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={a.coverImage} alt="" className="card aspect-[16/9] w-full object-cover" />
      <div className="whitespace-pre-line text-base leading-relaxed text-ink-800 dark:text-ink-100">
        {a.body}
      </div>
      {related.length > 0 && (
        <section className="border-t border-ink-200 pt-6 dark:border-ink-700">
          <h2 className="mb-3 text-base font-bold">관련 글</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/magazine/${r.slug}`}
                className="card overflow-hidden hover:shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.coverImage} alt="" className="aspect-[16/10] w-full object-cover" />
                <div className="p-3">
                  <h3 className="line-clamp-2 text-sm font-bold">{r.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
