import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { notify } from "@/lib/notify";

const COOLDOWN_DAYS = 14;

export async function POST(req: NextRequest) {
  const session = await getAdvertiserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const userId = String(body.userId || "");
  const campaignId = body.campaignId ? String(body.campaignId) : null;
  const title = String(body.title || "").trim();
  const message = String(body.message || "").trim();
  const offerSummary = body.offerSummary ? String(body.offerSummary).slice(0, 120) : null;

  if (!userId || !title || message.length < 10) {
    return NextResponse.json({ error: "제목과 10자 이상 메시지를 입력해주세요." }, { status: 400 });
  }

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, nickname: true, publicProfile: true },
  });
  if (!target) return NextResponse.json({ error: "인플루언서를 찾을 수 없습니다." }, { status: 404 });
  if (!target.publicProfile)
    return NextResponse.json({ error: "비공개 프로필 사용자에게는 초대할 수 없습니다." }, { status: 403 });

  // 쿨다운 검사 — 같은 광고주가 같은 사용자에게 14일 이내 중복 차단
  const since = new Date(Date.now() - COOLDOWN_DAYS * 86400000);
  const recent = await db.directInvite.findFirst({
    where: {
      advertiserId: session.id,
      userId,
      createdAt: { gte: since },
    },
  });
  if (recent) {
    return NextResponse.json(
      { error: `같은 인플루언서에게 ${COOLDOWN_DAYS}일 내에 이미 초대를 보냈습니다.` },
      { status: 400 }
    );
  }

  // 캠페인 검증 (광고주 본인 캠페인 + OPEN 상태)
  if (campaignId) {
    const c = await db.campaign.findUnique({ where: { id: campaignId } });
    if (!c || c.advertiserId !== session.id) {
      return NextResponse.json({ error: "캠페인 권한이 없습니다." }, { status: 403 });
    }
    if (c.status !== "OPEN") {
      return NextResponse.json({ error: "진행중 캠페인만 초대에 사용할 수 있습니다." }, { status: 400 });
    }
  }

  const expiresAt = new Date(Date.now() + 7 * 86400000); // 7일 후 만료

  const invite = await db.directInvite.create({
    data: {
      advertiserId: session.id,
      userId,
      campaignId,
      title,
      message,
      offerSummary,
      expiresAt,
    },
  });

  await notify({
    role: "USER",
    recipientId: userId,
    title: `📨 ${session.name}에서 초대를 보냈어요`,
    body: `"${title}" — 마이페이지 받은 제안에서 확인해주세요.`,
    link: "/mypage/invites",
  });

  return NextResponse.json({ ok: true, id: invite.id });
}
