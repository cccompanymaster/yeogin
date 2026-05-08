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
  const m = await db.advertiserMember.findUnique({ where: { id } });
  if (!m || m.advertiserId !== session.id) {
    return NextResponse.redirect(new URL("/advertiser/team", req.url));
  }
  await db.advertiserMember.delete({ where: { id } });
  return NextResponse.redirect(new URL("/advertiser/team", req.url));
}
