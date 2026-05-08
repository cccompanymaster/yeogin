import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { notify } from "@/lib/notify";
import { applyTrustGrade } from "@/lib/trust";
import { recordPoint } from "@/lib/points";

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
    ]);
    await recordPoint(review.userId, 1000, "REVIEW_APPROVED", review.campaign.title);
    const newGrade = await applyTrustGrade(review.userId);
    await notify({
      role: "USER",
      recipientId: review.userId,
      title: "리뷰가 승인되었어요 🎉",
      body: `${review.campaign.title} 리뷰가 승인되어 1,000P가 적립되었습니다. 현재 신뢰등급: ${newGrade}`,
      link: "/mypage",
    });
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
    await notify({
      role: "USER",
      recipientId: review.userId,
      title: "리뷰가 반려되었습니다",
      body: `사유: ${rejectReason}. 마이페이지에서 수정 후 재등록할 수 있습니다.`,
      link: "/mypage",
    });
  }

  return NextResponse.redirect(new URL("/advertiser/reviews", req.url));
}
