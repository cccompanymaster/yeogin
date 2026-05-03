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
  const f = await req.formData();
  const action = String(f.get("action") || f.get("_method") || "patch");

  const owned = await db.campaign.findUnique({ where: { id } });
  if (!owned || owned.advertiserId !== session.id) {
    return NextResponse.redirect(new URL("/advertiser/campaigns", req.url));
  }

  const get = (k: string) => String(f.get(k) || "").trim();
  const num = (k: string) => Number(f.get(k) || 0);
  const date = (k: string) => new Date(get(k));

  if (action === "close") {
    await db.campaign.update({ where: { id }, data: { status: "CLOSED" } });
    return NextResponse.redirect(new URL("/advertiser/campaigns", req.url));
  }

  if (action === "duplicate") {
    const dup = await db.campaign.create({
      data: {
        advertiserId: session.id,
        title: owned.title + " (사본)",
        description: owned.description,
        thumbnail: owned.thumbnail,
        type: owned.type,
        channel: owned.channel,
        category: owned.category,
        region: owned.region,
        address: owned.address,
        offer: owned.offer,
        offerValue: owned.offerValue,
        capacity: owned.capacity,
        applyStart: new Date(),
        applyEnd: new Date(Date.now() + 7 * 86400000),
        announceAt: new Date(Date.now() + 8 * 86400000),
        reviewStart: new Date(Date.now() + 9 * 86400000),
        reviewEnd: new Date(Date.now() + 23 * 86400000),
        guide: owned.guide,
        keywords: owned.keywords,
        fastMatch: owned.fastMatch,
      },
    });
    return NextResponse.redirect(new URL(`/advertiser/campaigns/${dup.id}/edit`, req.url));
  }

  // patch (edit)
  try {
    await db.campaign.update({
      where: { id },
      data: {
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
  } catch {
    const url = new URL(`/advertiser/campaigns/${id}/edit`, req.url);
    url.searchParams.set("error", "수정에 실패했습니다.");
    return NextResponse.redirect(url, 303);
  }
  return NextResponse.redirect(new URL("/advertiser/campaigns", req.url));
}
