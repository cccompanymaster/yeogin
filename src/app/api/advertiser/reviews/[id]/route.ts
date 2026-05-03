import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdvertiserSession();
  if (!session) return NextResponse.redirect(new URL("/advertiser/login", req.url));

  const { id } = await params;
  const form = await req.formData();
  const action = String(form.get("action") || "");
  const rejectReason = String(form.get("rejectReason") || "").trim();

  const review = await db.review.findUnique({
    where: { id },
    include: { campaign: true, application: true },
  });
  if (!review || review.campaign.advertiserId !== session.id) {
    return NextResponse.redirect(new URL("/advertiser/dashboard", req.url));
  }

  if (action === "approve") {
    await db.$transaction([
      db.review.update({ where: { id }, data: { status: "APPROVED", rejectReason: null } }),
      db.application.update({
        where: { id: review.applicationId },
        data: { status: "COMPLETED" },
      }),
      db.user.update({
        where: { id: review.userId },
        data: { point: { increment: 1000 } },
      }),
    ]);
  } else if (action === "reject") {
    if (!rejectReason) {
      const url = new URL("/advertiser/reviews", req.url);
      url.searchParams.set("error", "반려 사유를 입력해주세요.");
      return NextResponse.redirect(url, 303);
    }
    await db.review.update({
      where: { id },
      data: { status: "REJECTED", rejectReason },
    });
  }

  return NextResponse.redirect(new URL("/advertiser/reviews", req.url));
}
