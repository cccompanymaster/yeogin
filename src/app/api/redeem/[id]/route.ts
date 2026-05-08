import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { recordPoint } from "@/lib/points";
import { notify } from "@/lib/notify";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession();
  if (!session) return NextResponse.redirect(new URL("/login", req.url));
  const { id } = await params;

  const item = await db.redeemItem.findUnique({ where: { id } });
  if (!item || !item.active) {
    const url = new URL("/mypage/shop", req.url);
    url.searchParams.set("error", "상품을 찾을 수 없습니다.");
    return NextResponse.redirect(url, 303);
  }
  if (item.stock <= 0) {
    const url = new URL("/mypage/shop", req.url);
    url.searchParams.set("error", "품절된 상품입니다.");
    return NextResponse.redirect(url, 303);
  }

  const me = await db.user.findUnique({
    where: { id: session.id },
    select: { point: true },
  });
  if (!me || me.point < item.cost) {
    const url = new URL("/mypage/shop", req.url);
    url.searchParams.set("error", "포인트가 부족합니다.");
    return NextResponse.redirect(url, 303);
  }

  // 코드 발급 (mock)
  const code = `YGN-${randomBytes(6).toString("hex").toUpperCase()}`;

  await db.$transaction([
    db.redeemItem.update({
      where: { id: item.id },
      data: { stock: { decrement: 1 } },
    }),
    db.redeem.create({
      data: {
        userId: session.id,
        itemId: item.id,
        cost: item.cost,
        code,
      },
    }),
  ]);
  await recordPoint(session.id, -item.cost, "REDEEM", item.name);

  await notify({
    role: "USER",
    recipientId: session.id,
    title: "🎁 포인트 교환 완료",
    body: `${item.name} 교환이 완료되었습니다. 코드: ${code}`,
    link: "/mypage/shop",
  });

  const url = new URL("/mypage/shop", req.url);
  url.searchParams.set("ok", "1");
  url.searchParams.set("code", code);
  return NextResponse.redirect(url, 303);
}
