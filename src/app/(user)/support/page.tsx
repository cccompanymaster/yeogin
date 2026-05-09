import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { relativeTime } from "@/lib/relative";
import { EmptyState } from "@/components/EmptyState";

export const metadata = { title: "Q&A / 문의 - 여긴" };

const CAT_LABEL: Record<string, string> = {
  ACCOUNT: "계정",
  CAMPAIGN: "캠페인",
  REVIEW: "리뷰",
  POINT: "포인트",
  ETC: "기타",
};

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; tab?: string }>;
}) {
  const session = await getUserSession();
  const sp = await searchParams;

  // 공개 Q&A (모두에게 보이는 것)
  const publicQs = await db.question.findMany({
    where: { isPublic: true, status: "ANSWERED" },
    orderBy: { answeredAt: "desc" },
    take: 30,
  });

  // 내 문의 (로그인 시)
  const myQs = session
    ? await db.question.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      })
    : [];

  const tab = sp.tab === "mine" ? "mine" : "public";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">💬 Q&amp;A 1:1 문의</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          궁금한 점은 언제든 문의해주세요. 평일 기준 24시간 내 답변드립니다.
        </p>
      </div>

      {sp.ok && (
        <div className="card border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20">
          ✓ 문의가 접수되었습니다. 답변 시 알림으로 안내드립니다.
        </div>
      )}

      {/* 문의 작성 */}
      {session ? (
        <div className="card p-5">
          <h2 className="text-base font-bold">새 문의 작성</h2>
          <form action="/api/support" method="post" className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <select name="category" className="input" defaultValue="CAMPAIGN">
                {Object.entries(CAT_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <input
                className="input md:col-span-2"
                name="title"
                required
                maxLength={80}
                placeholder="제목 (예: 리뷰 마감일 연장 가능한가요?)"
              />
            </div>
            <textarea
              className="input min-h-28"
              name="body"
              required
              minLength={10}
              maxLength={1500}
              placeholder="내용을 자세히 적어주세요. 캠페인 ID/URL이 있으면 함께 첨부하면 빠른 답변에 도움이 됩니다."
            />
            <label className="flex items-center gap-2 text-xs text-ink-600 dark:text-ink-300">
              <input type="checkbox" name="isPublic" value="1" />
              다른 사용자에게도 도움이 될 만한 내용이라면 공개 Q&amp;A로 등록 (관리자 검토 후 노출)
            </label>
            <button className="btn-primary w-full py-2.5">문의 보내기</button>
          </form>
        </div>
      ) : (
        <div className="card border-brand-200 bg-brand-50 p-4 text-sm text-brand-700 dark:bg-brand-900/20">
          1:1 문의는{" "}
          <Link href="/login" className="font-bold underline">
            로그인
          </Link>{" "}
          후 작성할 수 있어요.
        </div>
      )}

      {/* 탭 */}
      <div className="flex gap-2">
        <Link
          href="/support"
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            tab === "public"
              ? "bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900"
              : "border border-ink-300 bg-white text-ink-700 hover:bg-ink-100 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200"
          }`}
        >
          공개 Q&amp;A {publicQs.length}
        </Link>
        {session && (
          <Link
            href="/support?tab=mine"
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              tab === "mine"
                ? "bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900"
                : "border border-ink-300 bg-white text-ink-700 hover:bg-ink-100 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200"
            }`}
          >
            내 문의 {myQs.length}
          </Link>
        )}
        <Link
          href="/faq"
          className="ml-auto rounded-lg border border-ink-300 bg-white px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200"
        >
          ❓ FAQ 먼저 보기
        </Link>
      </div>

      {/* 리스트 */}
      {(tab === "mine" ? myQs : publicQs).length === 0 ? (
        <EmptyState
          icon="💬"
          title={tab === "mine" ? "아직 보낸 문의가 없어요" : "공개 Q&A가 없습니다"}
          description={tab === "mine" ? "위 폼에서 첫 문의를 작성해보세요." : ""}
        />
      ) : (
        <div className="space-y-3">
          {(tab === "mine" ? myQs : publicQs).map((q) => (
            <details key={q.id} className="card group p-4">
              <summary className="flex cursor-pointer items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="badge bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-200">
                      {CAT_LABEL[q.category] || q.category}
                    </span>
                    {q.status === "ANSWERED" ? (
                      <span className="badge bg-emerald-500 text-white">답변완료</span>
                    ) : (
                      <span className="badge bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        답변대기
                      </span>
                    )}
                    <span className="text-ink-500 dark:text-ink-400">
                      {relativeTime(q.createdAt)}
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-bold">Q. {q.title}</div>
                </div>
                <span className="text-ink-400 transition group-open:rotate-180">▾</span>
              </summary>
              <div className="mt-3 space-y-3 border-t border-ink-100 pt-3 dark:border-ink-700">
                <p className="whitespace-pre-line text-sm text-ink-700 dark:text-ink-200">
                  {q.body}
                </p>
                {q.answer && (
                  <div className="rounded-lg bg-brand-50 p-3 dark:bg-brand-900/20">
                    <div className="text-xs font-bold text-brand-700 dark:text-brand-300">
                      A. 여긴 운영팀
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm text-ink-700 dark:text-ink-200">
                      {q.answer}
                    </p>
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
