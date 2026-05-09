import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { notify } from "@/lib/notify";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession();
  if (!session || !isAdminEmail(session.email)) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  const { id } = await params;
  const f = await req.formData();
  const action = String(f.get("action") || "");
  const answer = String(f.get("answer") || "").trim();
  const isPublic = f.get("isPublic") === "1";

  const q = await db.question.findUnique({ where: { id } });
  if (!q) return NextResponse.redirect(new URL("/admin/questions", req.url));

  if (action === "answer") {
    if (answer.length < 5) {
      return NextResponse.redirect(new URL("/admin/questions", req.url));
    }
    await db.question.update({
      where: { id },
      data: {
        answer,
        isPublic,
        status: "ANSWERED",
        answeredAt: new Date(),
      },
    });
    await notify({
      role: "USER",
      recipientId: q.userId,
      title: "💬 문의 답변이 등록되었어요",
      body: `"${q.title}" 문의에 답변이 등록되었습니다. Q&A 페이지에서 확인하세요.`,
      link: "/support?tab=mine",
    });
  } else if (action === "close") {
    await db.question.update({ where: { id }, data: { status: "CLOSED" } });
  }

  const url = new URL("/admin/questions", req.url);
  url.searchParams.set("ok", "1");
  return NextResponse.redirect(url, 303);
}
