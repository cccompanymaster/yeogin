import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";

const MAX_BYTES = 1.5 * 1024 * 1024; // 1.5MB (data URL은 base64라 실제 1MB 정도)

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const channel = String(body.channel || "");
  const url = String(body.url || "").trim();
  const metric = Number(body.metric || 0);
  const imageData = String(body.imageData || "");

  if (!["blog", "insta", "youtube", "tiktok"].includes(channel))
    return NextResponse.json({ error: "잘못된 채널" }, { status: 400 });
  if (!/^https?:\/\//.test(url))
    return NextResponse.json({ error: "올바른 URL을 입력해주세요." }, { status: 400 });
  if (Number.isNaN(metric) || metric < 0)
    return NextResponse.json({ error: "유효한 숫자를 입력해주세요." }, { status: 400 });
  if (!imageData.startsWith("data:image/"))
    return NextResponse.json({ error: "이미지를 첨부해주세요." }, { status: 400 });
  if (imageData.length > MAX_BYTES)
    return NextResponse.json({ error: "이미지 크기는 1.5MB 이하여야 합니다." }, { status: 400 });

  // 같은 채널의 이전 PENDING이 있으면 교체
  await db.snsVerification.deleteMany({
    where: { userId: session.id, channel, status: "PENDING" },
  });

  await db.snsVerification.create({
    data: {
      userId: session.id,
      channel,
      url,
      metric,
      imageData,
    },
  });

  return NextResponse.json({ ok: true });
}
