import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { notify } from "@/lib/notify";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const channelUrl = String(body.channelUrl || "").trim();
  const message = body.message ? String(body.message).trim() : null;

  if (!channelUrl || !/^https?:\/\//.test(channelUrl)) {
    return NextResponse.json({ error: "올바른 URL을 입력해주세요." }, { status: 400 });
  }

  const c = await db.campaign.findUnique({ where: { id } });
  if (!c) return NextResponse.json({ error: "캠페인을 찾을 수 없습니다." }, { status: 404 });
  if (c.status !== "OPEN" || new Date(c.applyEnd) < new Date()) {
    return NextResponse.json({ error: "신청이 마감된 캠페인입니다." }, { status: 400 });
  }

  const dup = await db.application.findUnique({
    where: { campaignId_userId: { campaignId: id, userId: session.id } },
  });
  if (dup) {
    return NextResponse.json({ error: "이미 신청한 캠페인입니다." }, { status: 400 });
  }

  await db.$transaction([
    db.application.create({
      data: { campaignId: id, userId: session.id, channelUrl, message },
    }),
    db.campaign.update({
      where: { id },
      data: { appliedCount: { increment: 1 } },
    }),
  ]);

  await notify({
    role: "ADVERTISER",
    recipientId: c.advertiserId,
    title: "새 신청자가 도착했어요",
    body: `${c.title} 캠페인에 새 신청이 접수되었습니다.`,
    link: `/advertiser/campaigns/${id}/applicants`,
  });

  return NextResponse.json({ ok: true });
}
