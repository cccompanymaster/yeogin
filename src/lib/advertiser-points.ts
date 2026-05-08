import { db } from "@/lib/db";

// 캠페인 등록 비용 정책
// - 기본: 모집인원 1명당 3,000P
// - 빠른선정: +10,000P
// - 방문형 가중치: ×1.0, 배송형 ×1.2, 구매형 ×0.8, 기자단 ×0.5
const TYPE_MULTIPLIER: Record<string, number> = {
  VISIT: 1.0,
  DELIVERY: 1.2,
  PURCHASE: 0.8,
  REPORTER: 0.5,
};

export function calcCampaignCost(input: {
  capacity: number;
  type: string;
  fastMatch: boolean;
}): number {
  const base = input.capacity * 3000;
  const mult = TYPE_MULTIPLIER[input.type] ?? 1.0;
  const fast = input.fastMatch ? 10000 : 0;
  return Math.round(base * mult) + fast;
}

export const CHARGE_PACKAGES = [
  { amount: 10000, bonus: 0, label: "1만 P" },
  { amount: 30000, bonus: 1500, label: "3만 P + 1,500 보너스" },
  { amount: 50000, bonus: 3500, label: "5만 P + 3,500 보너스" },
  { amount: 100000, bonus: 10000, label: "10만 P + 10,000 보너스" },
  { amount: 300000, bonus: 50000, label: "30만 P + 50,000 보너스" },
];

export const ADV_REASON_LABEL: Record<string, string> = {
  CHARGE: "포인트 충전",
  CAMPAIGN_OPEN: "캠페인 등록",
  REFUND: "환불",
};

export async function recordAdvertiserPoint(
  advertiserId: string,
  delta: number,
  reason: "CHARGE" | "CAMPAIGN_OPEN" | "REFUND",
  options?: { note?: string; campaignId?: string }
) {
  const adv = await db.advertiser.update({
    where: { id: advertiserId },
    data: { point: { increment: delta } },
    select: { point: true },
  });
  await db.advertiserPointHistory.create({
    data: {
      advertiserId,
      delta,
      reason,
      balance: adv.point,
      note: options?.note,
      campaignId: options?.campaignId,
    },
  });
  return adv.point;
}
