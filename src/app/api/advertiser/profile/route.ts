import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getAdvertiserSession, setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getAdvertiserSession();
  if (!session) return NextResponse.redirect(new URL("/advertiser/login", req.url));

  const f = await req.formData();
  const get = (k: string) => String(f.get(k) || "").trim();
  const companyName = get("companyName");
  const bizNumber = get("bizNumber");
  const contactName = get("contactName");
  const phone = get("phone");
  const currentPassword = get("currentPassword");
  const newPassword = get("newPassword");

  if (!companyName || !bizNumber || !contactName || !phone) {
    return redirectErr(req, "필수 항목을 모두 입력해주세요.");
  }

  const adv = await db.advertiser.findUnique({ where: { id: session.id } });
  if (!adv) return NextResponse.redirect(new URL("/advertiser/login", req.url));

  let passwordHash: string | undefined;
  if (newPassword) {
    if (!currentPassword) return redirectErr(req, "현재 비밀번호를 입력해주세요.");
    const ok = await bcrypt.compare(currentPassword, adv.passwordHash);
    if (!ok) return redirectErr(req, "현재 비밀번호가 일치하지 않습니다.");
    if (newPassword.length < 6) return redirectErr(req, "새 비밀번호는 6자 이상이어야 합니다.");
    passwordHash = await bcrypt.hash(newPassword, 10);
  }

  const updated = await db.advertiser.update({
    where: { id: session.id },
    data: {
      companyName,
      bizNumber,
      contactName,
      phone,
      ...(passwordHash ? { passwordHash } : {}),
    },
  });

  // 세션의 회사명도 갱신
  await setSessionCookie({
    id: updated.id,
    role: "advertiser",
    email: updated.email,
    name: updated.companyName,
  });

  const url = new URL("/advertiser/profile", req.url);
  url.searchParams.set("ok", "1");
  return NextResponse.redirect(url, 303);
}

function redirectErr(req: NextRequest, msg: string) {
  const url = new URL("/advertiser/profile", req.url);
  url.searchParams.set("error", msg);
  return NextResponse.redirect(url, 303);
}
