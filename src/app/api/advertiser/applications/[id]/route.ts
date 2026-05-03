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

  const app = await db.application.findUnique({
    where: { id },
    include: { campaign: true },
  });
  if (!app || app.campaign.advertiserId !== session.id) {
    return NextResponse.redirect(new URL("/advertiser/dashboard", req.url));
  }

  const next = action === "select" ? "SELECTED" : action === "reject" ? "REJECTED" : app.status;
  await db.application.update({ where: { id }, data: { status: next } });

  return NextResponse.redirect(
    new URL(`/advertiser/campaigns/${app.campaignId}/applicants`, req.url)
  );
}
