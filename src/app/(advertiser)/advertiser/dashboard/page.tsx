import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { TYPE_LABEL, CHANNEL_LABEL, TRUST_LABEL, fmtDate, won, dday } from "@/lib/format";
import { BarChart, HBarChart, LineChart, DonutChart, FunnelChart } from "@/components/charts";
import { relativeTime } from "@/lib/relative";

const REACH_RATE: Record<string, number> = {
  BLOG: 0.35,
  BLOG_CLIP: 0.32,
  INSTA: 0.18,
  REELS: 0.2,
  YOUTUBE: 0.12,
  SHORTS: 0.2,
  CLIP: 0.15,
  TIKTOK: 0.18,
};

const GRADE_COLOR: Record<string, string> = {
  BRONZE: "#a16207",
  SILVER: "#94a3b8",
  GOLD: "#eab308",
  PLATINUM: "#0ea5e9",
  DIAMOND: "#ec4899",
};

const TYPE_COLORS = ["#f97316", "#0ea5e9", "#10b981", "#a855f7", "#f59e0b", "#ef4444", "#06b6d4", "#84cc16"];

export default async function AdvertiserDashboard() {
  const session = await getAdvertiserSession();
  if (!session) redirect("/advertiser/login");

  const advId = session.id;
  const now = new Date();
  const since14 = new Date(Date.now() - 13 * 86400000);
  since14.setHours(0, 0, 0, 0);
  const since30 = new Date(Date.now() - 29 * 86400000);
  since30.setHours(0, 0, 0, 0);

  const [
    campaigns,
    advRow,
    ratingAgg,
    pendingReviews,
    approvedReviews,
    recentApps14,
    selectedTotal,
    inProgressApps,
    applicantUsers,
    recentActivities,
  ] = await Promise.all([
    db.campaign.findMany({
      where: { advertiserId: advId },
      include: { _count: { select: { applications: true, reviews: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.advertiser.findUnique({ where: { id: advId }, select: { point: true } }),
    db.advertiserRating.aggregate({
      where: { advertiserId: advId },
      _avg: { rating: true },
      _count: { _all: true },
    }),
    db.review.count({ where: { status: "PENDING", campaign: { advertiserId: advId } } }),
    db.review.findMany({
      where: { status: "APPROVED", campaign: { advertiserId: advId } },
      include: { campaign: { select: { offerValue: true, channel: true } }, user: true },
    }),
    db.application.findMany({
      where: { campaign: { advertiserId: advId }, createdAt: { gte: since14 } },
      select: { createdAt: true },
    }),
    db.application.count({
      where: { campaign: { advertiserId: advId }, status: { in: ["SELECTED", "COMPLETED"] } },
    }),
    db.application.findMany({
      where: { campaign: { advertiserId: advId }, status: { in: ["SELECTED"] } },
      select: { campaign: { select: { reviewEnd: true } } },
    }),
    db.application.findMany({
      where: { campaign: { advertiserId: advId } },
      select: { user: { select: { trustGrade: true, region: true, blogVerifiedAt: true, instaVerifiedAt: true, youtubeVerifiedAt: true } } },
      take: 500,
    }),
    db.application.findMany({
      where: { campaign: { advertiserId: advId } },
      include: {
        user: { select: { nickname: true } },
        campaign: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const balance = advRow?.point ?? 0;
  const avgRating = ratingAgg._avg.rating || 0;
  const ratingCount = ratingAgg._count._all;
  const totalApplied = campaigns.reduce((s, c) => s + c.appliedCount, 0);
  const openCount = campaigns.filter((c) => c.status === "OPEN").length;

  // 14일 일별 신청 추이
  const dayBuckets: { label: string; value: number; key: string }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    dayBuckets.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, value: 0, key });
  }
  for (const r of recentApps14) {
    const d = new Date(r.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const b = dayBuckets.find((x) => x.key === key);
    if (b) b.value += 1;
  }

  // 카테고리별 신청자
  const catMap = new Map<string, number>();
  for (const c of campaigns) catMap.set(c.category, (catMap.get(c.category) || 0) + c.appliedCount);
  const catData = Array.from(catMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // 캠페인 타입 분포
  const typeMap = new Map<string, number>();
  for (const c of campaigns) typeMap.set(c.type, (typeMap.get(c.type) || 0) + 1);
  const typeData = Array.from(typeMap.entries()).map(([k, v], i) => ({
    label: TYPE_LABEL[k] || k,
    value: v,
    color: TYPE_COLORS[i % TYPE_COLORS.length],
  }));

  // 채널 분포
  const channelMap = new Map<string, number>();
  for (const c of campaigns) channelMap.set(c.channel, (channelMap.get(c.channel) || 0) + 1);
  const channelData = Array.from(channelMap.entries()).map(([k, v], i) => ({
    label: CHANNEL_LABEL[k] || k,
    value: v,
    color: TYPE_COLORS[(i + 3) % TYPE_COLORS.length],
  }));

  // 신청자 등급 분포
  const gradeMap = new Map<string, number>();
  for (const a of applicantUsers) gradeMap.set(a.user.trustGrade, (gradeMap.get(a.user.trustGrade) || 0) + 1);
  const gradeData = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"]
    .filter((g) => (gradeMap.get(g) ?? 0) > 0)
    .map((g) => ({
      label: TRUST_LABEL[g] || g,
      value: gradeMap.get(g) || 0,
      color: GRADE_COLOR[g],
    }));

  // 인증 채널 분포
  const verifiedCount = applicantUsers.reduce(
    (s, a) =>
      s +
      ([
        a.user.blogVerifiedAt,
        a.user.instaVerifiedAt,
        a.user.youtubeVerifiedAt,
      ].filter(Boolean).length > 0
        ? 1
        : 0),
    0
  );
  const verifiedRate = applicantUsers.length > 0 ? Math.round((verifiedCount / applicantUsers.length) * 100) : 0;

  // 퍼널: 노출 → 신청 → 선정 → 리뷰 등록 → 승인
  const exposed = totalApplied * 8; // 추정 (신청 1건당 평균 8회 노출)
  const reviewedCount = recentActivities.length > 0
    ? approvedReviews.length + (await db.review.count({ where: { status: { in: ["PENDING", "REJECTED"] }, campaign: { advertiserId: advId } } }))
    : 0;
  const funnel = [
    { label: "추정 노출", value: exposed, color: "#94a3b8" },
    { label: "신청", value: totalApplied, color: "#0ea5e9" },
    { label: "선정", value: selectedTotal, color: "#f97316" },
    { label: "리뷰 등록", value: reviewedCount, color: "#a855f7" },
    { label: "승인 완료", value: approvedReviews.length, color: "#10b981" },
  ];

  // 추정 도달
  const totalEstReach = approvedReviews.reduce((s, r) => {
    const rate = REACH_RATE[r.campaign.channel] ?? 0.2;
    const u = r.user;
    const followers =
      r.campaign.channel === "BLOG"
        ? u.blogVisitors ?? 0
        : r.campaign.channel === "INSTA"
          ? u.instaFollowers ?? 0
          : r.campaign.channel === "YOUTUBE"
            ? u.youtubeSubscribers ?? 0
            : Math.max(u.instaFollowers ?? 0, u.youtubeSubscribers ?? 0);
    return s + Math.round(followers * rate);
  }, 0);
  const totalGrossValue = approvedReviews.reduce((s, r) => s + (r.campaign.offerValue || 0), 0);

  // 마감 임박 캠페인 (3일 내)
  const endingSoon = campaigns.filter((c) => {
    if (c.status !== "OPEN") return false;
    const days = Math.ceil((c.applyEnd.getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 3;
  });

  // 인사이트 카드 자동 생성
  const insights: { icon: string; title: string; body: string; cta?: { href: string; label: string } }[] = [];
  if (pendingReviews > 0) {
    insights.push({
      icon: "📥",
      title: `검수 대기 리뷰 ${pendingReviews}건`,
      body: "오래 두면 인플루언서가 이탈할 수 있어요. 빠른 검수 권장.",
      cta: { href: "/advertiser/reviews", label: "검수하러 가기" },
    });
  }
  if (endingSoon.length > 0) {
    insights.push({
      icon: "⏰",
      title: `마감 3일 이내 캠페인 ${endingSoon.length}건`,
      body: "선정자 발표 직전입니다. 신청자 확인 후 선정해주세요.",
      cta: { href: "/advertiser/campaigns?status=OPEN", label: "캠페인 보기" },
    });
  }
  if (balance < 30000) {
    insights.push({
      icon: "💰",
      title: "포인트 잔액이 부족할 수 있어요",
      body: `현재 ${balance.toLocaleString()}P · 새 캠페인 등록 전 충전을 권장합니다.`,
      cta: { href: "/advertiser/billing/charge", label: "충전하기" },
    });
  }
  if (campaigns.length > 0 && verifiedRate >= 50) {
    insights.push({
      icon: "✓",
      title: `신청자 ${verifiedRate}%가 인증된 채널 보유`,
      body: "양질의 인플루언서가 모이고 있어요. 매장 평점 관리도 신경써주세요.",
    });
  }
  if (insights.length === 0) {
    insights.push({
      icon: "🌱",
      title: "이번주 인사이트가 아직 없어요",
      body: "캠페인을 등록하고 리뷰를 검수하면 자동 분석이 시작됩니다.",
      cta: { href: "/advertiser/campaigns/new", label: "캠페인 등록" },
    });
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">📊 비즈센터 대시보드</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            {session.name} · 실시간 캠페인 현황과 인사이트
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/advertiser/billing/charge"
            className="card flex items-center gap-2 border-brand-200 bg-brand-50 px-4 py-2 hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-900/30"
          >
            <span className="text-xs text-brand-700 dark:text-brand-300">잔액</span>
            <span className="text-base font-black text-brand-700 dark:text-brand-300">
              {balance.toLocaleString()}P
            </span>
          </Link>
          <Link href="/advertiser/campaigns" className="btn-outline">
            📋 캠페인 관리
          </Link>
          <Link href="/advertiser/campaigns/new" className="btn-primary">
            + 캠페인 등록
          </Link>
        </div>
      </div>

      {/* KPI 6개 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="진행중 캠페인" value={`${openCount}`} sub={`총 ${campaigns.length}개`} />
        <Stat label="총 신청자" value={`${totalApplied}`} sub={`선정 ${selectedTotal}명`} />
        <Stat label="검수 대기" value={`${pendingReviews}`} tone={pendingReviews > 5 ? "warn" : "default"} />
        <Stat label="누적 도달 추정" value={totalEstReach >= 1000 ? `${(totalEstReach / 1000).toFixed(1)}K` : `${totalEstReach}`} sub="승인 리뷰 기반" />
        <Stat label="제공 가치 누적" value={won(totalGrossValue)} sub="플랫폼 수수료 별도" />
        <Stat
          label="매장 평점"
          value={ratingCount > 0 ? `★ ${avgRating.toFixed(1)}` : "—"}
          sub={ratingCount > 0 ? `(${ratingCount}건)` : "평가 대기"}
          tone="brand"
        />
      </div>

      {/* 인사이트 (자동 생성) */}
      <section>
        <h2 className="mb-3 text-base font-bold">💡 이번주 인사이트</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {insights.map((it, i) => (
            <div
              key={i}
              className="card flex flex-col gap-2 p-4"
            >
              <div className="flex items-start gap-2">
                <div className="text-2xl">{it.icon}</div>
                <div className="min-w-0">
                  <div className="text-sm font-bold">{it.title}</div>
                  <div className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">{it.body}</div>
                </div>
              </div>
              {it.cta && (
                <Link
                  href={it.cta.href}
                  className="mt-auto inline-flex items-center text-xs font-bold text-brand-600 hover:underline"
                >
                  {it.cta.label} →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 퍼널 + 시계열 */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-bold">🔻 캠페인 퍼널</h2>
            <span className="text-xs text-ink-500 dark:text-ink-400">노출 → 승인 단계별 전환</span>
          </div>
          <FunnelChart steps={funnel} />
        </div>
        <div className="card p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-bold">📈 최근 14일 일별 신청</h2>
            <span className="text-xs text-ink-500 dark:text-ink-400">총 {recentApps14.length}건</span>
          </div>
          <LineChart data={dayBuckets.map(({ label, value }) => ({ label, value }))} />
        </div>
      </div>

      {/* 인플루언서 분석 */}
      <section>
        <h2 className="mb-3 text-base font-bold">👥 신청자 분석</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="card p-5">
            <div className="text-sm font-bold">신뢰등급 분포</div>
            <div className="mt-3">
              {gradeData.length > 0 ? (
                <DonutChart data={gradeData} size={120} thickness={18} />
              ) : (
                <div className="py-6 text-center text-xs text-ink-500">데이터 없음</div>
              )}
            </div>
          </div>
          <div className="card p-5">
            <div className="text-sm font-bold">채널 분포 (캠페인)</div>
            <div className="mt-3">
              {channelData.length > 0 ? (
                <DonutChart data={channelData} size={120} thickness={18} />
              ) : (
                <div className="py-6 text-center text-xs text-ink-500">데이터 없음</div>
              )}
            </div>
          </div>
          <div className="card p-5">
            <div className="text-sm font-bold">SNS 인증률</div>
            <div className="mt-4 flex items-center justify-center">
              <div className="relative h-32 w-32">
                <svg className="absolute inset-0" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" className="stroke-ink-100 dark:stroke-ink-700" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="10"
                    strokeDasharray={`${(verifiedRate / 100) * 251} 251`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-black text-brand-600">{verifiedRate}%</div>
                  <div className="text-[10px] text-ink-500">{verifiedCount}/{applicantUsers.length}명</div>
                </div>
              </div>
            </div>
            <p className="mt-2 text-center text-[11px] text-ink-500 dark:text-ink-400">
              ✓ 채널 인증된 신청자 비율
            </p>
          </div>
        </div>
      </section>

      {/* 차트 그리드 */}
      <div className="grid gap-3 md:grid-cols-2">
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
      </div>

      {/* 진행중 캠페인 + 최근 활동 */}
      <div className="grid gap-3 md:grid-cols-2">
        <section className="card p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-bold">🔥 진행중 캠페인</h2>
            <Link href="/advertiser/campaigns?status=OPEN" className="text-xs text-brand-600 hover:underline">
              전체 →
            </Link>
          </div>
          {campaigns.filter((c) => c.status === "OPEN").length === 0 ? (
            <div className="py-6 text-center text-sm text-ink-500">진행중인 캠페인이 없습니다.</div>
          ) : (
            <div className="space-y-3">
              {campaigns
                .filter((c) => c.status === "OPEN")
                .slice(0, 5)
                .map((c) => {
                  const ratio = Math.min(100, Math.round((c._count.applications / c.capacity) * 100));
                  return (
                    <Link
                      key={c.id}
                      href={`/advertiser/campaigns/${c.id}/applicants`}
                      className="block rounded-lg border border-ink-100 p-3 transition hover:bg-ink-50 dark:border-ink-700 dark:hover:bg-ink-700"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="line-clamp-1 text-sm font-bold">{c.title}</div>
                        <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                          {dday(c.applyEnd)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-ink-500 dark:text-ink-400">
                        <span>
                          {c._count.applications}명 신청 / {c.capacity}명 모집
                        </span>
                        <span>{ratio}% 충족</span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-700">
                        <div
                          className="h-full"
                          style={{
                            width: `${ratio}%`,
                            background: ratio >= 100 ? "#10b981" : ratio >= 50 ? "#f97316" : "#94a3b8",
                          }}
                        />
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
        </section>

        <section className="card p-5">
          <h2 className="mb-3 text-base font-bold">⏱️ 최근 활동</h2>
          {recentActivities.length === 0 ? (
            <div className="py-6 text-center text-sm text-ink-500">최근 활동이 없습니다.</div>
          ) : (
            <ul className="space-y-2">
              {recentActivities.map((a) => {
                const stStyle =
                  a.status === "SELECTED"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : a.status === "REJECTED"
                      ? "bg-ink-200 text-ink-500 dark:bg-ink-700"
                      : a.status === "COMPLETED"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        : "bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-200";
                return (
                  <li key={a.id} className="flex items-center gap-2 text-xs">
                    <span className={`badge ${stStyle}`}>
                      {a.status === "SELECTED"
                        ? "선정"
                        : a.status === "REJECTED"
                          ? "미선정"
                          : a.status === "COMPLETED"
                            ? "완료"
                            : "신청"}
                    </span>
                    <Link
                      href={`/advertiser/campaigns/${a.campaign.id}/applicants`}
                      className="line-clamp-1 flex-1 hover:underline"
                    >
                      <b>{a.user.nickname}</b> · {a.campaign.title}
                    </Link>
                    <span className="flex-shrink-0 text-ink-400">{relativeTime(a.createdAt)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* 최근 캠페인 */}
      <section>
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
          <div className="card divide-y divide-ink-100 dark:divide-ink-700">
            {campaigns.slice(0, 6).map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.thumbnail} className="h-14 w-14 rounded-lg object-cover" alt="" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-ink-500 dark:text-ink-400">
                    <span>{TYPE_LABEL[c.type]}</span>
                    <span>·</span>
                    <span>{c.status === "OPEN" ? "진행중" : c.status === "DRAFT" ? "임시저장" : c.status === "SCHEDULED" ? "예약" : "종료"}</span>
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
                  <span className="font-semibold">
                    {c._count.applications} / {c.capacity}명
                  </span>
                  <Link
                    href={`/advertiser/campaigns/${c.id}/report`}
                    className="text-brand-600 hover:underline"
                  >
                    리포트 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "brand" | "warn";
}) {
  const color =
    tone === "brand"
      ? "text-brand-600 dark:text-brand-400"
      : tone === "warn"
        ? "text-amber-600 dark:text-amber-400"
        : "text-ink-900 dark:text-ink-100";
  return (
    <div className="card p-4">
      <div className="text-xs text-ink-500 dark:text-ink-400">{label}</div>
      <div className={`mt-1 text-xl font-black ${color}`}>{value}</div>
      {sub && <div className="mt-0.5 text-[10px] text-ink-500 dark:text-ink-400">{sub}</div>}
    </div>
  );
}
