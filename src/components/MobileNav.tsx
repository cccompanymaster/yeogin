"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "🏠 홈" },
  { href: "/campaigns", label: "📋 전체 캠페인" },
  { href: "/campaigns?type=VISIT", label: "🍽️ 방문형" },
  { href: "/campaigns?type=DELIVERY", label: "📦 배송형" },
  { href: "/campaigns?type=REPORTER", label: "📰 기자단" },
  { href: "/campaigns?fast=1", label: "⚡ 빠른선정" },
  { href: "/campaigns?nearby=1", label: "📍 내 주변" },
  { href: "/tags", label: "🏷️ 인기 태그" },
  { href: "/reviews", label: "📣 체험 후기" },
  { href: "/mypage/invite", label: "🎁 친구 초대" },
  { href: "/community", label: "💬 커뮤니티" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-100 lg:hidden"
        aria-label="메뉴 열기"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 max-w-[80%] overflow-y-auto bg-white">
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
              <span className="text-base font-bold">메뉴</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="text-ink-500"
              >
                ✕
              </button>
            </div>
            <nav className="space-y-0.5 p-2">
              {ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-3 border-t border-ink-100" />
              <Link
                href="/advertiser"
                target="_blank"
                className="block rounded-md px-3 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50"
              >
                💼 내 매장 홍보 (광고주센터) →
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
