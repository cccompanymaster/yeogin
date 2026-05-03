import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  await clearSession("advertiser");
  return NextResponse.redirect(new URL("/advertiser", req.url));
}
