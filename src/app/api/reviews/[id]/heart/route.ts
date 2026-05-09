import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";

/**
 * 후기에 ❤️ 토글 (간단한 구현 - 쿠키 기반 idempotent)
 * 같은 사용자가 여러 번 누르면 쿠키로 차단 (DB 모델 단순화 위해)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const review = await db.review.findUnique({
    where: { id },
    select: { userId: true, status: true },
  });
  if (!review || review.status !== "APPROVED") {
    return NextResponse.json({ error: "후기를 찾을 수 없습니다." }, { status: 404 });
  }
  if (review.userId === session.id) {
    return NextResponse.json({ error: "자신의 후기에는 좋아요할 수 없어요." }, { status: 400 });
  }

  // 쿠키 기반 idempotent (실제 운영 시 ReviewHeart 모델로 전환 권장)
  const cookieKey = `heart_${id}`;
  const already = req.cookies.get(cookieKey)?.value === "1";

  let action: "add" | "remove";
  if (already) {
    await db.user.update({
      where: { id: review.userId },
      data: { heartCount: { decrement: 1 } },
    });
    action = "remove";
  } else {
    await db.user.update({
      where: { id: review.userId },
      data: { heartCount: { increment: 1 } },
    });
    action = "add";
  }

  const res = NextResponse.json({ ok: true, hearted: action === "add" });
  if (action === "add") {
    res.cookies.set(cookieKey, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  } else {
    res.cookies.delete(cookieKey);
  }
  return res;
}
