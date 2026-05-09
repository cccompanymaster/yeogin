import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { InfluencerCard } from "@/components/InfluencerCard";
import { EmptyState } from "@/components/EmptyState";
import { TRUST_LABEL, REGIONS } from "@/lib/format";

export const metadata = { title: "인플루언서 검색 - 비즈센터" };

const SORT_LABEL: Record<string, string> = {
  trust: "신뢰등급순",
  followers: "팔로워순",
  hearts: "인기순",
  recent: "최근 활동순",
};

const FOLLOWER_RANGES: Array<{ key: string; label: string; min: number; max: number | null }> = [
  { key: "all", label: "전체", min: 0, max: null },
  { key: "tiny", label: "~ 1,000", min: 0, max: 1000 },
  { key: "small", label: "1K~5K", min: 1000, max: 5000 },
  { key: "mid", label: "5K~50K", min: 5000, max: 50000 },
  { key: "large", label: "50K+", min: 50000, max: null },
];

export default async function InfluencerSearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    channel?: string;
    region?: string;
    grade?: string;
    range?: string;
    verified?: string;
    sort?: string;
  }>;
}) {
  const session = await getAdvertiserSession();
  if (!session) redirect("/advertiser/login");
  const sp = await searchParams;

  const where: Record<string, unknown> = { publicProfile: true };
  if (sp.q) where.OR = [{ nickname: { contains: sp.q } }, { bio: { contains: sp.q } }];
  if (sp.region) where.region = sp.region;
  if (sp.grade) where.trustGrade = sp.grade;

  // 채널 필터: 해당 채널 메트릭이 있는 사용자만
  if (sp.channel === "BLOG") where.blogVisitors = { gt: 0 };
  if (sp.channel === "INSTA") where.instaFollowers = { gt: 0 };
  if (sp.channel === "YOUTUBE") where.youtubeSubscribers = { gt: 0 };

  // 인증된 채널만
  if (sp.verified === "1") {
    where.OR = [
      ...(where.OR as Array<Record<string, unknown>> | undefined ?? []),
      { blogVerifiedAt: { not: null } },
      { instaVerifiedAt: { not: null } },
      { youtubeVerifiedAt: { not: null } },
    ];
  }

  // 팔로워 범위 (대표 채널 기준)
  const range = FOLLOWER_RANGES.find((r) => r.key === (sp.range || "all"))!;

  let orderBy: Record<string, "asc" | "desc"> | Array<Record<string, "asc" | "desc">> = [
    { heartCount: "desc" },
    { createdAt: "desc" },
  ];
  if (sp.sort === "trust") {
    orderBy = [{ trustGrade: "asc" }, { heartCount: "desc" }];
  } else if (sp.sort === "followers") {
    orderBy = [{ instaFollowers: "desc" }];
  } else if (sp.sort === "recent") {
    orderBy = [{ createdAt: "desc" }];
  } else if (sp.sort === "hearts") {
    orderBy = [{ heartCount: "desc" }];
  }

  const users = await db.user.findMany({
    where,
    orderBy,
    take: 60,
    select: {
      id: true,
      nickname: true,
      avatarUrl: true,
      bio: true,
      region: true,
      trustGrade: true,
      heartCount: true,
      blogVisitors: true,
      blogVerifiedAt: true,
      instaFollowers: true,
      instaVerifiedAt: true,
      youtubeSubscribers: true,
      youtubeVerifiedAt: true,
    },
  });

  // 범위 필터 (DB 쿼리 후 추가 필터)
  const inRange = (val: number | null | undefined): boolean => {
    if (range.key === "all") return true;
    if (val == null) return false;
    if (val < range.min) return false;
    if (range.max != null && val >= range.max) return false;
    return true;
  };
  const filtered = users.filter((u) => {
    if (range.key === "all") return true;
    const max = Math.max(
      u.blogVisitors ?? 0,
      u.instaFollowers ?? 0,
      u.youtubeSubscribers ?? 0
    );
    return inRange(max);
  });

  // 완료 캠페인 수 카운트
  const userIds = filtered.map((u) => u.id);
  const completed = userIds.length
    ? await db.review.groupBy({
        by: ["userId"],
        where: { userId: { in: userIds }, status: "APPROVED" },
        _count: { _all: true },
      })
    : [];
  const completedMap = new Map(completed.map((c) => [c.userId, c._count._all]));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">🔍 인플루언서 검색</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          공개 프로필에 동의한 인플루언서 중에서 캠페인에 적합한 분을 직접 찾고 초대하세요.
        </p>
      </div>

      <form className="card flex flex-wrap items-center gap-2 p-3" method="get">
        <input
          name="q"
          placeholder="닉네임/소개로 검색"
          defaultValue={sp.q || ""}
          className="input flex-1 min-w-[180px]"
        />
        <select name="channel" defaultValue={sp.channel || ""} className="input w-32">
          <option value="">채널 전체</option>
          <option value="BLOG">블로그</option>
          <option value="INSTA">인스타</option>
          <option value="YOUTUBE">유튜브</option>
        </select>
        <select name="region" defaultValue={sp.region || ""} className="input w-40">
          <option value="">지역 전체</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select name="grade" defaultValue={sp.grade || ""} className="input w-32">
          <option value="">등급 전체</option>
          {Object.entries(TRUST_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select name="range" defaultValue={sp.range || "all"} className="input w-32">
          {FOLLOWER_RANGES.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sp.sort || ""} className="input w-32">
          <option value="">정렬</option>
          {Object.entries(SORT_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <label className="inline-flex items-center gap-1 text-xs">
          <input type="checkbox" name="verified" value="1" defaultChecked={sp.verified === "1"} />
          인증된 채널만
        </label>
        <button className="btn-primary px-4">검색</button>
      </form>

      <div className="text-sm text-ink-500 dark:text-ink-400">
        총 <b className="text-ink-900 dark:text-ink-100">{filtered.length}명</b>의 인플루언서
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="조건에 맞는 인플루언서가 없어요"
          description="필터를 완화하거나 정렬을 바꿔보세요."
          cta={{ href: "/advertiser/influencers", label: "전체 보기" }}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u) => (
            <InfluencerCard
              key={u.id}
              u={{ ...u, completedCount: completedMap.get(u.id) || 0 }}
            />
          ))}
        </div>
      )}

      <div className="rounded-lg bg-ink-50 p-4 text-[11px] text-ink-500 dark:bg-ink-900">
        💡 마음에 드는 인플루언서를 클릭하면 상세 프로필과 함께 직접 초대를 보낼 수 있습니다.
        프로필 비공개를 선택한 사용자는 노출되지 않습니다.
      </div>
    </div>
  );
}
