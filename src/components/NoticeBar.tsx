import Link from "next/link";
import { db } from "@/lib/db";

const LEVEL_BG: Record<string, string> = {
  INFO: "bg-sky-600 text-white",
  WARN: "bg-amber-500 text-white",
  EVENT: "bg-gradient-to-r from-brand-500 to-pink-500 text-white",
};

const LEVEL_ICON: Record<string, string> = {
  INFO: "📢",
  WARN: "⚠️",
  EVENT: "🎉",
};

export async function NoticeBar() {
  const now = new Date();
  const notice = await db.notice
    .findFirst({
      where: {
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
        pinned: true,
      },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => null);

  if (!notice) return null;

  const Inner = (
    <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 text-xs sm:text-sm">
      <span className="text-lg">{LEVEL_ICON[notice.level] || "📢"}</span>
      <span className="line-clamp-1 flex-1 font-semibold">{notice.title}</span>
      <Link
        href="/notices"
        className="hidden whitespace-nowrap text-xs font-bold underline-offset-2 hover:underline sm:inline"
      >
        전체 공지 →
      </Link>
    </div>
  );

  return (
    <div className={LEVEL_BG[notice.level] || "bg-ink-900 text-white"}>
      {notice.link ? (
        <a href={notice.link} target={notice.link.startsWith("http") ? "_blank" : undefined}>
          {Inner}
        </a>
      ) : (
        <Link href="/notices">{Inner}</Link>
      )}
    </div>
  );
}
