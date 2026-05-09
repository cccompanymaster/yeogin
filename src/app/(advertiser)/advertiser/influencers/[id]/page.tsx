import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { TRUST_LABEL, fmtDate } from "@/lib/format";
import { StarRating } from "@/components/StarRating";
import { InviteForm } from "@/components/InviteForm";

const GRADE_GRADIENT: Record<string, string> = {
  BRONZE: "from-amber-700 to-amber-900",
  SILVER: "from-ink-300 to-ink-500",
  GOLD: "from-yellow-400 to-amber-600",
  PLATINUM: "from-cyan-400 to-blue-600",
  DIAMOND: "from-pink-500 to-purple-600",
};

const fmt = (n: number | null) => {
  if (n == null) return "—";
  if (n >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, "")}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}천`;
  return n.toLocaleString();
};

export default async function InfluencerProfile({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const session = await getAdvertiserSession();
  if (!session) redirect("/advertiser/login");

  const { id } = await params;
  const sp = await searchParams;

  const u = await db.user.findUnique({
    where: { id },
    include: {
      reviews: {
        where: { status: "APPROVED" },
        include: { campaign: { select: { title: true, category: true, thumbnail: true } } },
        orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
        take: 6,
      },
    },
  });
  if (!u || !u.publicProfile) notFound();

  const completedCount = await db.review.count({
    where: { userId: u.id, status: "APPROVED" },
  });
  const avgRating =
    u.reviews.length > 0
      ? u.reviews.reduce((s, r) => s + (r.rating || 0), 0) / u.reviews.length
      : 0;

  // 광고주의 OPEN 캠페인 (초대 시 선택)
  const myCampaigns = await db.campaign.findMany({
    where: { advertiserId: session.id, status: "OPEN" },
    select: { id: true, title: true, offer: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const grad = GRADE_GRADIENT[u.trustGrade] || "from-ink-400 to-ink-600";

  return (
    <div className="space-y-6">
      <div>
        <Link href="/advertiser/influencers" className="text-xs text-ink-500">
          ← 인플루언서 검색
        </Link>
      </div>

      {sp.sent && (
        <div className="card border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          ✓ 초대를 보냈습니다. 인플루언서가 수락하면 즉시 알림을 받게 됩니다.
        </div>
      )}
      {sp.error && (
        <div className="card border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {decodeURIComponent(sp.error)}
        </div>
      )}

      <div className={`card overflow-hidden bg-gradient-to-br ${grad} p-6 text-white`}>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-white/20 ring-2 ring-white">
            {u.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={u.avatarUrl} alt={u.nickname} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl">👤</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{u.nickname}</h1>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold backdrop-blur">
                {TRUST_LABEL[u.trustGrade]}
              </span>
            </div>
            {u.bio && <p className="mt-1 text-sm opacity-95">{u.bio}</p>}
            <div className="mt-2 text-xs opacity-85">
              {u.region ?? "활동지역 미설정"} · 완료 {completedCount}회 · ❤️ {u.heartCount}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Channel
          label="블로그"
          color="#03c75a"
          value={fmt(u.blogVisitors)}
          unit="일 방문자"
          verified={!!u.blogVerifiedAt}
          url={u.blogUrl}
        />
        <Channel
          label="인스타"
          color="#e1306c"
          value={fmt(u.instaFollowers)}
          unit="팔로워"
          verified={!!u.instaVerifiedAt}
          url={u.instaUrl}
        />
        <Channel
          label="유튜브"
          color="#ff0000"
          value={fmt(u.youtubeSubscribers)}
          unit="구독자"
          verified={!!u.youtubeVerifiedAt}
          url={u.youtubeUrl}
        />
      </div>

      {u.reviews.length > 0 && (
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-bold">📣 최근 후기 ({u.reviews.length})</h2>
            <span className="text-xs text-ink-500">평균 ★ {avgRating.toFixed(1)}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {u.reviews.map((r) => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                className="card flex gap-3 overflow-hidden p-3 hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.campaign.thumbnail}
                  alt=""
                  className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-ink-500">{r.campaign.category}</div>
                  <div className="line-clamp-1 text-sm font-bold">{r.campaign.title}</div>
                  {r.rating && (
                    <div className="mt-1">
                      <StarRating rating={r.rating} size="sm" />
                    </div>
                  )}
                  {r.highlight && (
                    <p className="mt-1 line-clamp-2 text-xs italic text-amber-900 dark:text-amber-300">
                      "{r.highlight}"
                    </p>
                  )}
                  <div className="mt-1 text-[10px] text-ink-400">
                    {fmtDate(r.createdAt)}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <InviteForm userId={u.id} nickname={u.nickname} campaigns={myCampaigns} />
    </div>
  );
}

function Channel({
  label,
  color,
  value,
  unit,
  verified,
  url,
}: {
  label: string;
  color: string;
  value: string;
  unit: string;
  verified: boolean;
  url: string | null;
}) {
  return (
    <div className="card overflow-hidden">
      <div
        className="px-4 py-3 text-xs font-bold text-white"
        style={{ background: color }}
      >
        {label} {verified && "✓ 인증"}
      </div>
      <div className="space-y-1 p-4">
        <div className="text-xl font-black">{value}</div>
        <div className="text-[11px] text-ink-500 dark:text-ink-400">{unit}</div>
        {url && (
          <a
            href={url}
            target="_blank"
            className="block truncate text-[11px] text-brand-600 hover:underline"
          >
            {url}
          </a>
        )}
      </div>
    </div>
  );
}
