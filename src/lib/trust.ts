import { db } from "@/lib/db";

const ORDER = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"] as const;

const APPROVE_RULES: Array<{ min: number; grade: string }> = [
  { min: 30, grade: "DIAMOND" },
  { min: 15, grade: "PLATINUM" },
  { min: 5, grade: "GOLD" },
  { min: 1, grade: "SILVER" },
  { min: 0, grade: "BRONZE" },
];

export async function applyTrustGrade(userId: string) {
  const [approved, penalties] = await Promise.all([
    db.review.count({ where: { userId, status: "APPROVED" } }),
    db.penalty.count({ where: { userId } }),
  ]);

  const baseGrade = APPROVE_RULES.find((r) => approved >= r.min)!.grade;
  // 패널티 1건당 한 단계 강등 (최저 BRONZE)
  let baseIdx = ORDER.indexOf(baseGrade as (typeof ORDER)[number]);
  baseIdx = Math.max(0, baseIdx - penalties);
  const finalGrade = ORDER[baseIdx];

  await db.user.update({
    where: { id: userId },
    data: { trustGrade: finalGrade },
  });
  return finalGrade;
}
