import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setSessionCookie } from "@/lib/session";
import { recordPoint } from "@/lib/points";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const nickname = String(form.get("nickname") || "").trim();
  const password = String(form.get("password") || "");
  const blogUrl = String(form.get("blogUrl") || "") || null;
  const instaUrl = String(form.get("instaUrl") || "") || null;

  if (!email || !password || password.length < 6 || !nickname) {
    return redirectWithError(req, "/signup", "필수 정보를 입력해주세요.");
  }
  const exists = await db.user.findUnique({ where: { email } });
  if (exists) return redirectWithError(req, "/signup", "이미 가입된 이메일입니다.");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { email, nickname, passwordHash, blogUrl, instaUrl, point: 0 },
  });
  await recordPoint(user.id, 5000, "SIGNUP_BONUS", "신규 가입 축하 적립");
  await setSessionCookie({ id: user.id, role: "user", email: user.email, name: user.nickname });
  return NextResponse.redirect(new URL("/", req.url));
}

function redirectWithError(req: NextRequest, path: string, msg: string) {
  const url = new URL(path, req.url);
  url.searchParams.set("error", msg);
  return NextResponse.redirect(url, 303);
}
