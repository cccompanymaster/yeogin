import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession, setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.redirect(new URL("/login", req.url));

  const f = await req.formData();
  const get = (k: string) => String(f.get(k) || "").trim();
  const nickname = get("nickname");
  if (!nickname) {
    const url = new URL("/mypage/edit", req.url);
    url.searchParams.set("error", "닉네임은 필수입니다.");
    return NextResponse.redirect(url, 303);
  }

  const updated = await db.user.update({
    where: { id: session.id },
    data: {
      nickname,
      phone: get("phone") || null,
      region: get("region") || null,
      blogUrl: get("blogUrl") || null,
      instaUrl: get("instaUrl") || null,
      youtubeUrl: get("youtubeUrl") || null,
    },
  });

  // 세션 토큰의 name 갱신
  await setSessionCookie({
    id: updated.id,
    role: "user",
    email: updated.email,
    name: updated.nickname,
  });

  const url = new URL("/mypage/edit", req.url);
  url.searchParams.set("ok", "1");
  return NextResponse.redirect(url, 303);
}
