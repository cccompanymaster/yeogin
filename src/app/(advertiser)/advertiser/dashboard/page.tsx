import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { TYPE_LABEL, fmtDate } from "@/lib/format";

export default async function AdvertiserDashboard() {
  const session = await getAdvertiserSession();
  if (!session) redirect("/advertiser/login");

  const campaigns = await db.campaign.findMany({
    where: { advertiserId: session.id },
    include: {
      _count: { select: { applications: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalApplied = campaigns.reduce((s, c) => s + c.appliedCount, 0);
  const openCount = campaigns.filter((c) => c.status === "OPEN").length;
  const pendingReviews = await db.review.count({
    where: { status: "PENDING", campaign: { advertiserId: session.id } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="mt-1 text-sm text-ink-500">{session.name}</p>
        </div>
        <Link href="/advertiser/campaigns/new" className="btn-primary">
          + 캠페인 등록
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="진행중 캠페인" value={`${openCount}`} />
        <Stat label="총 캠페인" value={`${campaigns.length}`} />
        <Stat label="총 신청자" value={`${totalApplied}`} />
        <Stat label="검수 대기 리뷰" value={`${pendingReviews}`} />
      </div>

      <div>
        <h2 className="mb-3 text-base font-bold">최근 캠페인</h2>
        {campaigns.length === 0 ? (
          <div className="card p-10 text-center text-sm text-ink-500">
            아직 등록된 캠페인이 없습니다.
            <div className="mt-3">
              <Link href="/advertiser/campaigns/new" className="btn-primary">
                첫 캠페인 등록하기
              </Link>
            </div>
          </div>
        ) : (
          <div className="card divide-y divide-ink-100">
            {campaigns.slice(0, 8).map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.thumbnail} className="h-14 w-14 rounded-lg object-cover" alt="" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-ink-500">
                    <span>{TYPE_LABEL[c.type]}</span>
                    <span>·</span>
                    <span>{c.status === "OPEN" ? "진행중" : "종료"}</span>
                    <span>·</span>
                    <span>~{fmtDate(c.applyEnd)}</span>
                  </div>
                  <Link
                    href={`/advertiser/campaigns/${c.id}/applicants`}
                    className="line-clamp-1 text-sm font-bold hover:text-brand-600"
                  >
                    {c.title}
                  </Link>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs">
                  <span className="font-semibold text-ink-800">
                    {c._count.applications} / {c.capacity}명
                  </span>
                  <Link
                    href={`/advertiser/campaigns/${c.id}/applicants`}
                    className="text-brand-600 hover:underline"
                  >
                    신청자 보기 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-ink-500">{label}</div>
      <div className="mt-1 text-2xl font-black text-ink-900">{value}</div>
    </div>
  );
}
