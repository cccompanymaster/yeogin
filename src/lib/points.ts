import { db } from "@/lib/db";

type Reason = "REVIEW_APPROVED" | "PENALTY" | "SIGNUP_BONUS" | "MANUAL" | "REDEEM";

export const REASON_LABEL: Record<string, string> = {
  REVIEW_APPROVED: "리뷰 승인 적립",
  PENALTY: "패널티 차감",
  SIGNUP_BONUS: "가입 축하금",
  MANUAL: "수동 조정",
  REDEEM: "포인트 사용",
};

export async function recordPoint(
  userId: string,
  delta: number,
  reason: Reason,
  note?: string
) {
  const user = await db.user.update({
    where: { id: userId },
    data: { point: { increment: delta } },
    select: { point: true },
  });
  await db.pointHistory.create({
    data: { userId, delta, reason, balance: user.point, note: note || null },
  });
  return user.point;
}
