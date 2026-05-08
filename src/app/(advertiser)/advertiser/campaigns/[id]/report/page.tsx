import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { CHANNEL_LABEL, TYPE_LABEL, fmtDate, won } from "@/lib/format";
import { StarRating } from "@/components/StarRating";

// 채널별 추정 도달률 가중치 (보수적 추정)
const REACH_RATE: Record<string, number> = {
  BLOG: 0.35,
  INSTA: 0.18,
  YOUTUBE: 0.12,
  SHORTS: 0.20,
  CLIP: 0.15,
};
const ENGAGE_RATE: Record<string, number> = {
  BLOG: 0.04,
  INSTA: 0.06,
  YOUTUBE: 0.05,
  SHORTS: 0.08,
  CLIP: 0.07,
};

export default async function CampaignReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdvertiserSession();
  if (!session) redirect("/advertiser/login");
  const { id } = await params;

  const c = await db.campaign.findUnique({
    where: { id },
    include: {
      applications: {
        include: { user: true, review: true },
      },
    },
  });
  if (!c || c.advertiserId !== session.id) notFound();

  const selected = c.applications.filter((a) => a.status === "SELECTED" || a.status === "COMPLETED");
  const completed = c.applications.filter((a) => a.status === "COMPLETED");
  const reviews = c.applications.map((a) => a.review).filter(Boolean) as NonNullable<
    (typeof c.applications)[number]["review"]
  >[];
  const approved = reviews.filter((r) => r.status === "APPROVED");

  // 도달/참여 추정 계산: 선정자의 SNS 메트릭 합산
  const channelKey = c.channel;
  const totalFollowers = selected.reduce((sum, a) => {
    if (channelKey === "BLOG") return sum + (a.user.blogVisitors || 0);
    if (channelKey === "INSTA") return sum + (a.user.instaFollowers || 0);
    if (channelKey === "YOUTUBE" || channelKey === "CLIP")
      return sum + (a.user.youtubeSubscribers || 0);
    if (channelKey === "SHORTS")
      return sum + ((a.user.instaFollowers || 0) + (a.user.youtubeSubscribers || 0)) / 2;
    return sum;
  }, 0);
  const reachRate = REACH_RATE[channelKey] ?? 0.2;
  const engageRate = ENGAGE_RATE[channelKey] ?? 0.05;
  const estReach = Math.round(totalFollowers * reachRate);
  const estEngage = Math.round(estReach * engageRate);

  // 평균 별점
  const ratings = approved.map((r) => r.rating).filter((x): x is number => !!x);
  const avgRating = ratings.length > 0 ? ratings.reduce((s, x) => s + x, 0) / ratings.length : 0;

  // 비용 효율
  const grossValue = approved.length * c.offerValue;
  const cpr = approved.length > 0 ? Math.round(grossValue / approved.length) : 0;
  const cpReach = estReach > 0 ? Math.round(grossValue / estReach) : 0;

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/advertiser/campaigns/${c.id}/applicants`} className="text-xs text-ink-500">
          ← 신청자 관리
        </Link>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{c.title}</h1>
            <div className="mt-1 text-xs text-ink-500">
              {TYPE_LABEL[c.type]} · {CHANNEL_LABEL[c.channel]} · {c.category}
              {c.region && ` · ${c.region}`} · ~{fmtDate(c.applyEnd)}
            </div>
          </div>
          <div className="text-[11px] text-ink-500">
            ※ 도달·참여는 보유 채널 메트릭 기반 보수 추정치입니다.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="신청자" value={`${c.applications.length}명`} />
        <Stat label="선정/완료" value={`${selected.length}명`} />
        <Stat label="완료 리뷰" value={`${approved.length}건`} />
        <Stat label="평균 별점" value={`${avgRating.toFixed(1)} / 5.0`} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <BigStat
          label="추정 총 도달"
          value={estReach.toLocaleString()}
          subtitle={`팔로워/방문자 ${totalFollowers.toLocaleString()} × ${(reachRate * 100).toFixed(0)}%`}
          highlight
        />
        <BigStat
          label="추정 참여"
          value={estEngage.toLocaleString()}
          subtitle={`도달 × 참여율 ${(engageRate * 100).toFixed(0)}%`}
        />
        <BigStat
          label="제공 가치 합계"
          value={won(grossValue)}
          subtitle={`완료 ${approved.length}건 × ${won(c.offerValue)}`}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-sm font-bold">단가 효율</h2>
          <div className="mt-3 space-y-2 text-sm">
            <Row label="리뷰당 제공가치" value={won(cpr)} />
            <Row label="도달 1명당 비용" value={cpReach > 0 ? `${cpReach.toLocaleString()}원` : "-"} />
            <Row
              label="플랫폼 수수료(10%)"
              value={won(Math.round(grossValue * 0.1))}
            />
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-bold">진행 현황</h2>
          <div className="mt-3 space-y-2 text-sm">
            <Row
              label="모집 충족"
              value={`${Math.min(100, Math.round((c.applications.length / c.capacity) * 100))}%`}
            />
            <Row
              label="리뷰 작성률"
              value={`${selected.length > 0 ? Math.round((approved.length / selected.length) * 100) : 0}% (${approved.length}/${selected.length})`}
            />
            <Row
              label="가이드 통과율"
              value={`${reviews.length > 0 ? Math.round((reviews.filter((r) => r.keywordCheck === "PASS").length / reviews.length) * 100) : 0}%`}
            />
          </div>
        </div>
      </div>

      {approved.length > 0 && (
        <div>
          <h2 className="mb-3 text-base font-bold">완료 리뷰</h2>
          <div className="card divide-y divide-ink-100">
            {approved.map((r) => {
              const a = c.applications.find((x) => x.review?.id === r.id);
              return (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  className="block p-4 hover:bg-ink-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{a?.user.nickname}</span>
                    {r.rating && <StarRating rating={r.rating} />}
                  </div>
                  {r.highlight && (
                    <p className="mt-1 text-sm italic text-amber-900">"{r.highlight}"</p>
                  )}
                  <div className="mt-1 truncate text-xs text-brand-600">{r.url}</div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-lg bg-ink-50 p-4 text-[11px] text-ink-500">
        ※ 도달/참여 수치는 업계 평균 가중치(블로그 35%/4%, 인스타 18%/6%, 유튜브 12%/5%)로 추정한
        값으로 실제와 다를 수 있습니다. 더 정확한 측정을 원하시면 SNS Insights API 연동을
        검토해주세요.
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-ink-500">{label}</div>
      <div className="mt-1 text-xl font-black text-ink-900">{value}</div>
    </div>
  );
}

function BigStat({
  label,
  value,
  subtitle,
  highlight,
}: {
  label: string;
  value: string;
  subtitle?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`card p-5 ${highlight ? "border-brand-300 bg-brand-50" : ""}`}
    >
      <div className="text-xs text-ink-500">{label}</div>
      <div
        className={`mt-1 text-3xl font-black ${
          highlight ? "text-brand-700" : "text-ink-900"
        }`}
      >
        {value}
      </div>
      {subtitle && (
        <div className="mt-1 text-[11px] text-ink-500">{subtitle}</div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 pb-1.5 last:border-b-0">
      <span className="text-ink-500">{label}</span>
      <span className="font-bold text-ink-900">{value}</span>
    </div>
  );
}
