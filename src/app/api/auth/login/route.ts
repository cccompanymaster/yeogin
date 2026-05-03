import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    const url = new URL("/login", req.url);
    url.searchParams.set("error", "이메일 또는 비밀번호가 올바르지 않습니다.");
    return NextResponse.redirect(url, 303);
  }
  await setSessionCookie({ id: user.id, role: "user", email: user.email, name: user.nickname });
  return NextResponse.redirect(new URL("/", req.url));
}
