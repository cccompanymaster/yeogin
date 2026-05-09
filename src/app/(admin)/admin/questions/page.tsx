import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { fmtDate } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";

export const metadata = { title: "Q&A 답변 - 운영센터" };

const CAT_LABEL: Record<string, string> = {
  ACCOUNT: "계정",
  CAMPAIGN: "캠페인",
  REVIEW: "리뷰",
  POINT: "포인트",
  ETC: "기타",
};

export default async function AdminQuestions({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; ok?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");
  if (!isAdminEmail(session.email)) {
    return <div className="card p-10 text-center">권한이 없습니다</div>;
  }
  const sp = await searchParams;
  const status = sp.status || "OPEN";

  const [items, openCount, answeredCount] = await Promise.all([
    db.question.findMany({
      where: { status },
      include: { user: { select: { nickname: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.question.count({ where: { status: "OPEN" } }),
    db.question.count({ where: { status: "ANSWERED" } }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin" className="text-xs text-ink-500">
          ← 운영센터
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Q&amp;A 답변</h1>
      </div>

      {sp.ok && (
        <div className="card border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20">
          ✓ 답변이 등록되었습니다.
        </div>
      )}

      <div className="flex gap-2">
        <Link
          href="/admin/questions?status=OPEN"
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            status === "OPEN"
              ? "bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900"
              : "border border-ink-300 bg-white text-ink-700 hover:bg-ink-100 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200"
          }`}
        >
          답변대기 {openCount}
        </Link>
        <Link
          href="/admin/questions?status=ANSWERED"
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            status === "ANSWERED"
              ? "bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900"
              : "border border-ink-300 bg-white text-ink-700 hover:bg-ink-100 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200"
          }`}
        >
          답변완료 {answeredCount}
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="💬" title="해당 상태의 문의가 없습니다" />
      ) : (
        <div className="space-y-3">
          {items.map((q) => (
            <div key={q.id} className="card space-y-3 p-4">
              <div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="badge bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-200">
                    {CAT_LABEL[q.category] || q.category}
                  </span>
                  <span className="text-ink-500 dark:text-ink-400">
                    {q.user.nickname} · {q.user.email} · {fmtDate(q.createdAt)}
                  </span>
                </div>
                <h2 className="mt-1 text-base font-bold">Q. {q.title}</h2>
                <p className="mt-2 whitespace-pre-line rounded-md bg-ink-50 p-3 text-sm dark:bg-ink-900">
                  {q.body}
                </p>
              </div>
              {q.answer && (
                <div className="rounded-md bg-emerald-50 p-3 text-sm dark:bg-emerald-900/20">
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    A. 답변 ({q.answeredAt ? fmtDate(q.answeredAt) : ""})
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm">{q.answer}</p>
                </div>
              )}
              <form
                action={`/api/admin/questions/${q.id}`}
                method="post"
                className="space-y-2 border-t border-ink-100 pt-3 dark:border-ink-700"
              >
                <textarea
                  name="answer"
                  required
                  minLength={5}
                  defaultValue={q.answer ?? ""}
                  className="input min-h-24"
                  placeholder="답변을 작성하세요"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      name="isPublic"
                      value="1"
                      defaultChecked={q.isPublic}
                    />
                    공개 Q&amp;A로 표시 (다른 사용자에게도 노출)
                  </label>
                  <div className="ml-auto flex gap-2">
                    <button
                      name="action"
                      value="answer"
                      className="btn-primary py-2"
                    >
                      답변 등록
                    </button>
                    <button
                      name="action"
                      value="close"
                      className="btn-outline py-2"
                    >
                      답변 없이 종료
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
