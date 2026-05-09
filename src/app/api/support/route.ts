import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";

const VALID = new Set(["ACCOUNT", "CAMPAIGN", "REVIEW", "POINT", "ETC"]);

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.redirect(new URL("/login", req.url));

  const f = await req.formData();
  const category = String(f.get("category") || "ETC");
  const title = String(f.get("title") || "").trim();
  const body = String(f.get("body") || "").trim();
  const isPublic = f.get("isPublic") === "1";

  if (!VALID.has(category)) {
    const url = new URL("/support", req.url);
    url.searchParams.set("error", "카테고리를 선택해주세요.");
    return NextResponse.redirect(url, 303);
  }
  if (!title || body.length < 10) {
    const url = new URL("/support", req.url);
    url.searchParams.set("error", "제목과 10자 이상의 내용을 입력해주세요.");
    return NextResponse.redirect(url, 303);
  }

  await db.question.create({
    data: { userId: session.id, category, title, body, isPublic: false },
  });

  // 공개 요청 시도 — 운영팀 검토 후 활성화 (나중)
  void isPublic;

  const url = new URL("/support", req.url);
  url.searchParams.set("ok", "1");
  url.searchParams.set("tab", "mine");
  return NextResponse.redirect(url, 303);
}
