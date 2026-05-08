import { db } from "@/lib/db";

type Camp = {
  id: string;
  category: string;
  tags: string;
  type: string;
  region: string | null;
  fastMatch: boolean;
  appliedCount: number;
  createdAt: Date;
};

type UserPrefs = {
  region: string | null;
  catFreq: Record<string, number>;
  tagFreq: Record<string, number>;
  channel: string | null;
};

/**
 * 사용자 추천을 위한 캠페인 점수
 * - 카테고리 일치 가중치
 * - 태그 일치 가중치
 * - 지역 일치 (방문형)
 * - 인기도 보너스
 */
function scoreCampaign(c: Camp, p: UserPrefs): number {
  let s = 0;
  s += (p.catFreq[c.category] || 0) * 10;

  const tags = (c.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
  for (const t of tags) {
    s += (p.tagFreq[t] || 0) * 5;
  }

  if (c.type === "VISIT" && c.region && p.region && c.region === p.region) {
    s += 15;
  }

  // 인기도 보너스 (최대 +10)
  s += Math.min(10, c.appliedCount * 0.2);

  // 빠른선정 미세 보너스
  if (c.fastMatch) s += 2;

  // 신선도 (3일 이내 +3)
  const ageDays = (Date.now() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays < 3) s += 3;

  return s;
}

export async function getRecommendedCampaigns(userId: string, take = 8) {
  const [user, history] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { region: true },
    }),
    db.application.findMany({
      where: { userId },
      include: {
        campaign: { select: { category: true, tags: true, channel: true } },
      },
      take: 100,
    }),
  ]);

  if (!user) return [];

  const catFreq: Record<string, number> = {};
  const tagFreq: Record<string, number> = {};
  const channelFreq: Record<string, number> = {};

  for (const h of history) {
    catFreq[h.campaign.category] = (catFreq[h.campaign.category] || 0) + 1;
    channelFreq[h.campaign.channel] = (channelFreq[h.campaign.channel] || 0) + 1;
    const tags = (h.campaign.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
    for (const t of tags) tagFreq[t] = (tagFreq[t] || 0) + 1;
  }
  const dominantChannel =
    Object.entries(channelFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const prefs: UserPrefs = {
    region: user.region,
    catFreq,
    tagFreq,
    channel: dominantChannel,
  };

  // 신청 이력이 없으면 빈 결과 (홈에서 노출 안 함)
  const hasHistory = history.length > 0;

  // 후보: 진행중 + 마감 전 + 미신청
  const appliedIds = new Set(history.map((h) => h.campaignId));
  const candidates = await db.campaign.findMany({
    where: {
      status: "OPEN",
      applyEnd: { gt: new Date() },
      id: { notIn: Array.from(appliedIds) },
    },
    take: 60,
    orderBy: { createdAt: "desc" },
  });

  // 신청 이력 없으면 유저 region/단순 인기로 폴백
  if (!hasHistory) {
    return candidates
      .sort((a, b) => {
        if (user.region && a.type === "VISIT" && a.region === user.region) return -1;
        if (user.region && b.type === "VISIT" && b.region === user.region) return 1;
        return b.appliedCount - a.appliedCount;
      })
      .slice(0, take);
  }

  return candidates
    .map((c) => ({ c, score: scoreCampaign(c, prefs) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, take)
    .map((x) => x.c);
}
