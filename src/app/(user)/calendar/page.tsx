import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "캠페인 캘린더 · 여긴",
  description: "이번 달 모집 마감일·발표일을 한눈에 확인하세요.",
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1);
}
function endOfMonth(year: number, month: number) {
  return new Date(year, month + 1, 0, 23, 59, 59, 999);
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const year = sp.y ? parseInt(sp.y, 10) : now.getFullYear();
  const month = sp.m ? parseInt(sp.m, 10) - 1 : now.getMonth();

  const monthStart = startOfMonth(year, month);
  const monthEnd = endOfMonth(year, month);

  const campaigns = await db.campaign.findMany({
    where: {
      status: { in: ["OPEN", "SCHEDULED", "CLOSED"] },
      OR: [
        { applyEnd: { gte: monthStart, lte: monthEnd } },
        { announceAt: { gte: monthStart, lte: monthEnd } },
      ],
    },
    select: {
      id: true,
      title: true,
      applyEnd: true,
      announceAt: true,
      type: true,
      category: true,
      thumbnail: true,
    },
    orderBy: { applyEnd: "asc" },
    take: 200,
  });

  type Event = {
    kind: "DEADLINE" | "ANNOUNCE";
    when: Date;
    id: string;
    title: string;
    type: string;
    category: string;
  };
  const events: Event[] = [];
  campaigns.forEach((c) => {
    if (c.applyEnd >= monthStart && c.applyEnd <= monthEnd) {
      events.push({
        kind: "DEADLINE",
        when: c.applyEnd,
        id: c.id,
        title: c.title,
        type: c.type,
        category: c.category,
      });
    }
    if (c.announceAt >= monthStart && c.announceAt <= monthEnd) {
      events.push({
        kind: "ANNOUNCE",
        when: c.announceAt,
        id: c.id,
        title: c.title,
        type: c.type,
        category: c.category,
      });
    }
  });

  const byDay = new Map<number, Event[]>();
  events.forEach((e) => {
    const d = e.when.getDate();
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d)!.push(e);
  });

  const firstWeekday = monthStart.getDay();
  const totalDays = monthEnd.getDate();
  const cells: Array<{ day: number | null }> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ day: null });
  for (let d = 1; d <= totalDays; d++) cells.push({ day: d });
  while (cells.length % 7 !== 0) cells.push({ day: null });

  const prevMonth = month === 0 ? { y: year - 1, m: 12 } : { y: year, m: month };
  const nextMonth = month === 11 ? { y: year + 1, m: 1 } : { y: year, m: month + 2 };

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-brand-600">CALENDAR</div>
          <h1 className="text-2xl font-black">
            {year}년 {month + 1}월 캠페인 캘린더
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            모집 마감일·발표일을 한눈에 확인하세요. ({events.length}건)
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={`/calendar?y=${prevMonth.y}&m=${prevMonth.m}`}
            className="btn-outline px-3 py-1.5 text-sm"
          >
            ← 이전
          </Link>
          <Link href="/calendar" className="btn-outline px-3 py-1.5 text-sm">
            오늘
          </Link>
          <Link
            href={`/calendar?y=${nextMonth.y}&m=${nextMonth.m}`}
            className="btn-outline px-3 py-1.5 text-sm"
          >
            다음 →
          </Link>
        </div>
      </header>

      {/* 범례 */}
      <div className="flex flex-wrap gap-3 text-xs">
        <Legend color="bg-red-500" label="모집 마감" />
        <Legend color="bg-emerald-500" label="당첨자 발표" />
      </div>

      {/* 캘린더 그리드 */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-ink-200 bg-ink-50 text-center text-xs font-bold dark:border-ink-700 dark:bg-ink-900">
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              className={`py-2 ${
                i === 0 ? "text-red-500" : i === 6 ? "text-sky-500" : "text-ink-700 dark:text-ink-200"
              }`}
            >
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((cell, i) => {
            const dayEvents = cell.day != null ? byDay.get(cell.day) ?? [] : [];
            const isToday = isCurrentMonth && cell.day === todayDate;
            const weekday = i % 7;
            return (
              <div
                key={i}
                className={`min-h-[90px] border-b border-r border-ink-100 p-1.5 align-top dark:border-ink-800 ${
                  cell.day == null ? "bg-ink-50/40 dark:bg-ink-900/40" : ""
                }`}
              >
                {cell.day != null && (
                  <>
                    <div
                      className={`mb-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                        isToday
                          ? "bg-brand-500 text-white"
                          : weekday === 0
                            ? "text-red-500"
                            : weekday === 6
                              ? "text-sky-500"
                              : "text-ink-700 dark:text-ink-200"
                      }`}
                    >
                      {cell.day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((e, idx) => (
                        <Link
                          key={`${e.id}-${e.kind}-${idx}`}
                          href={`/campaigns/${e.id}`}
                          className={`block truncate rounded px-1 text-[10px] font-semibold text-white ${
                            e.kind === "DEADLINE" ? "bg-red-500" : "bg-emerald-500"
                          }`}
                          title={`${e.kind === "DEADLINE" ? "마감" : "발표"}: ${e.title}`}
                        >
                          {e.kind === "DEADLINE" ? "⏰ " : "🎉 "}
                          {e.title}
                        </Link>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-ink-500">
                          +{dayEvents.length - 3}건
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 이번 달 일정 리스트 (모바일 친화) */}
      {events.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-bold">📋 이번 달 전체 일정</h2>
          <ul className="card divide-y divide-ink-100 dark:divide-ink-700">
            {events
              .sort((a, b) => a.when.getTime() - b.when.getTime())
              .map((e, i) => (
                <li key={`${e.id}-${e.kind}-${i}`} className="p-3">
                  <Link
                    href={`/campaigns/${e.id}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`badge shrink-0 ${
                          e.kind === "DEADLINE"
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {e.kind === "DEADLINE" ? "마감" : "발표"}
                      </span>
                      <span className="shrink-0 text-xs font-bold text-ink-500 dark:text-ink-400">
                        {e.when.getMonth() + 1}/{e.when.getDate()}{" "}
                        ({WEEKDAYS[e.when.getDay()]})
                      </span>
                      <span className="truncate text-sm font-semibold">{e.title}</span>
                    </div>
                    <span className="text-xs text-ink-400">→</span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
      <span className="text-ink-700 dark:text-ink-200">{label}</span>
    </span>
  );
}
