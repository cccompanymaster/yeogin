import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdvertiserSession } from "@/lib/session";
import { relativeTime } from "@/lib/relative";
import { EmptyState } from "@/components/EmptyState";

export default async function AdvertiserNotificationsPage() {
  const session = await getAdvertiserSession();
  if (!session) redirect("/advertiser/login");

  const items = await db.notification.findMany({
    where: { role: "ADVERTISER", recipientId: session.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  await db.notification.updateMany({
    where: { role: "ADVERTISER", recipientId: session.id, read: false },
    data: { read: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">알림</h1>
      {items.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="아직 알림이 없습니다"
          description="새 신청자, 리뷰 등록, 평가 등 활동 알림이 여기 표시됩니다."
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
