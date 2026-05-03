import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { notify } from "@/lib/notify";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdvertiserSession();
  if (!session) return NextResponse.redirect(new URL("/advertiser/login", req.url));

  const { id } = await params;
  const form = await req.formData();
  const action = String(form.get("action") || "");

  const app = await db.application.findUnique({
    where: { id },
    include: { campaign: true },
  });
  if (!app || app.campaign.advertiserId !== session.id) {
    return NextResponse.redirect(new URL("/advertiser/dashboard", req.url));
  }

  const next = action === "select" ? "SELECTED" : action === "reject" ? "REJECTED" : app.status;
  await db.application.update({ where: { id }, data: { status: next } });

  if (next === "SELECTED" || next === "REJECTED") {
    await notify({
      role: "USER",
      recipientId: app.userId,
      title: next === "SELECTED" ? "🎉 캠페인에 선정되었어요!" : "이번 캠페인은 아쉽게 미선정",
      body:
        next === "SELECTED"
          ? `${app.campaign.title} 캠페인 선정! 마이페이지에서 가이드를 확인하세요.`
          : `${app.campaign.title} 캠페인에 미선정되었습니다. 다음 기회에 또 만나요.`,
      link: "/mypage",
    });
  }

  return NextResponse.redirect(
    new URL(`/advertiser/campaigns/${app.campaignId}/applicants`, req.url)
  );
}
