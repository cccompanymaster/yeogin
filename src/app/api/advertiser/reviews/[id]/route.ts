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

  const review = await db.review.findUnique({
    where: { id },
    include: { campaign: true, application: true },
  });
  if (!review || review.campaign.advertiserId !== session.id) {
    return NextResponse.redirect(new URL("/advertiser/dashboard", req.url));
  }

  if (action === "approve") {
    await db.$transaction([
      db.review.update({ where: { id }, data: { status: "APPROVED" } }),
      db.application.update({
        where: { id: review.applicationId },
        data: { status: "COMPLETED" },
      }),
      db.user.update({
        where: { id: review.userId },
        data: { point: { increment: 1000 } },
      }),
    ]);
  }

  return NextResponse.redirect(new URL("/advertiser/reviews", req.url));
}
