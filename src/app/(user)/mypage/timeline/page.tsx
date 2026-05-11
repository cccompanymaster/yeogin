import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { relativeTime } from "@/lib/relative";
import { STATUS_LABEL, REVIEW_STATUS_LABEL } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";

export const metadata = { title: "활동 타임라인 · 여긴" };

type Item = {
  at: Date;
  type: "APP" | "REVIEW" | "POINT" | "PENALTY" | "ATTEND" | "REDEEM";
  icon: string;
  title: string;
  desc?: string;
  href?: string;
  badge?: string;
  badgeColor?: string;
};

export default async function MyTimelinePage() {
  const session = await getUserSession();
  if (!session) redirect("/login");
  const me = await db.user.findUnique({ where: { id: session.id } });
  if (!me) redirect("/login");

  const [apps, reviews, points, penalties, redeems] = await Promise.all([
    db.application.findMany({
      where: { userId: me.id },
      include: { campaign: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.review.findMany({
      where: { userId: me.id },
      include: { campaign: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.pointHistory.findMany({
      where: { userId: me.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.penalty.findMany({
      where: { userId: me.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    db.redeem.findMany({
      where: { userId: me.id },
      include: { item: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  const POINT_REASON: Record<string, { icon: string; label: string }> = {
    REVIEW_APPROVED: { icon: "🎉", label: "후기 승인 보상" },
    PENALTY: { icon: "⚠️", label: "패널티 차감" },
    SIGNUP_BONUS: { icon: "🎁", label: "가입 보너스" },
    MANUAL: { icon: "✍️", label: "수동 지급/차감" },
    REDEEM: { icon: "🛍️", label: "포인트샵 사용" },
    ATTENDANCE: { icon: "📅", label: "출석체크 보상" },
    REFERRAL: { icon: "🤝", label: "친구 초대 보상" },
  };

  const items: Item[] = [];

  apps.forEach((a) =>
    items.push({
      at: a.createdAt,
      type: "APP",
      icon: "📨",
      title: `「${a.campaign.title}」 캠페인 신청`,
      desc: `상태: ${STATUS_LABEL[a.status] || a.status}`,
      href: `/campaigns/${a.campaign.id}`,
      badge: STATUS_LABEL[a.status] || a.status,
      badgeColor:
        a.status === "SELECTED"
          ? "bg-emerald-100 text-emerald-700"
          : a.status === "REJECTED"
            ? "bg-red-100 text-red-700"
            : a.status === "COMPLETED"
              ? "bg-sky-100 text-sky-700"
              : "bg-ink-100 text-ink-700",
    })
  );

  reviews.forEach((r) =>
    items.push({
      at: r.createdAt,
      type: "REVIEW",
      icon: "📝",
      title: `「${r.campaign.title}」 후기 등록`,
      desc: r.highlight ? `"${r.highlight}"` : undefined,
      href: r.url,
      badge: REVIEW_STATUS_LABEL[r.status] || r.status,
      badgeColor:
        r.status === "APPROVED"
          ? "bg-emerald-100 text-emerald-700"
          : r.status === "REJECTED"
            ? "bg-red-100 text-red-700"
            : "bg-amber-100 text-amber-800",
    })
  );

  points.forEach((p) => {
    const meta = POINT_REASON[p.reason] || { icon: "💰", label: p.reason };
    items.push({
      at: p.createdAt,
      type: "POINT",
      icon: meta.icon,
      title: `${meta.label} ${p.delta >= 0 ? "+" : ""}${p.delta.toLocaleString()}P`,
      desc: p.note || `잔액 ${p.balance.toLocaleString()}P`,
    });
  });

  penalties.forEach((p) =>
    items.push({
      at: p.createdAt,
      type: "PENALTY",
      icon: "⛔",
      title: `패널티 부과 (${p.type})`,
      desc: undefined,
      badge: "패널티",
      badgeColor: "bg-red-100 text-red-700",
    })
  );

  redeems.forEach((r) =>
    items.push({
      at: r.createdAt,
      type: "REDEEM",
      icon: "🛍️",
      title: `포인트샵 교환: ${r.item.name}`,
      desc: r.status === "USED" ? "사용 완료" : r.status === "ISSUED" ? "발급 완료" : r.status,
      href: "/mypage/shop",
    })
  );

  items.sort((a, b) => b.at.getTime() - a.at.getTime());

  // 날짜별로 그룹핑 (YYYY-MM-DD)
  const groups = new Map<string, Item[]>();
  items.forEach((it) => {
    const key = it.at.toISOString().slice(0, 10);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(it);
  });
  const sortedKeys = Array.from(groups.keys()).sort((a, b) => b.localeCompare(a));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link href="/mypage" className="text-xs text-ink-500 dark:text-ink-400">
          ← 마이페이지
        </Link>
        <h1 className="mt-2 text-2xl font-black">📜 활동 타임라인</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          최근 캠페인 신청·후기·포인트·패널티 활동을 시간순으로 모았어요.
        </p>
      </header>

      {/* 요약 칩 */}
      <div className="flex flex-wrap gap-2 text-xs">
        <Chip icon="📨" label={`신청 ${apps.length}`} />
        <Chip icon="📝" label={`후기 ${reviews.length}`} />
        <Chip icon="💰" label={`포인트 ${points.length}`} />
        <Chip icon="🛍️" label={`교환 ${redeems.length}`} />
        {penalties.length > 0 && (
          <Chip icon="⛔" label={`패널티 ${penalties.length}`} />
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon="📭"
          title="아직 활동 내역이 없어요"
          description="캠페인을 신청하고 후기를 작성하면 여기에 기록돼요."
          cta={{ href: "/campaigns", label: "캠페인 둘러보기" }}
        />
      ) : (
        <div className="relative space-y-6">
          {/* 세로 라인 */}
          <div
            className="absolute bottom-0 left-[15px] top-2 w-px bg-ink-200 dark:bg-ink-700"
            aria-hidden
          />
          {sortedKeys.map((key) => {
            const day = new Date(key);
            const dayLabel = `${day.getMonth() + 1}월 ${day.getDate()}일`;
            const list = groups.get(key)!;
            return (
              <section key={key} className="relative space-y-3 pl-10">
                <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-[11px] font-black text-white shadow-md">
                  {day.getDate()}
                </div>
                <div className="text-xs font-bold text-ink-500 dark:text-ink-400">
                  {dayLabel} · {list.length}건
                </div>
                <ul className="space-y-2">
                  {list.map((it, i) => {
                    const inner = (
                      <div className="card flex items-start gap-3 p-3 hover:shadow-md">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ink-50 text-lg dark:bg-ink-900">
                          {it.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="truncate text-sm font-semibold text-ink-900 dark:text-ink-100">
                              {it.title}
                            </div>
                            {it.badge && (
                              <span className={`badge shrink-0 ${it.badgeColor}`}>
                                {it.badge}
                              </span>
                            )}
                          </div>
                          {it.desc && (
                            <div className="mt-0.5 line-clamp-2 text-xs text-ink-500 dark:text-ink-400">
                              {it.desc}
                            </div>
                          )}
                          <div className="mt-1 text-[10px] text-ink-400">
                            {relativeTime(it.at)}
                          </div>
                        </div>
                      </div>
                    );
                    return (
                      <li key={`${it.type}-${i}-${it.at.getTime()}`}>
                        {it.href ? (
                          it.href.startsWith("http") ? (
                            <a href={it.href} target="_blank" rel="noreferrer" className="block">
                              {inner}
                            </a>
                          ) : (
                            <Link href={it.href} className="block">
                              {inner}
                            </Link>
                          )
                        ) : (
                          inner
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chip({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="badge bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-200">
      {icon} {label}
    </span>
  );
}
