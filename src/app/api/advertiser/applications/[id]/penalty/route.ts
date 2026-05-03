import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";

const TYPE_REASON: Record<string, { reason: string; point: number }> = {
  CANCEL_AFTER_SELECT: { reason: "선정 후 신청 취소", point: 500 },
  NO_REVIEW: { reason: "리뷰 미작성", point: 1000 },
  BAD_REVIEW: { reason: "가이드 미준수", point: 300 },
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdvertiserSession();
  if (!session) return NextResponse.redirect(new URL("/advertiser/login", req.url));

  const { id } = await params;
  const form = await req.formData();
  const type = String(form.get("type") || "");
  const cfg = TYPE_REASON[type];
  if (!cfg) return NextResponse.redirect(new URL("/advertiser/dashboard", req.url));

  const app = await db.application.findUnique({
    where: { id },
    include: { campaign: true },
  });
  if (!app || app.campaign.advertiserId !== session.id) {
    return NextResponse.redirect(new URL("/advertiser/dashboard", req.url));
  }

  await db.$transaction([
    db.penalty.create({
      data: {
        userId: app.userId,
        type,
        reason: cfg.reason,
        point: cfg.point,
      },
    }),
    db.user.update({
      where: { id: app.userId },
      data: { point: { decrement: cfg.point } },
    }),
  ]);

  return NextResponse.redirect(
    new URL(`/advertiser/campaigns/${app.campaignId}/applicants`, req.url)
  );
}
