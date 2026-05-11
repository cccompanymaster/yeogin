import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { StarRating } from "@/components/StarRating";
import { ReviewModal } from "@/components/ReviewModal";
import { CHANNEL_LABEL, TYPE_LABEL, REVIEW_STATUS_LABEL } from "@/lib/format";
import { relativeTime } from "@/lib/relative";
import { EmptyState } from "@/components/EmptyState";

export const metadata = { title: "내 작성 후기 - 여긴" };

export default async function MyReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");
  const sp = await searchParams;
  const filter = sp.status || "ALL";

  const where: { userId: string; status?: string } = { userId: session.id };
  if (filter !== "ALL") where.status = filter;

  const [reviews, counts] = await Promise.all([
    db.review.findMany({
      where,
      include: {
        campaign: {
          include: { advertiser: { select: { companyName: true } } },
        },
        application: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.review.groupBy({
      by: ["status"],
      where: { userId: session.id },
      _count: { _all: true },
    }),
  ]);

  const total = counts.reduce((s, c) => s + c._count._all, 0);
  const cMap = new Map(counts.map((c) => [c.status, c._count._all]));

  const TABS = [
    { key: "ALL", label: `전체 ${total}` },
    { key: "PENDING", label: `검수대기 ${cMap.get("PENDING") ?? 0}` },
    { key: "APPROVED", label: `승인 ${cMap.get("APPROVED") ?? 0}` },
    { key: "REJECTED", label: `반려 ${cMap.get("REJECTED") ?? 0}` },
  ];

  const avgRating =
    reviews.filter((r) => r.status === "APPROVED" && r.rating).length > 0
      ? reviews
          .filter((r) => r.status === "APPROVED" && r.rating)
          .reduce((s, r) => s + (r.rating || 0), 0) /
        reviews.filter((r) => r.status === "APPROVED" && r.rating).length
      : 0;

  const approved = reviews.filter((r) => r.status === "APPROVED").length;
  const rejected = reviews.filter((r) => r.status === "REJECTED").length;
  const approvalRate = approved + rejected > 0 ? Math.round((approved / (approved + rejected)) * 100) : 0;

  return (
    <div className="space-y-5">
      <div>
        <Link href="/mypage" className="text-xs text-ink-500">
          ← 마이페이지
        </Link>
        <h1 className="mt-1 text-2xl font-bold">📝 내 작성 후기</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="총 작성" value={`${total}건`} />
        <Stat label="승인" value={`${approved}건`} tone="brand" />
        <Stat label="승인률" value={`${approvalRate}%`} />
        <Stat
          label="평균 별점"
          value={avgRating > 0 ? `★ ${avgRating.toFixed(1)}` : "—"}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "ALL" ? "/mypage/reviews" : `/mypage/reviews?status=${t.key}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              filter === t.key
                ? "bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900"
                : "border border-ink-300 bg-white text-ink-700 hover:bg-ink-100 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon="📝"
          title={filter === "ALL" ? "아직 작성한 후기가 없습니다" : "해당 상태의 후기가 없어요"}
          description="캠페인 선정 후 리뷰를 등록하면 여기에 표시돼요."
          cta={{ href: "/campaigns", label: "캠페인 둘러보기" }}
        />
      ) : (
        <div className="space-y-2">
          {reviews.map((r) => {
            const statusStyle =
              r.status === "APPROVED"
                ? "bg-emerald-500 text-white"
                : r.status === "REJECTED"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";

            return (
              <div key={r.id} className="card space-y-2 p-3">
                <div className="flex items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.campaign.thumbnail}
                    alt=""
                    className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-ink-500 dark:text-ink-400">
                      <span>{TYPE_LABEL[r.campaign.type]}</span>
                      <span>·</span>
                      <span>{CHANNEL_LABEL[r.campaign.channel]}</span>
                      <span>·</span>
                      <span>{r.campaign.advertiser.companyName}</span>
                    </div>
                    <Link
                      href={`/campaigns/${r.campaign.id}`}
                      className="line-clamp-1 text-sm font-bold hover:text-brand-600"
                    >
                      {r.campaign.title}
                    </Link>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-500 dark:text-ink-400">
                      {r.rating && <StarRating rating={r.rating} size="sm" />}
                      <span>{relativeTime(r.createdAt)}</span>
                    </div>
                    {r.highlight && (
                      <p className="mt-1 line-clamp-2 text-xs italic text-amber-900 dark:text-amber-300">
                        "{r.highlight}"
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`badge ${statusStyle}`}>
                      {REVIEW_STATUS_LABEL[r.status] || r.status}
                    </span>
                    <a
                      href={r.url}
                      target="_blank"
                      className="text-[11px] text-brand-600 hover:underline"
                    >
                      원본 ↗
                    </a>
                    {r.status === "REJECTED" && r.application && (
                      <ReviewModal applicationId={r.application.id} />
                    )}
                  </div>
                </div>
                {r.status === "REJECTED" && r.rejectReason && (
                  <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    <b>반려 사유:</b> {r.rejectReason}
                  </div>
                )}
                {r.keywordCheck === "WARN" && r.missingKeys && (
                  <div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    ⚠ 키워드 누락: {r.missingKeys}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "brand";
}) {
  const color = tone === "brand" ? "text-brand-600 dark:text-brand-400" : "";
  return (
    <div className="card p-3">
      <div className="text-[10px] text-ink-500 dark:text-ink-400">{label}</div>
      <div className={`mt-1 text-base font-black ${color}`}>{value}</div>
    </div>
  );
}
