import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session || !isAdminEmail(session.email)) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  const f = await req.formData();
  const title = String(f.get("title") || "").trim();
  const body = String(f.get("body") || "").trim();
  const level = String(f.get("level") || "INFO");
  const link = String(f.get("link") || "").trim() || null;
  const startsRaw = String(f.get("startsAt") || "").trim();
  const endsRaw = String(f.get("endsAt") || "").trim();
  const pinned = f.get("pinned") === "1";

  if (!title || body.length < 10) {
    const url = new URL("/admin/notices", req.url);
    url.searchParams.set("error", "제목과 10자 이상의 본문이 필요합니다.");
    return NextResponse.redirect(url, 303);
  }

  await db.notice.create({
    data: {
      title,
      body,
      level,
      link,
      startsAt: startsRaw ? new Date(startsRaw) : null,
      endsAt: endsRaw ? new Date(endsRaw) : null,
      pinned,
    },
  });

  const url = new URL("/admin/notices", req.url);
  url.searchParams.set("ok", "1");
  return NextResponse.redirect(url, 303);
}
