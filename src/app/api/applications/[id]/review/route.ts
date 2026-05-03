import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const url = String(body.url || "").trim();
  if (!/^https?:\/\//.test(url)) {
    return NextResponse.json({ error: "올바른 URL을 입력해주세요." }, { status: 400 });
  }

  const app = await db.application.findUnique({ where: { id } });
  if (!app || app.userId !== session.id) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  if (app.status !== "SELECTED") {
    return NextResponse.json({ error: "선정된 신청만 리뷰를 등록할 수 있습니다." }, { status: 400 });
  }

  await db.review.upsert({
    where: { applicationId: id },
    create: {
      applicationId: id,
      campaignId: app.campaignId,
      userId: session.id,
      url,
    },
    update: { url, status: "PENDING", rejectReason: null },
  });

  return NextResponse.json({ ok: true });
}
