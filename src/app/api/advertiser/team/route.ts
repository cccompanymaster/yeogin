import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getAdvertiserSession();
  if (!session) return NextResponse.redirect(new URL("/advertiser/login", req.url));

  const f = await req.formData();
  const email = String(f.get("email") || "").trim().toLowerCase();
  const role = String(f.get("role") || "MEMBER");

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    const url = new URL("/advertiser/team", req.url);
    url.searchParams.set("error", "올바른 이메일을 입력해주세요.");
    return NextResponse.redirect(url, 303);
  }

  const exists = await db.advertiserMember.findUnique({
    where: { advertiserId_email: { advertiserId: session.id, email } },
  });
  if (exists) {
    const url = new URL("/advertiser/team", req.url);
    url.searchParams.set("error", "이미 초대된 이메일입니다.");
    return NextResponse.redirect(url, 303);
  }

  await db.advertiserMember.create({
    data: { advertiserId: session.id, email, role },
  });

  // Demo: 콘솔에 초대 링크 출력
  console.log(
    `[team-invite] ${email} → 초대 (광고주 ${session.name}, role=${role})`
  );

  const url = new URL("/advertiser/team", req.url);
  url.searchParams.set("ok", "1");
  return NextResponse.redirect(url, 303);
}
