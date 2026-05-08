type UserForMatch = {
  region: string | null;
  trustGrade: string;
  blogVisitors: number | null;
  instaFollowers: number | null;
  youtubeSubscribers: number | null;
  blogVerifiedAt: Date | null;
  instaVerifiedAt: Date | null;
  youtubeVerifiedAt: Date | null;
};

type CampaignForMatch = {
  type: string;
  channel: string;
  category: string;
  region: string | null;
  capacity: number;
};

type FrequencyMap = Record<string, number>; // category -> count

// 카테고리 빈도 (사용자가 신청한 카테고리 횟수)
export function buildCategoryFrequency(
  history: Array<{ campaign: { category: string } }>
): FrequencyMap {
  const map: FrequencyMap = {};
  for (const h of history) {
    map[h.campaign.category] = (map[h.campaign.category] || 0) + 1;
  }
  return map;
}

const TRUST_BONUS: Record<string, number> = {
  BRONZE: 0,
  SILVER: 5,
  GOLD: 10,
  PLATINUM: 15,
  DIAMOND: 20,
};

/**
 * 사용자-캠페인 매칭 점수 (0~100)
 * - 채널 보유 / 인증 여부 (35점)
 * - 활동지역 일치 (25점)
 * - 카테고리 관심사 (20점)
 * - 신뢰등급 보너스 (20점)
 */
export function matchScore(
  user: UserForMatch,
  campaign: CampaignForMatch,
  freq: FrequencyMap = {}
): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  // 1) 채널 (35점)
  const channelKey = campaign.channel;
  const has =
    (channelKey === "BLOG" && !!user.blogVisitors) ||
    (channelKey === "INSTA" && !!user.instaFollowers) ||
    (channelKey === "YOUTUBE" && !!user.youtubeSubscribers) ||
    (channelKey === "SHORTS" && !!user.instaFollowers) ||
    (channelKey === "CLIP" && !!user.youtubeSubscribers);
  const verified =
    (channelKey === "BLOG" && !!user.blogVerifiedAt) ||
    (channelKey === "INSTA" && !!user.instaVerifiedAt) ||
    (channelKey === "YOUTUBE" && !!user.youtubeVerifiedAt);

  if (verified) {
    score += 35;
    reasons.push("✓ 인증된 채널 보유");
  } else if (has) {
    score += 22;
    reasons.push("채널 등록됨");
  } else {
    reasons.push(`${channelKey} 채널 미등록`);
  }

  // 2) 지역 일치 (25점)
  if (campaign.type === "VISIT") {
    if (user.region && campaign.region && user.region === campaign.region) {
      score += 25;
      reasons.push("📍 활동지역 일치");
    } else if (user.region && campaign.region) {
      const userCity = user.region.split(" ")[0];
      const camCity = campaign.region.split(" ")[0];
      if (userCity === camCity) {
        score += 12;
        reasons.push("같은 시·도");
      }
    }
  } else {
    // 배송/기자단 등은 지역 무관
    score += 25;
  }

  // 3) 카테고리 관심사 (20점)
  const f = freq[campaign.category] ?? 0;
  if (f >= 3) {
    score += 20;
    reasons.push("자주 신청하는 카테고리");
  } else if (f >= 1) {
    score += 12;
    reasons.push("관심 카테고리");
  }

  // 4) 신뢰등급 (20점)
  const t = TRUST_BONUS[user.trustGrade] ?? 0;
  score += t;
  if (t >= 15) reasons.push(`${user.trustGrade} 등급 보너스`);

  return {
    score: Math.min(100, Math.round(score)),
    reason: reasons.slice(0, 3).join(" · "),
  };
}

export function scoreColor(s: number): string {
  if (s >= 80) return "bg-emerald-500 text-white";
  if (s >= 60) return "bg-brand-500 text-white";
  if (s >= 40) return "bg-amber-100 text-amber-800";
  return "bg-ink-100 text-ink-600";
}

export function scoreLabel(s: number): string {
  if (s >= 80) return "Perfect";
  if (s >= 60) return "Good";
  if (s >= 40) return "Fair";
  return "Low";
}
