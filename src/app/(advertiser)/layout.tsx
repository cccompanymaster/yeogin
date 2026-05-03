import Link from "next/link";
import { getAdvertiserSession } from "@/lib/session";
import { NotificationBell } from "@/components/NotificationBell";
import { Logo } from "@/components/Logo";

export default async function AdvertiserLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdvertiserSession();
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-ink-200 bg-ink-900 text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/advertiser" className="flex items-center gap-2">
              <Logo size={24} variant="white" />
              <span className="rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold">
                BIZ
              </span>
            </Link>
            {session && (
              <nav className="hidden gap-5 text-sm font-medium text-ink-200 md:flex">
                <Link href="/advertiser/dashboard">대시보드</Link>
                <Link href="/advertiser/campaigns">캠페인 관리</Link>
                <Link href="/advertiser/campaigns/new">캠페인 등록</Link>
                <Link href="/advertiser/reviews">리뷰 검수</Link>
                <Link href="/advertiser/billing">정산</Link>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank" className="hidden text-xs text-ink-300 hover:text-white md:block">
              체험단으로 둘러보기 ↗
            </Link>
            {session ? (
              <>
                <NotificationBell
                  role="ADVERTISER"
                  recipientId={session.id}
                  href="/advertiser/notifications"
                />
                <form action="/api/advertiser/logout" method="post">
                  <button className="btn-outline border-ink-700 bg-transparent text-ink-100 hover:bg-ink-800">
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
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
