import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { fmtDate } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";

export const metadata = { title: "공지사항 관리 - 운영센터" };

const LEVEL_LABEL: Record<string, string> = {
  INFO: "공지",
  WARN: "안내",
  EVENT: "이벤트",
};

export default async function AdminNoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");
  if (!isAdminEmail(session.email)) {
    return <div className="card p-10 text-center">권한이 없습니다</div>;
  }
  const sp = await searchParams;

  const notices = await db.notice.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin" className="text-xs text-ink-500">
          ← 운영센터
        </Link>
        <h1 className="mt-1 text-2xl font-bold">📢 공지사항 관리</h1>
      </div>

      {sp.ok && (
        <div className="card border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20">
          ✓ 공지가 등록되었습니다.
        </div>
      )}
      {sp.error && (
        <div className="card border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20">
          {decodeURIComponent(sp.error)}
        </div>
      )}

      <div className="card p-5">
        <h2 className="text-base font-bold">새 공지 작성</h2>
        <form action="/api/admin/notices" method="post" className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select name="level" className="input" defaultValue="INFO">
              <option value="INFO">📢 공지</option>
              <option value="WARN">⚠️ 안내</option>
              <option value="EVENT">🎉 이벤트</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="pinned" value="1" className="h-4 w-4" />
              📌 상단 띠배너에 고정
            </label>
          </div>
          <input
            className="input"
            name="title"
            required
            maxLength={120}
            placeholder="제목 (예: 5월 가정의 달 더블 포인트 이벤트)"
          />
          <textarea
            className="input min-h-28"
            name="body"
            required
            minLength={10}
            maxLength={2000}
            placeholder="본문 (자유 형식)"
          />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">시작일 (선택)</label>
              <input className="input" name="startsAt" type="date" />
            </div>
            <div>
              <label className="label">종료일 (선택)</label>
              <input className="input" name="endsAt" type="date" />
            </div>
            <div>
              <label className="label">외부 링크 (선택)</label>
              <input className="input" name="link" type="url" placeholder="https://..." />
            </div>
          </div>
          <button className="btn-primary w-full py-2.5">공지 등록</button>
        </form>
      </div>

      <div>
        <h2 className="mb-3 text-base font-bold">공지 목록 ({notices.length})</h2>
        {notices.length === 0 ? (
          <EmptyState icon="📭" title="등록된 공지가 없습니다" />
        ) : (
          <div className="card divide-y divide-ink-100 dark:divide-ink-700">
            {notices.map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="badge bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-200">
                      {LEVEL_LABEL[n.level] || n.level}
                    </span>
                    {n.pinned && (
                      <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                        📌 고정
                      </span>
                    )}
                    <span className="text-ink-500 dark:text-ink-400">
                      {fmtDate(n.createdAt)}
                      {n.endsAt && ` ~ ${fmtDate(n.endsAt)}`}
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-bold">{n.title}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-ink-500 dark:text-ink-400">
                    {n.body}
                  </div>
                </div>
                <form action={`/api/admin/notices/${n.id}`} method="post">
                  <input type="hidden" name="action" value="delete" />
                  <button className="badge bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300">
                    삭제
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
