import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");
  if (!isAdminEmail(session.email)) {
    return <div className="card p-10 text-center">권한이 없습니다</div>;
  }
  const { id } = await params;
  const a = await db.article.findUnique({ where: { id } });
  if (!a) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/articles" className="text-xs text-ink-500">
        ← 매거진 관리
      </Link>
      <h1 className="mt-1 text-2xl font-bold">매거진 글 수정</h1>

      <form
        action={`/api/admin/articles/${a.id}`}
        method="post"
        className="mt-6 space-y-4"
      >
        <input type="hidden" name="action" value="update" />
        <div>
          <label className="label">슬러그</label>
          <input
            className="input"
            name="slug"
            required
            pattern="[a-z0-9-]+"
            defaultValue={a.slug}
          />
        </div>
        <div>
          <label className="label">제목</label>
          <input className="input" name="title" required defaultValue={a.title} />
        </div>
        <div>
          <label className="label">카테고리</label>
          <select className="input" name="category" defaultValue={a.category}>
            <option value="TIPS">노하우</option>
            <option value="NEWS">소식</option>
            <option value="CASE">사례</option>
          </select>
        </div>
        <div>
          <label className="label">커버 이미지 URL</label>
          <input className="input" name="coverImage" required defaultValue={a.coverImage} />
        </div>
        <div>
          <label className="label">발췌</label>
          <textarea className="input min-h-20" name="excerpt" required defaultValue={a.excerpt} />
        </div>
        <div>
          <label className="label">저자명</label>
          <input className="input" name="authorName" required defaultValue={a.authorName} />
        </div>
        <div>
          <label className="label">본문</label>
          <textarea className="input min-h-64" name="body" required defaultValue={a.body} />
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="publish"
              value="1"
              defaultChecked={!!a.publishedAt}
            />
            발행됨
          </label>
        </div>
        <button className="btn-primary w-full py-3">저장</button>
      </form>
    </div>
  );
}
