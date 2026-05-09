"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/advertiser/dashboard", label: "📊 대시보드" },
  { href: "/advertiser/campaigns", label: "📋 캠페인 관리" },
  { href: "/advertiser/campaigns/new", label: "➕ 캠페인 등록" },
  { href: "/advertiser/reviews", label: "✅ 리뷰 검수" },
  { href: "/advertiser/team", label: "👥 팀 관리" },
  { href: "/advertiser/billing", label: "💰 정산" },
  { href: "/advertiser/billing/charge", label: "💳 포인트 충전" },
  { href: "/advertiser/cases", label: "🏆 성공 사례" },
  { href: "/advertiser/profile", label: "⚙️ 프로필 수정" },
];

export function AdvertiserMobileNav() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-ink-800 md:hidden"
        aria-label="메뉴 열기"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink-900/60" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 max-w-[80%] overflow-y-auto bg-white dark:bg-ink-900">
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3 dark:border-ink-700">
              <span className="text-base font-bold">비즈센터</span>
              <button onClick={() => setOpen(false)} className="text-ink-500" aria-label="닫기">✕</button>
            </div>
            <nav className="space-y-0.5 p-2">
              {ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800"
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-3 border-t border-ink-100 dark:border-ink-700" />
              <Link
                href="/"
                target="_blank"
                className="block rounded-md px-3 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30"
              >
                ↗ 사용자 사이트로 가기
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
