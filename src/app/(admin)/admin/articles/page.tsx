import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { fmtDate } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";

export const metadata = { title: "매거진 관리 - 운영센터" };

const CAT: Record<string, string> = { TIPS: "노하우", NEWS: "소식", CASE: "사례" };

export default async function AdminArticles() {
  const session = await getUserSession();
  if (!session) redirect("/login");
  if (!isAdminEmail(session.email)) {
    return (
      <div className="card p-10 text-center">
        <h1 className="text-lg font-bold">접근 권한이 없습니다</h1>
      </div>
    );
  }

  const articles = await db.article.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-xs text-ink-500">
            ← 운영센터
          </Link>
          <h1 className="mt-1 text-2xl font-bold">매거진 관리</h1>
        </div>
        <Link href="/admin/articles/new" className="btn-primary">
          + 새 글 작성
        </Link>
      </div>

      {articles.length === 0 ? (
        <EmptyState
          icon="📝"
          title="아직 작성된 글이 없습니다"
          cta={{ href: "/admin/articles/new", label: "첫 글 쓰기" }}
        />
      ) : (
        <div className="card divide-y divide-ink-100 dark:divide-ink-700">
          {articles.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.coverImage}
                className="h-16 w-24 flex-shrink-0 rounded-lg object-cover"
                alt=""
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="badge bg-brand-50 text-brand-700">
                    {CAT[a.category] || a.category}
                  </span>
                  {a.publishedAt ? (
                    <span className="badge bg-emerald-100 text-emerald-700">
                      ✓ 발행 {fmtDate(a.publishedAt)}
                    </span>
                  ) : (
                    <span className="badge bg-amber-100 text-amber-800">초안</span>
                  )}
                  <span className="text-ink-400">슬러그: {a.slug}</span>
                </div>
                <div className="line-clamp-1 text-sm font-bold">{a.title}</div>
                <div className="line-clamp-1 text-xs text-ink-500 dark:text-ink-400">
                  {a.excerpt}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {a.publishedAt && (
                  <Link
                    href={`/magazine/${a.slug}`}
                    target="_blank"
                    className="badge bg-ink-100 text-ink-700 hover:bg-ink-200 dark:bg-ink-700 dark:text-ink-200"
                  >
                    보기 ↗
                  </Link>
                )}
                <Link
                  href={`/admin/articles/${a.id}/edit`}
                  className="badge bg-brand-500 text-white hover:bg-brand-600"
                >
                  수정
                </Link>
                <form action={`/api/admin/articles/${a.id}`} method="post">
                  <input type="hidden" name="action" value="delete" />
                  <button className="badge bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300">
                    삭제
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
