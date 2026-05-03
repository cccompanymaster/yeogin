import Link from "next/link";
import { db } from "@/lib/db";
import { CampaignCard } from "@/components/CampaignCard";
import { CATEGORIES, REGIONS, TYPE_LABEL, CHANNEL_LABEL } from "@/lib/format";
import { getUserSession } from "@/lib/session";

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

  const filterChip = (label: string, key: string, value: string) => {
    const params = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => v && params.set(k, v));
    if (sp[key as keyof typeof sp] === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const active = sp[key as keyof typeof sp] === value;
    return (
      <Link
        key={key + value}
        href={`/campaigns?${params.toString()}`}
        className={`badge px-2.5 py-1 ${
          active ? "bg-brand-500 text-white" : "bg-white text-ink-700 ring-1 ring-ink-200"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="space-y-6">
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
          <div className="mt-3 card border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
            아직 활동 지역이 등록되지 않았습니다. 마이페이지에서 지역을 설정하면 내 주변 방문형 캠페인이 자동으로 노출됩니다.
          </div>
        )}
      </div>

      <div className="card space-y-3 p-4">
        <div>
          <div className="label">캠페인 타입</div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(TYPE_LABEL).map(([k, v]) => filterChip(v, "type", k))}
          </div>
        </div>
        <div>
          <div className="label">채널</div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(CHANNEL_LABEL).map(([k, v]) => filterChip(v, "channel", k))}
          </div>
        </div>
        <div>
          <div className="label">카테고리</div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => filterChip(c, "category", c))}
          </div>
        </div>
        <div>
          <div className="label">지역 (방문형)</div>
          <div className="flex flex-wrap gap-1.5">
            {REGIONS.map((r) => filterChip(r, "region", r))}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-ink-100 pt-3 text-xs">
          <Link
            href={{ pathname: "/campaigns", query: { ...sp, sort: "latest" } }}
            className={sp.sort === "latest" || !sp.sort ? "font-bold text-brand-600" : "text-ink-500"}
          >
            최신순
          </Link>
          <Link
            href={{ pathname: "/campaigns", query: { ...sp, sort: "popular" } }}
            className={sp.sort === "popular" ? "font-bold text-brand-600" : "text-ink-500"}
          >
            인기순
          </Link>
          <Link
            href={{ pathname: "/campaigns", query: { ...sp, sort: "ending" } }}
            className={sp.sort === "ending" ? "font-bold text-brand-600" : "text-ink-500"}
          >
            마감임박순
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">
          조건에 맞는 캠페인이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {items.map((c) => <CampaignCard key={c.id} c={c} />)}
        </div>
      )}
    </div>
  );
}
