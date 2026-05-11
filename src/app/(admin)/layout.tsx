import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-900">
      <header className="border-b border-ink-200 bg-ink-900 text-white dark:border-ink-700">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <Logo size={24} variant="white" />
              <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold">
                ADMIN
              </span>
            </Link>
            <nav className="ml-3 hidden gap-4 text-xs text-ink-300 md:flex">
              <Link href="/admin">신고</Link>
              <Link href="/admin/stats">통계</Link>
              <Link href="/admin/sns">SNS 인증</Link>
              <Link href="/admin/questions">Q&amp;A</Link>
              <Link href="/admin/articles">매거진</Link>
              <Link href="/admin/notices">공지</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-xs text-ink-300">
            <Link href="/" target="_blank" className="hover:text-white">
              사용자 ↗
            </Link>
            <Link href="/advertiser" target="_blank" className="hover:text-white">
              광고주 ↗
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 text-ink-900 dark:text-ink-100">
        {children}
      </main>
    </div>
  );
}
