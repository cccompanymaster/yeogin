import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { fmtDate } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";

export const metadata = {
  title: "공지사항·이벤트 - 여긴",
  description: "여긴의 최신 공지사항과 이벤트 소식을 확인하세요.",
};

const LEVEL_LABEL: Record<string, { label: string; cls: string }> = {
  INFO: { label: "공지", cls: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300" },
  WARN: { label: "안내", cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  EVENT: { label: "이벤트", cls: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300" },
};

export default async function NoticesPage() {
  const now = new Date();
  const notices = await db.notice.findMany({
    where: {
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
    },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    take: 100,
  });
  const active = notices.filter(
    (n) => !n.endsAt || new Date(n.endsAt) >= now
  );
  const past = notices.filter((n) => n.endsAt && new Date(n.endsAt) < now);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📢 공지사항·이벤트</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          여긴의 최신 소식과 이벤트를 확인하세요.
        </p>
      </div>

      {notices.length === 0 ? (
        <EmptyState
          icon="📭"
          title="공지사항이 없습니다"
          description="새 소식이 올라오면 여기서 확인하실 수 있어요."
        />
      ) : (
        <>
          {active.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-bold">진행중</h2>
              <div className="card divide-y divide-ink-100 dark:divide-ink-700">
                {active.map((n) => (
                  <NoticeItem key={n.id} n={n} />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-ink-500">종료된 공지</h2>
              <div className="card divide-y divide-ink-100 dark:divide-ink-700">
                {past.map((n) => (
                  <NoticeItem key={n.id} n={n} muted />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function NoticeItem({
  n,
  muted,
}: {
  n: {
    id: string;
    title: string;
    body: string;
    level: string;
    pinned: boolean;
    link: string | null;
    createdAt: Date;
    endsAt: Date | null;
  };
  muted?: boolean;
}) {
  const lvl = LEVEL_LABEL[n.level] || LEVEL_LABEL.INFO;
  return (
    <details className={`group p-4 ${muted ? "opacity-60" : ""}`}>
      <summary className="flex cursor-pointer items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px]">
            <span className={`badge ${lvl.cls}`}>{lvl.label}</span>
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
          <h3 className="mt-1 text-sm font-bold">{n.title}</h3>
        </div>
        <span className="text-ink-400 transition group-open:rotate-180">▾</span>
      </summary>
      <p className="mt-3 whitespace-pre-line border-t border-ink-100 pt-3 text-sm text-ink-700 dark:border-ink-700 dark:text-ink-200">
        {n.body}
      </p>
      {n.link && (
        <a
          href={n.link}
          target={n.link.startsWith("http") ? "_blank" : undefined}
          className="mt-2 inline-block text-xs font-bold text-brand-600 hover:underline"
        >
          자세히 보기 →
        </a>
      )}
    </details>
  );
}
