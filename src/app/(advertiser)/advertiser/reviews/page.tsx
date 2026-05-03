import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { fmtDate } from "@/lib/format";
import { RejectReviewForm } from "@/components/RejectReviewForm";

export default async function AdvertiserReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getAdvertiserSession();
  if (!session) redirect("/advertiser/login");
  const sp = await searchParams;

  const reviews = await db.review.findMany({
    where: { campaign: { advertiserId: session.id } },
    include: { campaign: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">리뷰 검수</h1>
      {sp.error && (
        <div className="card border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {decodeURIComponent(sp.error)}
        </div>
      )}
      {reviews.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">
          등록된 리뷰가 없습니다.
        </div>
      ) : (
        <div className="card divide-y divide-ink-100">
          {reviews.map((r) => (
            <div key={r.id} className="space-y-2 p-4">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-ink-500">{r.campaign.title}</div>
                  <a
                    href={r.url}
                    target="_blank"
                    className="line-clamp-1 text-sm font-bold text-brand-600 hover:underline"
                  >
                    {r.url}
                  </a>
                  <div className="text-[11px] text-ink-500">
                    {r.user.nickname} · {fmtDate(r.createdAt)}
                  </div>
                  {r.keywordCheck === "PASS" && (
                    <span className="badge mt-1 bg-emerald-50 text-emerald-700">
                      ✓ 키워드 자동검수 통과
                    </span>
                  )}
                  {r.keywordCheck === "WARN" && (
                    <span className="badge mt-1 bg-amber-50 text-amber-800">
                      ⚠ 키워드 누락: {r.missingKeys}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`badge ${
                      r.status === "APPROVED"
                        ? "bg-blue-500 text-white"
                        : r.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-ink-100 text-ink-700"
                    }`}
                  >
                    {r.status === "PENDING" ? "검수대기" : r.status === "APPROVED" ? "승인" : "반려"}
                  </span>
                  {r.status === "PENDING" && (
                    <>
                      <form action={`/api/advertiser/reviews/${r.id}`} method="post">
                        <input type="hidden" name="action" value="approve" />
                        <button className="btn-primary py-1.5">승인</button>
                      </form>
                      <RejectReviewForm reviewId={r.id} />
                    </>
                  )}
                  <Link
                    href={`/advertiser/campaigns/${r.campaignId}/applicants`}
                    className="btn-outline"
                  >
                    캠페인
                  </Link>
                </div>
              </div>
              {r.rejectReason && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                  <b>반려 사유:</b> {r.rejectReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
