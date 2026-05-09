import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { relativeTime } from "@/lib/relative";
import { EmptyState } from "@/components/EmptyState";

export default async function UserNotificationsPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const items = await db.notification.findMany({
    where: { role: "USER", recipientId: session.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  await db.notification.updateMany({
    where: { role: "USER", recipientId: session.id, read: false },
    data: { read: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">알림</h1>
      {items.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="아직 알림이 없습니다"
          description="캠페인 신청·선정·리뷰 검수 등 활동 알림이 여기 표시됩니다."
          cta={{ href: "/campaigns", label: "캠페인 둘러보기" }}
        />
      ) : (
        <div className="card divide-y divide-ink-100 dark:divide-ink-700">
          {items.map((n) => (
            <Link
              key={n.id}
              href={n.link || "#"}
              className={`block p-4 hover:bg-ink-50 dark:hover:bg-ink-700 ${
                n.read ? "" : "bg-brand-50/40 dark:bg-brand-900/20"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-ink-900 dark:text-ink-100">
                    {n.title}
                  </div>
                  <div className="mt-0.5 line-clamp-2 text-xs text-ink-600 dark:text-ink-300">
                    {n.body}
                  </div>
                </div>
                <div className="text-[11px] text-ink-400">
                  {relativeTime(n.createdAt)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
