import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { recordPoint } from "@/lib/points";

const DAY_MS = 24 * 60 * 60 * 1000;

// 연속 출석 보너스 테이블
function bonusFor(streak: number): number {
  if (streak >= 30) return 500;
  if (streak >= 14) return 300;
  if (streak >= 7) return 200;
  if (streak >= 3) return 100;
  return 50;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function diffDays(a: Date, b: Date) {
  const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((aa - bb) / DAY_MS);
}

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const me = await db.user.findUnique({ where: { id: session.id } });
  if (!me) return NextResponse.json({ error: "not found" }, { status: 404 });

  const now = new Date();
  if (me.lastAttendAt && isSameDay(new Date(me.lastAttendAt), now)) {
    return NextResponse.json(
      { error: "오늘은 이미 출석체크를 완료했어요." },
      { status: 400 }
    );
  }

  // 연속/리셋 결정
  let nextStreak = 1;
  if (me.lastAttendAt) {
    const d = diffDays(now, new Date(me.lastAttendAt));
    if (d === 1) nextStreak = me.attendStreak + 1;
    else nextStreak = 1;
  }

  const bonus = bonusFor(nextStreak);
  await db.user.update({
    where: { id: me.id },
    data: { attendStreak: nextStreak, lastAttendAt: now },
  });
  const balance = await recordPoint(
    me.id,
    bonus,
    "MANUAL",
    `출석체크 ${nextStreak}일째`
  );

  return NextResponse.json({ ok: true, streak: nextStreak, bonus, balance });
}
