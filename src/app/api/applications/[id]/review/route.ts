import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { notify } from "@/lib/notify";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const url = String(body.url || "").trim();
  const snippet = body.bodySnippet ? String(body.bodySnippet).trim() : "";
  if (!/^https?:\/\//.test(url)) {
    return NextResponse.json({ error: "올바른 URL을 입력해주세요." }, { status: 400 });
  }

  const app = await db.application.findUnique({
    where: { id },
    include: { campaign: true },
  });
  if (!app || app.userId !== session.id) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  if (app.status !== "SELECTED") {
    return NextResponse.json({ error: "선정된 신청만 리뷰를 등록할 수 있습니다." }, { status: 400 });
  }

  // 키워드 검수: 발췌가 있으면 포함 여부 체크
  const keywords = app.campaign.keywords
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  let keywordCheck: string = "NONE";
  let missing: string[] = [];
  if (snippet) {
    missing = keywords.filter((k) => !snippet.includes(k));
    keywordCheck = missing.length === 0 ? "PASS" : "WARN";
  }

  await db.review.upsert({
    where: { applicationId: id },
    create: {
      applicationId: id,
      campaignId: app.campaignId,
      userId: session.id,
      url,
      bodySnippet: snippet || null,
      keywordCheck,
      missingKeys: missing.join(","),
    },
    update: {
      url,
      status: "PENDING",
      rejectReason: null,
      bodySnippet: snippet || null,
      keywordCheck,
      missingKeys: missing.join(","),
    },
  });

  await notify({
    role: "ADVERTISER",
    recipientId: app.campaign.advertiserId,
    title: "검수 대기 리뷰가 도착했습니다",
    body: `${app.campaign.title} 캠페인의 리뷰가 등록되어 검수 대기 중입니다.`,
    link: "/advertiser/reviews",
  });

  return NextResponse.json({ ok: true, missingKeys: missing });
}
