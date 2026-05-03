import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getAdvertiserSession();
  if (!session) return NextResponse.redirect(new URL("/advertiser/login", req.url));

  const f = await req.formData();
  const get = (k: string) => String(f.get(k) || "").trim();
  const num = (k: string) => Number(f.get(k) || 0);
  const date = (k: string) => new Date(get(k));

  try {
    const c = await db.campaign.create({
      data: {
        advertiserId: session.id,
        title: get("title"),
        description: get("description"),
        thumbnail: get("thumbnail"),
        type: get("type"),
        channel: get("channel"),
        category: get("category"),
        region: get("region") || null,
        address: get("address") || null,
        offer: get("offer"),
        offerValue: num("offerValue"),
        capacity: num("capacity"),
        applyStart: date("applyStart"),
        applyEnd: date("applyEnd"),
        announceAt: date("announceAt"),
        reviewStart: date("reviewStart"),
        reviewEnd: date("reviewEnd"),
        guide: get("guide"),
        keywords: get("keywords"),
        fastMatch: f.get("fastMatch") === "1",
      },
    });
    return NextResponse.redirect(new URL(`/advertiser/campaigns/${c.id}/applicants`, req.url));
  } catch (e) {
    const url = new URL("/advertiser/campaigns/new", req.url);
    url.searchParams.set("error", "등록에 실패했습니다. 입력값을 확인해주세요.");
    return NextResponse.redirect(url, 303);
  }
}
