import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import {
  calcCampaignCost,
  recordAdvertiserPoint,
} from "@/lib/advertiser-points";

/** DRAFT → OPEN 즉시 발행 (잔액 검증 + 포인트 차감) */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdvertiserSession();
  if (!session) return NextResponse.redirect(new URL("/advertiser/login", req.url));
  const { id } = await params;

  const c = await db.campaign.findUnique({ where: { id } });
  if (!c || c.advertiserId !== session.id) {
    return NextResponse.redirect(new URL("/advertiser/campaigns", req.url));
  }
  if (c.status !== "DRAFT") {
    return NextResponse.redirect(new URL("/advertiser/campaigns", req.url));
  }

  const cost = calcCampaignCost({
    capacity: c.capacity,
    type: c.type,
    fastMatch: c.fastMatch,
  });
  const adv = await db.advertiser.findUnique({
    where: { id: session.id },
    select: { point: true },
  });
  if (!adv || adv.point < cost) {
    const url = new URL("/advertiser/billing/charge", req.url);
    url.searchParams.set("need", String(cost - (adv?.point ?? 0)));
    return NextResponse.redirect(url, 303);
  }

  await db.campaign.update({
    where: { id },
    data: { status: "OPEN", publishAt: null },
  });
  await recordAdvertiserPoint(session.id, -cost, "CAMPAIGN_OPEN", {
    note: c.title,
    campaignId: c.id,
  });

  return NextResponse.redirect(new URL(`/advertiser/campaigns/${id}/applicants`, req.url));
}
