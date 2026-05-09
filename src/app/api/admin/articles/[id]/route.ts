import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";

const SLUG = /^[a-z0-9-]+$/;

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
  const action = String(f.get("action") || "update");

  if (action === "delete") {
    await db.article.delete({ where: { id } }).catch(() => {});
    return NextResponse.redirect(new URL("/admin/articles", req.url));
  }

  const slug = String(f.get("slug") || "").trim();
  if (!SLUG.test(slug)) {
    const url = new URL(`/admin/articles/${id}/edit`, req.url);
    url.searchParams.set("error", "슬러그 형식이 올바르지 않습니다.");
    return NextResponse.redirect(url, 303);
  }
  const title = String(f.get("title") || "").trim();
  const excerpt = String(f.get("excerpt") || "").trim();
  const body = String(f.get("body") || "").trim();
  const coverImage = String(f.get("coverImage") || "").trim();
  const authorName = String(f.get("authorName") || "").trim() || "여긴 에디터";
  const category = String(f.get("category") || "TIPS");
  const publish = f.get("publish") === "1";

  const a = await db.article.findUnique({ where: { id } });
  if (!a) return NextResponse.redirect(new URL("/admin/articles", req.url));

  await db.article.update({
    where: { id },
    data: {
      slug,
      title,
      excerpt,
      body,
      coverImage,
      authorName,
      category,
      publishedAt: publish ? a.publishedAt ?? new Date() : null,
    },
  });
  return NextResponse.redirect(new URL("/admin/articles", req.url));
}
