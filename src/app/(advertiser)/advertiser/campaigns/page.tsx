import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { TYPE_LABEL, fmtDate } from "@/lib/format";
import { promoteScheduledCampaigns } from "@/lib/campaign-publish";
import { EmptyState } from "@/components/EmptyState";

const STATUS_LABEL: Record<string, string> = {
  OPEN: "진행중",
  DRAFT: "임시저장",
  SCHEDULED: "예약 발행",
  CLOSED: "종료",
  COMPLETED: "완료",
};

const STATUS_COLOR: Record<string, string> = {
  OPEN: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  DRAFT: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  SCHEDULED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  CLOSED: "bg-ink-200 text-ink-600 dark:bg-ink-700 dark:text-ink-300",
  COMPLETED: "bg-ink-200 text-ink-600 dark:bg-ink-700 dark:text-ink-300",
};

export default async function AdvertiserCampaignsList({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getAdvertiserSession();
  if (!session) redirect("/advertiser/login");
  await promoteScheduledCampaigns();
  const sp = await searchParams;
  const filter = sp.status || "ALL";

  const where: { advertiserId: string; status?: string } = {
    advertiserId: session.id,
  };
  if (filter !== "ALL") where.status = filter;

  const [campaigns, counts] = await Promise.all([
    db.campaign.findMany({
      where,
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.campaign.groupBy({
      by: ["status"],
      where: { advertiserId: session.id },
      _count: { _all: true },
    }),
  ]);

  const total = counts.reduce((s, c) => s + c._count._all, 0);
  const countMap = new Map(counts.map((c) => [c.status, c._count._all]));

  const TABS: Array<{ key: string; label: string }> = [
    { key: "ALL", label: `전체 ${total}` },
    { key: "OPEN", label: `진행중 ${countMap.get("OPEN") ?? 0}` },
    { key: "DRAFT", label: `임시저장 ${countMap.get("DRAFT") ?? 0}` },
    { key: "SCHEDULED", label: `예약 ${countMap.get("SCHEDULED") ?? 0}` },
    { key: "CLOSED", label: `종료 ${(countMap.get("CLOSED") ?? 0) + (countMap.get("COMPLETED") ?? 0)}` },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">캠페인 관리</h1>
        <Link href="/advertiser/campaigns/new" className="btn-primary">
          + 새 캠페인
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "ALL" ? "/advertiser/campaigns" : `/advertiser/campaigns?status=${t.key}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              filter === t.key
                ? "bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900"
                : "border border-ink-300 bg-white text-ink-700 hover:bg-ink-100 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200 dark:hover:bg-ink-700"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {campaigns.length === 0 ? (
        <EmptyState
          icon="📭"
          title={
            filter === "ALL"
              ? "아직 등록된 캠페인이 없습니다"
              : `${STATUS_LABEL[filter] ?? filter} 캠페인이 없어요`
          }
          description="첫 캠페인을 등록하고 인플루언서에게 노출해보세요."
          cta={{ href: "/advertiser/campaigns/new", label: "캠페인 등록하기" }}
        />
      ) : (
        <div className="card divide-y divide-ink-100 dark:divide-ink-700">
          {campaigns.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.thumbnail} className="h-16 w-16 rounded-lg object-cover" alt="" />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-ink-500 dark:text-ink-400">
                  {TYPE_LABEL[c.type]} · {c.category} · ~{fmtDate(c.applyEnd)}
                  {c.publishAt && c.status === "SCHEDULED" && (
                    <span className="ml-1 text-blue-600 dark:text-blue-400">
                      · 예약: {fmtDate(c.publishAt)}
                    </span>
                  )}
                </div>
                <div className="line-clamp-1 text-sm font-bold">{c.title}</div>
                <div className="text-xs text-ink-500 dark:text-ink-400">
                  신청자 {c._count.applications}명 / 모집 {c.capacity}명
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`badge ${STATUS_COLOR[c.status] || "bg-ink-100 text-ink-700"}`}>
                  {STATUS_LABEL[c.status] || c.status}
                </span>
                <div className="flex flex-wrap justify-end gap-1">
                  {c.status !== "DRAFT" && (
                    <Link
                      href={`/advertiser/campaigns/${c.id}/applicants`}
                      className="badge bg-ink-100 text-ink-700 hover:bg-ink-200 dark:bg-ink-700 dark:text-ink-200"
                    >
                      신청자
                    </Link>
                  )}
                  <Link
                    href={`/advertiser/campaigns/${c.id}/edit`}
                    className="badge bg-ink-100 text-ink-700 hover:bg-ink-200 dark:bg-ink-700 dark:text-ink-200"
                  >
                    수정
                  </Link>
                  <form action={`/api/advertiser/campaigns/${c.id}`} method="post">
                    <input type="hidden" name="action" value="duplicate" />
                    <button className="badge bg-ink-100 text-ink-700 hover:bg-ink-200 dark:bg-ink-700 dark:text-ink-200">
                      복제
                    </button>
                  </form>
                  {(c.status === "OPEN" || c.status === "SCHEDULED") && (
                    <form action={`/api/advertiser/campaigns/${c.id}`} method="post">
                      <input type="hidden" name="action" value="close" />
                      <button className="badge bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300">
                        종료
                      </button>
                    </form>
                  )}
                  {c.status === "DRAFT" && (
                    <form action={`/api/advertiser/campaigns/${c.id}/publish`} method="post">
                      <button className="badge bg-brand-500 text-white hover:bg-brand-600">
                        발행
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
