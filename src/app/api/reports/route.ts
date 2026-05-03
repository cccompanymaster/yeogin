import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";

const VALID = new Set(["FALSE_INFO", "BAD_TREATMENT", "SPAM", "OTHER"]);

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const reason = String(body.reason || "");
  const detail = String(body.detail || "").trim();
  const campaignId = body.campaignId ? String(body.campaignId) : null;

  if (!VALID.has(reason)) {
    return NextResponse.json({ error: "사유를 선택해주세요." }, { status: 400 });
  }
  if (detail.length < 10) {
    return NextResponse.json({ error: "상세 내용은 10자 이상 작성해주세요." }, { status: 400 });
  }

  await db.report.create({
    data: {
      reporterUserId: session.id,
      campaignId,
      reason,
      detail,
    },
  });

  return NextResponse.json({ ok: true });
}
