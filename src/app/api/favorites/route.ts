import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const campaignId = String(body.campaignId || "");
  if (!campaignId)
    return NextResponse.json({ error: "캠페인 ID 누락" }, { status: 400 });

  const exists = await db.favorite.findUnique({
    where: { userId_campaignId: { userId: session.id, campaignId } },
  });

  if (exists) {
    await db.favorite.delete({ where: { id: exists.id } });
    return NextResponse.json({ ok: true, favorited: false });
  } else {
    await db.favorite.create({ data: { userId: session.id, campaignId } });
    return NextResponse.json({ ok: true, favorited: true });
  }
}
