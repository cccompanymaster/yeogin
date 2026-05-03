import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { notify } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const session = await getAdvertiserSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body.ids) ? body.ids : [];
  const action = String(body.action || "");
  if (ids.length === 0 || (action !== "select" && action !== "reject")) {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const apps = await db.application.findMany({
    where: { id: { in: ids } },
    include: { campaign: true },
  });
  const owned = apps.filter((a) => a.campaign.advertiserId === session.id);
  if (owned.length === 0)
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const next = action === "select" ? "SELECTED" : "REJECTED";
  await db.application.updateMany({
    where: { id: { in: owned.map((a) => a.id) } },
    data: { status: next },
  });

  await Promise.all(
    owned.map((a) =>
      notify({
        role: "USER",
        recipientId: a.userId,
        title:
          next === "SELECTED"
            ? "🎉 캠페인에 선정되었어요!"
            : "이번 캠페인은 아쉽게 미선정",
        body:
          next === "SELECTED"
            ? `${a.campaign.title} 캠페인 선정! 마이페이지에서 가이드를 확인하세요.`
            : `${a.campaign.title} 캠페인에 미선정되었습니다.`,
        link: "/mypage",
      })
    )
  );

  return NextResponse.json({ ok: true, count: owned.length });
}
