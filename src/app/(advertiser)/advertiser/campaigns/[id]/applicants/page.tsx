import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { STATUS_LABEL, TRUST_LABEL, fmtDate } from "@/lib/format";
import { PenaltyMenu } from "@/components/PenaltyMenu";

export default async function ApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdvertiserSession();
  if (!session) redirect("/advertiser/login");
  const { id } = await params;

  const campaign = await db.campaign.findUnique({
    where: { id },
    include: {
      applications: {
        include: { user: true, review: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!campaign || campaign.advertiserId !== session.id) notFound();

  return (
    <div className="space-y-5">
      <div>
        <Link href="/advertiser/campaigns" className="text-xs text-ink-500">
          ← 캠페인 목록
        </Link>
        <h1 className="mt-1 text-2xl font-bold">{campaign.title}</h1>
        <div className="mt-1 text-sm text-ink-500">
          신청 {campaign.applications.length}명 / 모집 {campaign.capacity}명
        </div>
      </div>

      {campaign.applications.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">
          아직 신청자가 없습니다.
        </div>
      ) : (
        <div className="card divide-y divide-ink-100">
          {campaign.applications.map((a) => (
            <div key={a.id} className="flex items-start gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{a.user.nickname}</span>
                  <span className="badge bg-ink-100 text-ink-700">
                    {TRUST_LABEL[a.user.trustGrade]}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-ink-500">
                  {a.user.email} · 신청일 {fmtDate(a.createdAt)}
                </div>
                <a
                  href={a.channelUrl}
                  target="_blank"
                  className="mt-1 line-clamp-1 block text-xs text-brand-600 hover:underline"
                >
                  {a.channelUrl}
                </a>
                {a.message && (
                  <p className="mt-2 line-clamp-3 rounded-md bg-ink-50 p-2 text-xs text-ink-700">
                    {a.message}
                  </p>
                )}
                {a.review && (
                  <div className="mt-2 flex items-center gap-2 text-[11px]">
                    <span className="badge bg-emerald-50 text-emerald-700">
                      리뷰 등록됨
                    </span>
                    <a
                      href={a.review.url}
                      target="_blank"
                      className="text-brand-600 hover:underline"
                    >
                      {a.review.url}
                    </a>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={a.status} />
                {a.status === "PENDING" && (
                  <div className="flex gap-1">
                    <form action={`/api/advertiser/applications/${a.id}`} method="post">
                      <input type="hidden" name="action" value="select" />
                      <button className="badge bg-emerald-500 text-white hover:bg-emerald-600">
                        선정
                      </button>
                    </form>
                    <form action={`/api/advertiser/applications/${a.id}`} method="post">
                      <input type="hidden" name="action" value="reject" />
                      <button className="badge bg-ink-200 text-ink-700 hover:bg-ink-300">
                        미선정
                      </button>
                    </form>
                  </div>
                )}
                {a.review && a.review.status === "PENDING" && (
                  <div className="flex gap-1">
                    <form action={`/api/advertiser/reviews/${a.review.id}`} method="post">
                      <input type="hidden" name="action" value="approve" />
                      <button className="badge bg-blue-500 text-white">검수승인</button>
                    </form>
                  </div>
                )}
                {(a.status === "SELECTED" || a.status === "COMPLETED") && (
                  <PenaltyMenu applicationId={a.id} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-ink-100 text-ink-700",
    SELECTED: "bg-emerald-500 text-white",
    REJECTED: "bg-ink-200 text-ink-500",
    COMPLETED: "bg-blue-500 text-white",
  };
  return <span className={`badge ${map[status]}`}>{STATUS_LABEL[status]}</span>;
}
