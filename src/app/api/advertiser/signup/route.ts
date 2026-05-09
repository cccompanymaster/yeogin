import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const companyName = String(form.get("companyName") || "").trim();
  const bizNumber = String(form.get("bizNumber") || "").trim();
  const contactName = String(form.get("contactName") || "").trim();
  const phone = String(form.get("phone") || "").trim();

  if (!email || !password || password.length < 6 || !companyName || !bizNumber) {
    const url = new URL("/advertiser/signup", req.url);
    url.searchParams.set("error", "필수 정보를 입력해주세요.");
    return NextResponse.redirect(url, 303);
  }
  if (
    form.get("agreeTerms") !== "1" ||
    form.get("agreePrivacy") !== "1" ||
    form.get("agreeBiz") !== "1"
  ) {
    const url = new URL("/advertiser/signup", req.url);
    url.searchParams.set("error", "필수 약관에 모두 동의해주세요.");
    return NextResponse.redirect(url, 303);
  }

  const exists = await db.advertiser.findUnique({ where: { email } });
  if (exists) {
    const url = new URL("/advertiser/signup", req.url);
    url.searchParams.set("error", "이미 가입된 이메일입니다.");
    return NextResponse.redirect(url, 303);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const adv = await db.advertiser.create({
    data: { email, passwordHash, companyName, bizNumber, contactName, phone },
  });
  await setSessionCookie({
    id: adv.id,
    role: "advertiser",
    email: adv.email,
    name: adv.companyName,
  });
  return NextResponse.redirect(new URL("/advertiser/dashboard", req.url));
}
