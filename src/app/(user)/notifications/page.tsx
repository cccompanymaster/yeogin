import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { fmtDate } from "@/lib/format";

export default async function UserNotificationsPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const items = await db.notification.findMany({
    where: { role: "USER", recipientId: session.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // 화면을 본 시점에 모두 읽음 처리
  await db.notification.updateMany({
    where: { role: "USER", recipientId: session.id, read: false },
    data: { read: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">알림</h1>
      {items.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">
          아직 알림이 없습니다.
        </div>
      ) : (
        <div className="card divide-y divide-ink-100">
          {items.map((n) => (
            <Link
              key={n.id}
              href={n.link || "#"}
              className={`block p-4 hover:bg-ink-50 ${
                n.read ? "" : "bg-brand-50/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold">{n.title}</div>
                  <div className="mt-0.5 line-clamp-2 text-xs text-ink-600">
                    {n.body}
                  </div>
                </div>
                <div className="text-[11px] text-ink-400">{fmtDate(n.createdAt)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
