import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-200 bg-ink-900 text-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="rounded bg-red-500 px-1.5 py-0.5 text-[11px] font-bold">
                ADMIN
              </span>
              <span className="text-lg font-black tracking-tight">여긴 운영센터</span>
            </Link>
          </div>
          <div className="flex items-center gap-3 text-xs text-ink-300">
            <Link href="/" target="_blank" className="hover:text-white">
              사용자 사이트 ↗
            </Link>
            <Link href="/advertiser" target="_blank" className="hover:text-white">
              광고주 사이트 ↗
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
