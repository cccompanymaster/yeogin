import Link from "next/link";
import { db } from "@/lib/db";
import { StarRating } from "@/components/StarRating";
import { ReviewHeartButton } from "@/components/ReviewHeartButton";
import { CHANNEL_LABEL, TYPE_LABEL } from "@/lib/format";
import { relativeTime } from "@/lib/relative";
import { getUserSession } from "@/lib/session";

export const metadata = {
  title: "체험 후기 - 여긴",
  description: "여긴에서 진행된 캠페인의 솔직한 체험 후기를 확인하세요.",
};

export default async function ReviewsGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const where: Record<string, unknown> = { status: "APPROVED" };
  if (sp.category) where.campaign = { category: sp.category };

  const orderBy =
    sp.sort === "rating"
      ? [{ rating: "desc" as const }, { createdAt: "desc" as const }]
      : { createdAt: "desc" as const };

  const [reviews, session] = await Promise.all([
    db.review.findMany({
      where,
      include: { campaign: true, user: { select: { nickname: true, heartCount: true } } },
      orderBy,
      take: 60,
    }),
    getUserSession(),
  ]);

  const cats = ["맛집", "카페", "뷰티", "패션", "식품", "생활", "디지털", "여행", "육아"];
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📣 진짜 체험 후기</h1>
        <p className="mt-1 text-sm text-ink-500">
          여긴에서 진행된 캠페인의 솔직한 후기 모음 — 평균 별점{" "}
          <b className="text-amber-500">{avg.toFixed(1)}점</b>
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Link
          href="/reviews"
          className={`badge px-2.5 py-1 ${!sp.category ? "bg-ink-900 text-white" : "bg-white text-ink-700 ring-1 ring-ink-200"}`}
        >
          전체
        </Link>
        {cats.map((c) => (
          <Link
            key={c}
            href={`/reviews?category=${encodeURIComponent(c)}${sp.sort ? `&sort=${sp.sort}` : ""}`}
            className={`badge px-2.5 py-1 ${
              sp.category === c
                ? "bg-ink-900 text-white"
                : "bg-white text-ink-700 ring-1 ring-ink-200"
            }`}
          >
            {c}
          </Link>
        ))}
        <div className="ml-auto flex gap-2 text-xs">
          <Link
            href={{ pathname: "/reviews", query: { ...sp, sort: "latest" } }}
            className={!sp.sort || sp.sort === "latest" ? "font-bold text-brand-600" : "text-ink-500"}
          >
            최신순
          </Link>
          <Link
            href={{ pathname: "/reviews", query: { ...sp, sort: "rating" } }}
            className={sp.sort === "rating" ? "font-bold text-brand-600" : "text-ink-500"}
          >
            별점순
          </Link>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">
          아직 등록된 후기가 없습니다.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {reviews.map((r) => (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="card flex gap-3 overflow-hidden p-3 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.campaign.thumbnail}
                alt=""
                className="h-24 w-24 flex-shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] text-ink-500">
                  <span>{TYPE_LABEL[r.campaign.type]}</span>
                  <span>·</span>
                  <span>{CHANNEL_LABEL[r.campaign.channel]}</span>
                  <span>·</span>
                  <span>{r.campaign.category}</span>
                </div>
                <Link
                  href={`/campaigns/${r.campaign.id}`}
                  className="line-clamp-1 text-sm font-bold hover:text-brand-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  {r.campaign.title}
                </Link>
                {r.rating && (
                  <div className="mt-1">
                    <StarRating rating={r.rating} size="sm" />
                  </div>
                )}
                {r.highlight && (
                  <p className="mt-1.5 line-clamp-2 rounded-md bg-amber-50 px-2 py-1 text-xs italic text-amber-900">
                    “{r.highlight}”
                  </p>
                )}
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-ink-500 dark:text-ink-400">
                  <span>{r.user.nickname} · {relativeTime(r.createdAt)}</span>
                  <ReviewHeartButton reviewId={r.id} loggedIn={!!session} />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
