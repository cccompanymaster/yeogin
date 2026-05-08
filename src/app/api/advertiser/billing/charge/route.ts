import { NextRequest, NextResponse } from "next/server";
import { getAdvertiserSession } from "@/lib/session";
import {
  CHARGE_PACKAGES,
  recordAdvertiserPoint,
} from "@/lib/advertiser-points";

export async function POST(req: NextRequest) {
  const session = await getAdvertiserSession();
  if (!session) return NextResponse.redirect(new URL("/advertiser/login", req.url));

  const f = await req.formData();
  const amount = Number(f.get("amount") || 0);
  const pkg = CHARGE_PACKAGES.find((p) => p.amount === amount);
  if (!pkg) return NextResponse.redirect(new URL("/advertiser/billing/charge", req.url));

  const total = pkg.amount + pkg.bonus;
  await recordAdvertiserPoint(session.id, total, "CHARGE", {
    note: `${pkg.label} 충전`,
  });

  const url = new URL("/advertiser/billing/charge", req.url);
  url.searchParams.set("ok", String(total));
  return NextResponse.redirect(url, 303);
}
