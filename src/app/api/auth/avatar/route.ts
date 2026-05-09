import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";

const MAX = 800 * 1024; // 800KB (data URL base64 → 약 600KB 원본)

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || "set");

  if (action === "remove") {
    await db.user.update({ where: { id: session.id }, data: { avatarUrl: null } });
    return NextResponse.json({ ok: true });
  }

  const dataUrl = String(body.imageData || "");
  if (!dataUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "이미지를 첨부해주세요." }, { status: 400 });
  }
  if (dataUrl.length > MAX) {
    return NextResponse.json({ error: "800KB 이하 이미지를 사용해주세요." }, { status: 400 });
  }
  await db.user.update({ where: { id: session.id }, data: { avatarUrl: dataUrl } });
  return NextResponse.json({ ok: true });
}
