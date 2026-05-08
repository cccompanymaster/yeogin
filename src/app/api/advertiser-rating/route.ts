import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { notify } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const campaignId = String(body.campaignId || "");
  const rating = Math.min(5, Math.max(1, Number(body.rating || 0)));
  const comment = body.comment ? String(body.comment).slice(0, 200) : null;

  if (!campaignId || rating < 1) {
    return NextResponse.json({ error: "평점은 1~5점입니다." }, { status: 400 });
  }

  // 본인이 완료한 캠페인인지 확인
  const app = await db.application.findFirst({
    where: { userId: session.id, campaignId, status: "COMPLETED" },
    include: { campaign: true },
  });
  if (!app) {
    return NextResponse.json(
      { error: "완료한 캠페인만 평가할 수 있습니다." },
      { status: 403 }
    );
  }

  await db.advertiserRating.upsert({
    where: { campaignId_userId: { campaignId, userId: session.id } },
    create: {
      campaignId,
      userId: session.id,
      advertiserId: app.campaign.advertiserId,
      rating,
      comment,
    },
    update: { rating, comment },
  });

  await notify({
    role: "ADVERTISER",
    recipientId: app.campaign.advertiserId,
    title: "⭐ 광고주 평가가 등록되었어요",
    body: `${app.campaign.title} 캠페인에 ${rating}점 평가가 추가되었습니다.`,
    link: "/advertiser/dashboard",
  });

  return NextResponse.json({ ok: true });
}
