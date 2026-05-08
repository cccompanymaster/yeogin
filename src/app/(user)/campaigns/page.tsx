import { db } from "@/lib/db";
import { CampaignCard } from "@/components/CampaignCard";

export const metadata = {
  title: "전체 캠페인",
  description: "여긴의 모든 진행중 캠페인. 카테고리·채널·지역·유형별로 검색하세요.",
};
import { CATEGORIES, REGIONS, TYPE_LABEL, CHANNEL_LABEL } from "@/lib/format";
import { getUserSession } from "@/lib/session";
import {
  FilterDropdown,
  FilterToggleChip,
  FilterClearAll,
} from "@/components/FilterDropdown";
import { NearbyMap } from "@/components/NearbyMap";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  type?: string;
  channel?: string;
  region?: string;
  fast?: string;
  nearby?: string;
  sort?: string;
}>;

export default async function CampaignListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const where: Record<string, unknown> = { status: "OPEN" };
  if (sp.category) where.category = sp.category;
  if (sp.type) where.type = sp.type;
  if (sp.channel) where.channel = sp.channel;
  if (sp.region) where.region = sp.region;
  if (sp.fast === "1") where.fastMatch = true;
  if (sp.q) where.title = { contains: sp.q };

  // 내 주변: 로그인 사용자의 region 기반 자동 필터
  let nearbyRegion: string | null = null;
  let nearbyNoRegion = false;
  if (sp.nearby === "1") {
    const session = await getUserSession();
    if (session) {
      const me = await db.user.findUnique({ where: { id: session.id } });
      if (me?.region) {
        nearbyRegion = me.region;
        where.region = me.region;
        where.type = "VISIT";
      } else {
        nearbyNoRegion = true;
      }
    }
  }

  const orderBy =
    sp.sort === "ending"
      ? { applyEnd: "asc" as const }
      : sp.sort === "popular"
        ? { appliedCount: "desc" as const }
        : { createdAt: "desc" as const };

  const items = await db.campaign.findMany({ where, orderBy, take: 60 });

  // 로그인 사용자의 즐겨찾기 세트
  const sessionForFav = await getUserSession();
  let favSet = new Set<string>();
  if (sessionForFav && items.length > 0) {
    const favs = await db.favorite.findMany({
      where: { userId: sessionForFav.id, campaignId: { in: items.map((i) => i.id) } },
      select: { campaignId: true },
    });
    favSet = new Set(favs.map((f) => f.campaignId));
  }

  // 내 주변 지도용: 지역별 방문형 캠페인 카운트 집계
  let regionCounts: { region: string; count: number }[] = [];
  if (sp.nearby === "1") {
    const grouped = await db.campaign.groupBy({
      by: ["region"],
      where: { status: "OPEN", type: "VISIT", region: { not: null } },
      _count: { _all: true },
    });
    regionCounts = grouped
      .filter((g): g is typeof g & { region: string } => !!g.region)
      .map((g) => ({ region: g.region, count: g._count._all }));
  }

  const categoryOpts = CATEGORIES.map((c) => ({ value: c, label: c }));
  const channelOpts = Object.entries(CHANNEL_LABEL).map(([v, l]) => ({
    value: v,
    label: l,
  }));
  const typeOpts = Object.entries(TYPE_LABEL).map(([v, l]) => ({
    value: v,
    label: l,
  }));
  const regionOpts = REGIONS.map((r) => ({ value: r, label: r }));
  const sortOpts = [
    { value: "latest", label: "최신순" },
    { value: "popular", label: "인기순" },
    { value: "ending", label: "마감임박순" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">
          {sp.nearby === "1"
            ? `📍 내 주변 캠페인${nearbyRegion ? ` · ${nearbyRegion}` : ""}`
            : "전체 캠페인"}
        </h1>
        <div className="mt-1 text-sm text-ink-500">
          총 {items.length}개의 캠페인이 진행 중입니다
        </div>
        {nearbyNoRegion && (
          <div className="card mt-3 border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
            아직 활동 지역이 등록되지 않았습니다. 마이페이지에서 지역을 설정하면 내 주변 방문형 캠페인이 자동으로 노출됩니다.
          </div>
        )}
      </div>

      {sp.nearby === "1" && regionCounts.length > 0 && (
        <NearbyMap counts={regionCounts} activeRegion={nearbyRegion} />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown
          label="카테고리"
          paramKey="category"
          options={categoryOpts}
        />
        <FilterDropdown label="채널" paramKey="channel" options={channelOpts} />
        <FilterDropdown label="유형" paramKey="type" options={typeOpts} />
        <FilterDropdown label="지역" paramKey="region" options={regionOpts} />
        <FilterDropdown
          label="정렬"
          paramKey="sort"
          options={sortOpts}
          allLabel="기본 (최신순)"
          align="right"
        />
        <FilterToggleChip label="⚡ 빠른선정" paramKey="fast" value="1" />
        <FilterClearAll />
      </div>

      {items.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">
          조건에 맞는 캠페인이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {items.map((c) => (
            <CampaignCard
              key={c.id}
              c={c}
              favorited={favSet.has(c.id)}
              loggedIn={!!sessionForFav}
            />
          ))}
        </div>
      )}
    </div>
  );
}
