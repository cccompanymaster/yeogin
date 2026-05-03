import Link from "next/link";
import { db } from "@/lib/db";

export async function NotificationBell({
  role,
  recipientId,
  href,
}: {
  role: "USER" | "ADVERTISER";
  recipientId: string;
  href: string;
}) {
  const unread = await db.notification.count({
    where: { role, recipientId, read: false },
  });
  return (
    <Link
      href={href}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink-300 bg-white text-ink-700 hover:bg-ink-100"
      aria-label={`알림 ${unread}건`}
    >
      🔔
      {unread > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
