import { db } from "@/lib/db";

/**
 * 예약 발행(SCHEDULED) 캠페인 중 publishAt이 지난 것을 OPEN으로 전환.
 * 라우트 진입 시 lazy 호출 — 별도 cron 없이도 동작.
 * 너무 자주 호출되지 않도록 in-process 마지막 실행 시간 기록.
 */
let lastRunAt = 0;
const MIN_INTERVAL_MS = 60 * 1000; // 1분

export async function promoteScheduledCampaigns() {
  const now = Date.now();
  if (now - lastRunAt < MIN_INTERVAL_MS) return 0;
  lastRunAt = now;

  try {
    const result = await db.campaign.updateMany({
      where: {
        status: "SCHEDULED",
        publishAt: { lte: new Date() },
      },
      data: { status: "OPEN" },
    });
    return result.count;
  } catch {
    return 0;
  }
}
