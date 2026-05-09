import Link from "next/link";
import { getAdvertiserSession } from "@/lib/session";
import { db } from "@/lib/db";
import { NotificationBell } from "@/components/NotificationBell";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdvertiserMobileNav } from "@/components/AdvertiserMobileNav";

export default async function AdvertiserLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdvertiserSession();
  const adv = session
    ? await db.advertiser.findUnique({
        where: { id: session.id },
        select: { point: true },
      })
    : null;
  return (
    <div className="min-h-screen bg-white dark:bg-ink-900">
      <header className="border-b border-ink-200 bg-ink-900 text-white dark:border-ink-700">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
          <div className="flex min-w-0 items-center gap-6">
            <Link href="/advertiser" className="flex items-center gap-2">
              <Logo size={24} variant="white" />
              <span className="rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold">
                BIZ
              </span>
            </Link>
            {session && (
              <nav className="hidden gap-5 text-sm font-medium text-ink-200 lg:flex">
                <Link href="/advertiser/dashboard">대시보드</Link>
                <Link href="/advertiser/campaigns">캠페인</Link>
                <Link href="/advertiser/campaigns/new">등록</Link>
                <Link href="/advertiser/reviews">검수</Link>
                <Link href="/advertiser/team">팀</Link>
                <Link href="/advertiser/cases">사례</Link>
                <Link href="/advertiser/billing">정산</Link>
                <Link
                  href="/advertiser/billing/charge"
                  className="text-amber-300 hover:text-amber-200"
                >
                  💰 {adv?.point.toLocaleString() ?? 0}P
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden text-xs text-ink-300 hover:text-white lg:block"
            >
              체험단으로 둘러보기 ↗
            </Link>
            <ThemeToggle />
            {session ? (
              <>
                <NotificationBell
                  role="ADVERTISER"
                  recipientId={session.id}
                  href="/advertiser/notifications"
                />
                <AdvertiserMobileNav />
                <form action="/api/advertiser/logout" method="post">
                  <button className="hidden border border-ink-700 bg-transparent px-3 py-1.5 text-xs text-ink-100 hover:bg-ink-800 md:inline-flex">
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/advertiser/login" className="text-sm text-ink-200">로그인</Link>
                <Link href="/advertiser/signup" className="btn-primary">광고주 가입</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 text-ink-900 dark:text-ink-100">
        {children}
      </main>
    </div>
  );
}
