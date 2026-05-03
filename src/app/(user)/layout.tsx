import Link from "next/link";
import { getUserSession } from "@/lib/session";
import { AdvertiserPopup } from "@/components/AdvertiserPopup";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await getUserSession();
  return (
    <div className="min-h-screen bg-ink-50">
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-brand-500">여긴</span>
              <span className="text-xs font-medium text-ink-500">YEOGIN</span>
            </Link>
            <nav className="hidden gap-5 text-sm font-medium text-ink-700 md:flex">
              <Link href="/campaigns?type=VISIT">방문형</Link>
              <Link href="/campaigns?type=DELIVERY">배송형</Link>
              <Link href="/campaigns?type=REPORTER">기자단</Link>
              <Link href="/campaigns?fast=1">빠른선정</Link>
              <Link href="/campaigns?nearby=1" className="text-brand-600">📍 내 주변</Link>
              <Link href="/community">커뮤니티</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/advertiser" target="_blank" className="hidden text-xs font-semibold text-ink-600 hover:text-brand-600 md:block">
              내 매장 홍보하기 →
            </Link>
            {session ? (
              <Link href="/mypage" className="btn-outline">
                {session.name}님
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost">로그인</Link>
                <Link href="/signup" className="btn-primary">회원가입</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <footer className="mt-20 border-t border-ink-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-ink-500">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-ink-800">여긴 · YEOGIN</div>
              <div className="mt-1">진짜 후기로 연결되는 무료 체험단 플랫폼</div>
            </div>
            <Link href="/advertiser" target="_blank" className="btn-outline">
              광고주 센터로 이동 →
            </Link>
          </div>
          <div className="mt-6 text-[11px] text-ink-400">
            © 2026 Yeogin. 모든 캠페인은 데모 데이터입니다.
          </div>
        </div>
      </footer>
      <AdvertiserPopup />
    </div>
  );
}
