import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { notifyMany } from "@/lib/notify";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdvertiserSession();
  if (!session) return NextResponse.redirect(new URL("/advertiser/login", req.url));

  const { id } = await params;
  const f = await req.formData();
  const target = String(f.get("target") || "SELECTED"); // SELECTED | ALL
  const title = String(f.get("title") || "").trim();
  const body = String(f.get("body") || "").trim();

  if (!title || body.length < 5) {
    const url = new URL(`/advertiser/campaigns/${id}/applicants`, req.url);
    url.searchParams.set("error", "제목과 5자 이상 본문을 입력해주세요.");
    return NextResponse.redirect(url, 303);
  }

  const campaign = await db.campaign.findUnique({ where: { id } });
  if (!campaign || campaign.advertiserId !== session.id) {
    return NextResponse.redirect(new URL("/advertiser", req.url));
  }

  const where: Record<string, unknown> = { campaignId: id };
  if (target === "SELECTED") where.status = "SELECTED";

  const apps = await db.application.findMany({
    where,
    select: { userId: true },
  });
  const uniq = Array.from(new Set(apps.map((a) => a.userId)));

  await notifyMany(
    uniq.map((userId) => ({
      role: "USER",
      recipientId: userId,
      title: `[${campaign.title}] ${title}`,
      body,
      link: "/mypage",
    }))
  );

  const url = new URL(`/advertiser/campaigns/${id}/applicants`, req.url);
  url.searchParams.set("sent", String(uniq.length));
  return NextResponse.redirect(url, 303);
}
