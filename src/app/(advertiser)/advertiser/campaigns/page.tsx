import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { TYPE_LABEL, fmtDate } from "@/lib/format";

export default async function AdvertiserCampaignsList() {
  const session = await getAdvertiserSession();
  if (!session) redirect("/advertiser/login");

  const campaigns = await db.campaign.findMany({
    where: { advertiserId: session.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">캠페인 관리</h1>
        <Link href="/advertiser/campaigns/new" className="btn-primary">
          + 새 캠페인
        </Link>
      </div>
      {campaigns.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">
          캠페인이 없습니다.
        </div>
      ) : (
        <div className="card divide-y divide-ink-100">
          {campaigns.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.thumbnail} className="h-16 w-16 rounded-lg object-cover" alt="" />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-ink-500">
                  {TYPE_LABEL[c.type]} · {c.category} · ~{fmtDate(c.applyEnd)}
                </div>
                <div className="text-sm font-bold">{c.title}</div>
                <div className="text-xs text-ink-500">
                  신청자 {c._count.applications}명 / 모집 {c.capacity}명
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/advertiser/campaigns/${c.id}/applicants`}
                  className="btn-outline"
                >
                  신청자
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
