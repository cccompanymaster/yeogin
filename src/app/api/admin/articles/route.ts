import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";

const SLUG = /^[a-z0-9-]+$/;

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session || !isAdminEmail(session.email)) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  const f = await req.formData();
  const slug = String(f.get("slug") || "").trim();
  if (!SLUG.test(slug)) {
    return redirectErr(req, "/admin/articles/new", "슬러그 형식이 올바르지 않습니다.");
  }
  const title = String(f.get("title") || "").trim();
  const excerpt = String(f.get("excerpt") || "").trim();
  const body = String(f.get("body") || "").trim();
  const coverImage = String(f.get("coverImage") || "").trim();
  const authorName = String(f.get("authorName") || "").trim() || "여긴 에디터";
  const category = String(f.get("category") || "TIPS");
  const publish = f.get("publish") === "1";

  if (!title || !excerpt || !body || !coverImage) {
    return redirectErr(req, "/admin/articles/new", "모든 필수 항목을 입력해주세요.");
  }

  const exists = await db.article.findUnique({ where: { slug } });
  if (exists) {
    return redirectErr(req, "/admin/articles/new", "이미 사용 중인 슬러그입니다.");
  }

  await db.article.create({
    data: {
      slug,
      title,
      excerpt,
      body,
      coverImage,
      authorName,
      category,
      publishedAt: publish ? new Date() : null,
    },
  });
  return NextResponse.redirect(new URL("/admin/articles", req.url));
}

function redirectErr(req: NextRequest, path: string, msg: string) {
  const url = new URL(path, req.url);
  url.searchParams.set("error", msg);
  return NextResponse.redirect(url, 303);
}
