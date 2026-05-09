import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";

export default async function NewArticlePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");
  if (!isAdminEmail(session.email)) {
    return <div className="card p-10 text-center">권한이 없습니다</div>;
  }
  const sp = await searchParams;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/articles" className="text-xs text-ink-500">
        ← 매거진 관리
      </Link>
      <h1 className="mt-1 text-2xl font-bold">새 매거진 글</h1>

      <form action="/api/admin/articles" method="post" className="mt-6 space-y-4">
        <div>
          <label className="label">슬러그 (URL) *</label>
          <input
            className="input"
            name="slug"
            required
            pattern="[a-z0-9-]+"
            placeholder="campaign-tips-for-beginners"
          />
          <p className="mt-1 text-[11px] text-ink-500">
            영어 소문자/숫자/하이픈만. 예: <code>first-campaign-tips</code>
          </p>
        </div>
        <div>
          <label className="label">제목 *</label>
          <input className="input" name="title" required maxLength={120} />
        </div>
        <div>
          <label className="label">카테고리 *</label>
          <select className="input" name="category" defaultValue="TIPS">
            <option value="TIPS">노하우</option>
            <option value="NEWS">소식</option>
            <option value="CASE">사례</option>
          </select>
        </div>
        <div>
          <label className="label">커버 이미지 URL *</label>
          <input
            className="input"
            name="coverImage"
            required
            defaultValue="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=900&q=80"
          />
        </div>
        <div>
          <label className="label">발췌 (썸네일에 표시) *</label>
          <textarea className="input min-h-20" name="excerpt" required maxLength={200} />
        </div>
        <div>
          <label className="label">저자명 *</label>
          <input className="input" name="authorName" required defaultValue="여긴 에디터" />
        </div>
        <div>
          <label className="label">본문 *</label>
          <textarea className="input min-h-64" name="body" required />
          <p className="mt-1 text-[11px] text-ink-500">줄바꿈은 그대로 유지됩니다.</p>
        </div>
        <div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="publish" value="1" defaultChecked />
            지금 발행 (체크 해제 시 초안 저장)
          </label>
        </div>
        {sp.error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {decodeURIComponent(sp.error)}
          </div>
        )}
        <button className="btn-primary w-full py-3">저장</button>
      </form>
    </div>
  );
}
