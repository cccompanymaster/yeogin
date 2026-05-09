import Link from "next/link";
import { getUserSession } from "@/lib/session";
import { AdvertiserPopup } from "@/components/AdvertiserPopup";
import { SearchBar } from "@/components/SearchBar";
import { NotificationBell } from "@/components/NotificationBell";
import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await getUserSession();
  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-900">
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/90 backdrop-blur dark:border-ink-700 dark:bg-ink-900/90">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <Logo size={26} />
            </Link>
            <nav className="hidden gap-5 text-sm font-medium text-ink-700 dark:text-ink-200 lg:flex">
              <Link href="/campaigns?type=VISIT">방문형</Link>
              <Link href="/campaigns?type=DELIVERY">배송형</Link>
              <Link href="/campaigns?type=REPORTER">기자단</Link>
              <Link href="/campaigns?fast=1">빠른선정</Link>
              <Link href="/campaigns?nearby=1" className="text-brand-600">📍 내 주변</Link>
              <Link href="/tags">태그</Link>
              <Link href="/reviews">후기</Link>
              <Link href="/magazine">매거진</Link>
              <Link href="/community">커뮤니티</Link>
            </nav>
          </div>
          <div className="hidden max-w-sm flex-1 md:block">
            <SearchBar />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/advertiser" target="_blank" className="hidden text-xs font-semibold text-ink-600 hover:text-brand-600 dark:text-ink-300 lg:block">
              내 매장 홍보 →
            </Link>
            <MobileNav />
            {session ? (
              <>
                <NotificationBell role="USER" recipientId={session.id} href="/notifications" />
                <Link href="/mypage" className="btn-outline">
                  {session.name}님
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost">로그인</Link>
                <Link href="/signup" className="btn-primary">회원가입</Link>
              </>
            )}
          </div>
        </div>
        <div className="border-t border-ink-100 px-4 py-2 md:hidden">
          <SearchBar />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 text-ink-900 dark:text-ink-100">
        {children}
      </main>
      <footer className="mt-20 border-t border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900">
        <div className="mx-auto max-w-6xl px-4 py-10 text-xs text-ink-500 dark:text-ink-400">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="md:col-span-2">
              <Logo size={22} />
              <div className="mt-2 text-ink-600 dark:text-ink-300">
                진짜 후기로 연결되는 무료 체험단 플랫폼
              </div>
              <div className="mt-3">
                <Link
                  href="/advertiser"
                  target="_blank"
                  className="btn-outline inline-flex"
                >
                  광고주 센터로 이동 →
                </Link>
              </div>
            </div>
            <div>
              <div className="mb-2 font-bold text-ink-700 dark:text-ink-200">서비스</div>
              <ul className="space-y-1.5">
                <li><Link href="/campaigns" className="hover:text-ink-900 dark:hover:text-white">캠페인</Link></li>
                <li><Link href="/tags" className="hover:text-ink-900 dark:hover:text-white">인기 태그</Link></li>
                <li><Link href="/reviews" className="hover:text-ink-900 dark:hover:text-white">체험 후기</Link></li>
                <li><Link href="/magazine" className="hover:text-ink-900 dark:hover:text-white">매거진</Link></li>
                <li><Link href="/community" className="hover:text-ink-900 dark:hover:text-white">커뮤니티</Link></li>
              </ul>
            </div>
            <div>
              <div className="mb-2 font-bold text-ink-700 dark:text-ink-200">고객지원</div>
              <ul className="space-y-1.5">
                <li><Link href="/faq" className="hover:text-ink-900 dark:hover:text-white">자주 묻는 질문</Link></li>
                <li><Link href="/trust-grade" className="hover:text-ink-900 dark:hover:text-white">신뢰등급 안내</Link></li>
                <li><Link href="/terms" className="hover:text-ink-900 dark:hover:text-white">이용약관</Link></li>
                <li><Link href="/privacy" className="font-semibold hover:text-ink-900 dark:hover:text-white">개인정보처리방침</Link></li>
                <li><Link href="/mypage/shop" className="hover:text-ink-900 dark:hover:text-white">포인트샵</Link></li>
                <li><Link href="/mypage/invite" className="hover:text-ink-900 dark:hover:text-white">친구 초대</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-ink-100 pt-4 text-[11px] text-ink-400 dark:border-ink-700">
            © 2026 Yeogin. 모든 캠페인은 데모 데이터입니다.
          </div>
        </div>
      </footer>
      <AdvertiserPopup />
    </div>
  );
}
