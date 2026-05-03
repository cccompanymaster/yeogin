import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { TYPE_LABEL, fmtDate } from "@/lib/format";
import { BarChart, HBarChart } from "@/components/charts";

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

  // 최근 14일 일별 신청 건수
  const since = new Date(Date.now() - 13 * 86400000);
  since.setHours(0, 0, 0, 0);
  const recentApps = await db.application.findMany({
    where: {
      campaign: { advertiserId: session.id },
      createdAt: { gte: since },
    },
    select: { createdAt: true },
  });
  const dayBuckets: { label: string; value: number; key: string }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    dayBuckets.push({ label, value: 0, key });
  }
  for (const r of recentApps) {
    const d = new Date(r.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const b = dayBuckets.find((x) => x.key === key);
    if (b) b.value += 1;
  }

  // 카테고리별 신청자 수
  const catMap = new Map<string, number>();
  for (const c of campaigns) {
    catMap.set(c.category, (catMap.get(c.category) || 0) + c.appliedCount);
  }
  const catData = Array.from(catMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // 캠페인 타입별 분포
  const typeMap = new Map<string, number>();
  for (const c of campaigns) {
    typeMap.set(c.type, (typeMap.get(c.type) || 0) + 1);
  }
  const typeData = Array.from(typeMap.entries()).map(([k, v]) => ({
    label: TYPE_LABEL[k] || k,
    value: v,
  }));

  // 캠페인별 신청률 (top 5)
  const ratioData = campaigns
    .filter((c) => c.capacity > 0)
    .map((c) => ({
      label: c.title.length > 14 ? c.title.slice(0, 14) + "…" : c.title,
      value: Math.round((c.appliedCount / c.capacity) * 100),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

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

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-bold">최근 14일 일별 신청</h2>
            <span className="text-xs text-ink-500">총 {recentApps.length}건</span>
          </div>
          <BarChart data={dayBuckets.map(({ label, value }) => ({ label, value }))} />
        </div>
        <div className="card p-5">
          <h2 className="mb-3 text-base font-bold">카테고리별 신청자</h2>
          {catData.length > 0 ? (
            <HBarChart data={catData} />
          ) : (
            <div className="py-8 text-center text-sm text-ink-500">데이터 없음</div>
          )}
        </div>
        <div className="card p-5">
          <h2 className="mb-3 text-base font-bold">캠페인 타입 분포</h2>
          {typeData.length > 0 ? (
            <HBarChart data={typeData} color="#0ea5e9" />
          ) : (
            <div className="py-8 text-center text-sm text-ink-500">데이터 없음</div>
          )}
        </div>
        <div className="card p-5">
          <h2 className="mb-3 text-base font-bold">캠페인별 신청률 TOP 5</h2>
          {ratioData.length > 0 ? (
            <HBarChart
              data={ratioData}
              color="#10b981"
              formatValue={(v) => `${v}%`}
            />
          ) : (
            <div className="py-8 text-center text-sm text-ink-500">데이터 없음</div>
          )}
        </div>
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
