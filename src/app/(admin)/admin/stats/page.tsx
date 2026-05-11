import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { BarChart, DonutChart, HBarChart, LineChart } from "@/components/charts";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "관리자 통계 · 여긴" };

const CATEGORY_COLORS: Record<string, string> = {
  맛집: "#f97316",
  카페: "#a78bfa",
  뷰티: "#ec4899",
  패션: "#06b6d4",
  식품: "#22c55e",
  생활: "#eab308",
  디지털: "#3b82f6",
  여행: "#14b8a6",
  육아: "#f43f5e",
};

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminStatsPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");
  if (!isAdminEmail(session.email)) {
    return (
      <div className="card p-10 text-center">
        <h1 className="text-lg font-bold">접근 권한이 없습니다</h1>
        <Link href="/" className="btn-outline mt-4 inline-flex">홈으로</Link>
      </div>
    );
  }

  const since30 = daysAgo(29);

  const [
    totalUsers,
    newUsers30,
    totalAdvertisers,
    newAdvertisers30,
    totalCampaigns,
    openCampaigns,
    completedCampaigns,
    totalApplications,
    selectedApplications,
    totalReviews,
    approvedReviews,
    pendingReviews,
    totalReports,
    openReports,
    totalQuestions,
    totalNotices,
    snsPending,
    campaignsByCategory,
    campaignsByType,
    usersGradeGroup,
    recentUsers,
    recentCampaigns,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: since30 } } }),
    db.advertiser.count(),
    db.advertiser.count({ where: { createdAt: { gte: since30 } } }),
    db.campaign.count(),
    db.campaign.count({ where: { status: "OPEN" } }),
    db.campaign.count({ where: { status: "COMPLETED" } }),
    db.application.count(),
    db.application.count({ where: { status: { in: ["SELECTED", "COMPLETED"] } } }),
    db.review.count(),
    db.review.count({ where: { status: "APPROVED" } }),
    db.review.count({ where: { status: "PENDING" } }),
    db.report.count(),
    db.report.count({ where: { status: "OPEN" } }),
    db.question.count(),
    db.notice.count(),
    db.snsVerification.count({ where: { status: "PENDING" } }),
    db.campaign.groupBy({ by: ["category"], _count: { _all: true } }),
    db.campaign.groupBy({ by: ["type"], _count: { _all: true } }),
    db.user.groupBy({ by: ["trustGrade"], _count: { _all: true } }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, nickname: true, email: true, createdAt: true, trustGrade: true },
    }),
    db.campaign.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { advertiser: { select: { companyName: true } } },
    }),
  ]);

  // 최근 30일 일별 신규가입 추이
  const dayBuckets: { label: string; users: number; campaigns: number; apps: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = daysAgo(i);
    const next = daysAgo(i - 1);
    dayBuckets.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      users: 0,
      campaigns: 0,
      apps: 0,
    });
    // placeholder; we'll fill below
    void next;
  }

  const [recentUsersAll, recentCampaignsAll, recentAppsAll] = await Promise.all([
    db.user.findMany({ where: { createdAt: { gte: since30 } }, select: { createdAt: true } }),
    db.campaign.findMany({
      where: { createdAt: { gte: since30 } },
      select: { createdAt: true },
    }),
    db.application.findMany({
      where: { createdAt: { gte: since30 } },
      select: { createdAt: true },
    }),
  ]);

  const bucketIndex = (d: Date) => {
    const ms = d.getTime() - since30.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  };
  recentUsersAll.forEach((u) => {
    const i = bucketIndex(u.createdAt);
    if (i >= 0 && i < dayBuckets.length) dayBuckets[i].users++;
  });
  recentCampaignsAll.forEach((c) => {
    const i = bucketIndex(c.createdAt);
    if (i >= 0 && i < dayBuckets.length) dayBuckets[i].campaigns++;
  });
  recentAppsAll.forEach((a) => {
    const i = bucketIndex(a.createdAt);
    if (i >= 0 && i < dayBuckets.length) dayBuckets[i].apps++;
  });

  const catData = campaignsByCategory
    .map((g) => ({
      label: g.category,
      value: g._count._all,
      color: CATEGORY_COLORS[g.category] || "#94a3b8",
    }))
    .sort((a, b) => b.value - a.value);

  const typeLabel: Record<string, string> = {
    VISIT: "방문",
    DELIVERY: "배송",
    PURCHASE: "구매",
    REPORTER: "기자단",
  };
  const typeData = campaignsByType
    .map((g) => ({ label: typeLabel[g.type] || g.type, value: g._count._all }))
    .sort((a, b) => b.value - a.value);

  const selectionRate =
    totalApplications > 0 ? Math.round((selectedApplications / totalApplications) * 100) : 0;
  const reviewRate =
    selectedApplications > 0 ? Math.round((approvedReviews / selectedApplications) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold text-brand-600">ADMIN</div>
        <h1 className="text-2xl font-bold">사이트 종합 통계</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          최근 30일 데이터를 기준으로 사이트 전반의 지표를 확인하세요.
        </p>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="전체 사용자" value={totalUsers} delta={`+${newUsers30} (30일)`} accent="brand" />
        <Kpi label="전체 광고주" value={totalAdvertisers} delta={`+${newAdvertisers30} (30일)`} accent="sky" />
        <Kpi label="진행중 캠페인" value={openCampaigns} delta={`총 ${totalCampaigns}건`} accent="emerald" />
        <Kpi label="신청 → 선정률" value={`${selectionRate}%`} delta={`${selectedApplications}/${totalApplications}`} accent="amber" />
        <Kpi label="후기 등록률" value={`${reviewRate}%`} delta={`${approvedReviews}/${selectedApplications}`} accent="pink" />
        <Kpi label="대기 후기" value={pendingReviews} delta="검수 필요" accent="amber" />
        <Kpi label="미처리 신고" value={openReports} delta={`총 ${totalReports}건`} accent="red" />
        <Kpi label="SNS 인증 대기" value={snsPending} delta="검수 필요" accent="violet" />
      </div>

      {/* 30일 추이 라인 차트 */}
      <section className="card p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-bold">📈 최근 30일 활동 추이</h2>
          <span className="text-[11px] text-ink-500 dark:text-ink-400">
            신규가입 · 캠페인 · 신청
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="mb-1 text-xs font-semibold text-brand-600">신규 사용자</div>
            <LineChart
              data={dayBuckets.map((d) => ({ label: d.label, value: d.users }))}
              color="#f97316"
              height={140}
            />
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold text-sky-600">신규 캠페인</div>
            <LineChart
              data={dayBuckets.map((d) => ({ label: d.label, value: d.campaigns }))}
              color="#0ea5e9"
              height={140}
            />
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold text-emerald-600">신청 건수</div>
            <LineChart
              data={dayBuckets.map((d) => ({ label: d.label, value: d.apps }))}
              color="#10b981"
              height={140}
            />
          </div>
        </div>
      </section>

      {/* 카테고리 분포 + 타입 분포 */}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 text-base font-bold">🍱 카테고리 분포</h2>
          {catData.length > 0 ? (
            <DonutChart data={catData} />
          ) : (
            <div className="text-sm text-ink-500">데이터가 없습니다.</div>
          )}
        </section>
        <section className="card p-5">
          <h2 className="mb-3 text-base font-bold">📦 캠페인 타입</h2>
          {typeData.length > 0 ? (
            <BarChart data={typeData} color="#a78bfa" height={160} />
          ) : (
            <div className="text-sm text-ink-500">데이터가 없습니다.</div>
          )}
        </section>
      </div>

      {/* 등급 분포 + 컨텐츠 현황 */}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 text-base font-bold">🏅 사용자 등급 분포</h2>
          <HBarChart
            data={usersGradeGroup
              .map((g) => ({ label: g.trustGrade, value: g._count._all }))
              .sort((a, b) => b.value - a.value)}
            color="#f97316"
          />
        </section>
        <section className="card p-5">
          <h2 className="mb-3 text-base font-bold">📚 컨텐츠 현황</h2>
          <ul className="space-y-2 text-sm">
            <Row label="공지 등록" value={`${totalNotices}건`} href="/admin/notices" />
            <Row label="Q&A 등록" value={`${totalQuestions}건`} href="/admin/questions" />
            <Row label="후기 (승인/전체)" value={`${approvedReviews}/${totalReviews}건`} />
            <Row label="완료 캠페인" value={`${completedCampaigns}건`} />
            <Row label="신고 (미처리/전체)" value={`${openReports}/${totalReports}건`} href="/admin" />
          </ul>
        </section>
      </div>

      {/* 최근 가입자 + 최근 캠페인 */}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 text-base font-bold">👥 최근 가입자</h2>
          <ul className="divide-y divide-ink-100 dark:divide-ink-700">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-2 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{u.nickname}</div>
                  <div className="truncate text-[11px] text-ink-500">{u.email}</div>
                </div>
                <span className="badge bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-200">
                  {u.trustGrade}
                </span>
                <span className="ml-2 text-[11px] text-ink-500">
                  {fmtDate(u.createdAt)}
                </span>
              </li>
            ))}
            {recentUsers.length === 0 && (
              <li className="py-3 text-center text-sm text-ink-500">데이터가 없습니다.</li>
            )}
          </ul>
        </section>
        <section className="card p-5">
          <h2 className="mb-3 text-base font-bold">🆕 최근 캠페인</h2>
          <ul className="divide-y divide-ink-100 dark:divide-ink-700">
            {recentCampaigns.map((c) => (
              <li key={c.id} className="py-2 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className={`badge ${
                      c.status === "OPEN"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-ink-100 text-ink-700"
                    }`}
                  >
                    {c.status}
                  </span>
                  <Link
                    href={`/campaigns/${c.id}`}
                    target="_blank"
                    className="min-w-0 flex-1 truncate font-semibold hover:underline"
                  >
                    {c.title}
                  </Link>
                </div>
                <div className="mt-1 truncate text-[11px] text-ink-500">
                  {c.advertiser.companyName} · {c.category} · {fmtDate(c.createdAt)}
                </div>
              </li>
            ))}
            {recentCampaigns.length === 0 && (
              <li className="py-3 text-center text-sm text-ink-500">데이터가 없습니다.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

const ACCENT: Record<string, string> = {
  brand: "from-brand-50 to-white text-brand-700 dark:from-brand-900/30 dark:to-ink-800",
  sky: "from-sky-50 to-white text-sky-700 dark:from-sky-900/30 dark:to-ink-800",
  emerald: "from-emerald-50 to-white text-emerald-700 dark:from-emerald-900/30 dark:to-ink-800",
  amber: "from-amber-50 to-white text-amber-700 dark:from-amber-900/30 dark:to-ink-800",
  pink: "from-pink-50 to-white text-pink-700 dark:from-pink-900/30 dark:to-ink-800",
  red: "from-red-50 to-white text-red-700 dark:from-red-900/30 dark:to-ink-800",
  violet: "from-violet-50 to-white text-violet-700 dark:from-violet-900/30 dark:to-ink-800",
};

function Kpi({
  label,
  value,
  delta,
  accent = "brand",
}: {
  label: string;
  value: string | number;
  delta?: string;
  accent?: keyof typeof ACCENT;
}) {
  return (
    <div className={`card bg-gradient-to-br p-4 ${ACCENT[accent]}`}>
      <div className="text-[11px] font-semibold opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-black">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {delta && <div className="mt-1 text-[10px] opacity-70">{delta}</div>}
    </div>
  );
}

function Row({ label, value, href }: { label: string; value: string; href?: string }) {
  const inner = (
    <div className="flex items-center justify-between rounded-md bg-ink-50 px-3 py-2 dark:bg-ink-900">
      <span className="text-ink-700 dark:text-ink-200">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
  return href ? <li><Link href={href}>{inner}</Link></li> : <li>{inner}</li>;
}
