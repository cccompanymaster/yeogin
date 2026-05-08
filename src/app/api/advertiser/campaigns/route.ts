import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import {
  calcCampaignCost,
  recordAdvertiserPoint,
} from "@/lib/advertiser-points";

export async function POST(req: NextRequest) {
  const session = await getAdvertiserSession();
  if (!session) return NextResponse.redirect(new URL("/advertiser/login", req.url));

  const f = await req.formData();
  const get = (k: string) => String(f.get(k) || "").trim();
  const num = (k: string) => Number(f.get(k) || 0);
  const date = (k: string) => new Date(get(k));

  const type = get("type");
  const capacity = num("capacity");
  const fastMatch = f.get("fastMatch") === "1";
  const cost = calcCampaignCost({ type, capacity, fastMatch });

  // 잔액 확인
  const adv = await db.advertiser.findUnique({
    where: { id: session.id },
    select: { point: true },
  });
  if (!adv) return NextResponse.redirect(new URL("/advertiser/login", req.url));
  if (adv.point < cost) {
    const url = new URL("/advertiser/billing/charge", req.url);
    url.searchParams.set("need", String(cost - adv.point));
    return NextResponse.redirect(url, 303);
  }

  try {
    const c = await db.campaign.create({
      data: {
        advertiserId: session.id,
        title: get("title"),
        description: get("description"),
        thumbnail: get("thumbnail"),
        type,
        channel: get("channel"),
        category: get("category"),
        region: get("region") || null,
        address: get("address") || null,
        offer: get("offer"),
        offerValue: num("offerValue"),
        capacity,
        applyStart: date("applyStart"),
        applyEnd: date("applyEnd"),
        announceAt: date("announceAt"),
        reviewStart: date("reviewStart"),
        reviewEnd: date("reviewEnd"),
        guide: get("guide"),
        keywords: get("keywords"),
        fastMatch,
      },
    });
    await recordAdvertiserPoint(session.id, -cost, "CAMPAIGN_OPEN", {
      note: c.title,
      campaignId: c.id,
    });
    return NextResponse.redirect(new URL(`/advertiser/campaigns/${c.id}/applicants`, req.url));
  } catch {
    const url = new URL("/advertiser/campaigns/new", req.url);
    url.searchParams.set("error", "등록에 실패했습니다. 입력값을 확인해주세요.");
    return NextResponse.redirect(url, 303);
  }
}
