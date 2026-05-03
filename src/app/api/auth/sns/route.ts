import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { fetchYouTubeSubs } from "@/lib/sns";

const VALID = new Set(["blog", "insta", "youtube", "tiktok"]);

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const channel = String(body.channel || "");
  const url = String(body.url || "").trim();
  const metricRaw = body.metric;

  if (!VALID.has(channel)) {
    return NextResponse.json({ error: "잘못된 채널" }, { status: 400 });
  }
  if (url && !/^https?:\/\//.test(url)) {
    return NextResponse.json({ error: "올바른 URL을 입력해주세요." }, { status: 400 });
  }

  // 유튜브: API로 자동 가져오기 (키 있으면)
  if (channel === "youtube" && url && process.env.YOUTUBE_API_KEY) {
    const r = await fetchYouTubeSubs(url);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    await db.user.update({
      where: { id: session.id },
      data: {
        youtubeUrl: url,
        youtubeSubscribers: r.metric,
        youtubeVerifiedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true, metric: r.metric, verified: r.verifiedHandle });
  }

  // 그 외: 수동 입력
  const metric =
    metricRaw === null || metricRaw === undefined || metricRaw === ""
      ? null
      : Number(metricRaw);
  if (metric !== null && (Number.isNaN(metric) || metric < 0)) {
    return NextResponse.json({ error: "유효한 숫자를 입력해주세요." }, { status: 400 });
  }

  const now = new Date();
  const data: Record<string, unknown> = {};
  if (channel === "blog") {
    data.blogUrl = url || null;
    data.blogVisitors = metric;
    data.blogVerifiedAt = metric != null ? now : null;
  } else if (channel === "insta") {
    data.instaUrl = url || null;
    data.instaFollowers = metric;
    data.instaVerifiedAt = metric != null ? now : null;
  } else if (channel === "youtube") {
    data.youtubeUrl = url || null;
    data.youtubeSubscribers = metric;
    data.youtubeVerifiedAt = metric != null ? now : null;
  } else if (channel === "tiktok") {
    data.tiktokUrl = url || null;
    data.tiktokFollowers = metric;
    data.tiktokVerifiedAt = metric != null ? now : null;
  }

  await db.user.update({ where: { id: session.id }, data });
  return NextResponse.json({ ok: true, metric });
}
