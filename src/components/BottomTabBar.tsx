"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/campaigns", label: "캠페인", icon: "🔍" },
  { href: "/reviews", label: "후기", icon: "📣" },
  { href: "/notifications", label: "알림", icon: "🔔" },
  { href: "/mypage", label: "마이", icon: "👤" },
];

export function BottomTabBar() {
  const path = usePathname() || "/";

  const isActive = (href: string) => {
    if (href === "/") return path === "/";
    return path === href || path.startsWith(href + "/");
  };

  return (
    <>
      {/* 본문 하단 여백 (하단 탭바와 겹치지 않도록) */}
      <div className="h-16 lg:hidden" aria-hidden />
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink-200 bg-white/95 backdrop-blur dark:border-ink-700 dark:bg-ink-900/95 lg:hidden">
        <ul className="mx-auto flex max-w-md items-stretch">
          {TABS.map((t) => {
            const active = isActive(t.href);
            return (
              <li key={t.href} className="flex-1">
                <Link
                  href={t.href}
                  className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold transition ${
                    active
                      ? "text-brand-600 dark:text-brand-400"
                      : "text-ink-500 dark:text-ink-400"
                  }`}
                >
                  <span className={`text-xl transition-transform ${active ? "scale-110" : ""}`}>
                    {t.icon}
                  </span>
                  <span>{t.label}</span>
                  {active && (
                    <span className="absolute top-0 h-0.5 w-8 rounded-b bg-brand-500" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
