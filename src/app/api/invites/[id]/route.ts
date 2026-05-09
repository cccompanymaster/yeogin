import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { notify } from "@/lib/notify";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession();
  if (!session) return NextResponse.redirect(new URL("/login", req.url));
  const { id } = await params;

  const f = await req.formData();
  const action = String(f.get("action") || "");

  const iv = await db.directInvite.findUnique({
    where: { id },
    include: { campaign: true, advertiser: { select: { id: true, companyName: true } } },
  });
  if (!iv || iv.userId !== session.id) {
    return NextResponse.redirect(new URL("/mypage/invites", req.url));
  }
  if (iv.status !== "PENDING") {
    const url = new URL("/mypage/invites", req.url);
    url.searchParams.set("error", "이미 처리된 제안입니다.");
    return NextResponse.redirect(url, 303);
  }

  if (action === "reject") {
    await db.directInvite.update({
      where: { id },
      data: { status: "REJECTED", respondedAt: new Date() },
    });
    await notify({
      role: "ADVERTISER",
      recipientId: iv.advertiserId,
      title: "초대가 거절되었습니다",
      body: `${session.name}님이 "${iv.title}" 초대를 정중히 거절하셨습니다.`,
    });
    const url = new URL("/mypage/invites", req.url);
    url.searchParams.set("ok", "1");
    return NextResponse.redirect(url, 303);
  }

  if (action === "accept") {
    // 캠페인 첨부된 경우 자동으로 application 생성 (이미 있으면 SELECTED로 갱신)
    if (iv.campaign && iv.campaign.status === "OPEN") {
      const me = await db.user.findUnique({
        where: { id: session.id },
        select: { blogUrl: true, instaUrl: true, youtubeUrl: true },
      });
      const channelUrl =
        iv.campaign.channel === "BLOG"
          ? me?.blogUrl
          : iv.campaign.channel === "INSTA"
            ? me?.instaUrl
            : me?.youtubeUrl;

      const existing = await db.application.findUnique({
        where: {
          campaignId_userId: {
            campaignId: iv.campaign.id,
            userId: session.id,
          },
        },
      });
      if (existing) {
        await db.application.update({
          where: { id: existing.id },
          data: { status: "SELECTED" },
        });
      } else {
        await db.application.create({
          data: {
            campaignId: iv.campaign.id,
            userId: session.id,
            channelUrl: channelUrl || "(직접 초대)",
            message: `광고주 직접 초대: ${iv.title}`,
            status: "SELECTED",
          },
        });
        await db.campaign.update({
          where: { id: iv.campaign.id },
          data: { appliedCount: { increment: 1 } },
        });
      }
    }

    await db.directInvite.update({
      where: { id },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    });

    await notify({
      role: "ADVERTISER",
      recipientId: iv.advertiserId,
      title: "🎉 초대가 수락되었어요!",
      body: iv.campaign
        ? `${session.name}님이 "${iv.campaign.title}" 캠페인 초대를 수락했습니다. 자동으로 선정 처리되었습니다.`
        : `${session.name}님이 "${iv.title}" 제안을 수락했습니다.`,
      link: iv.campaign
        ? `/advertiser/campaigns/${iv.campaign.id}/applicants`
        : "/advertiser/dashboard",
    });

    const url = new URL("/mypage/invites", req.url);
    url.searchParams.set("ok", "1");
    return NextResponse.redirect(url, 303);
  }

  return NextResponse.redirect(new URL("/mypage/invites", req.url));
}
