"use client";

import { useEffect, useState } from "react";

const KEY = "yeogin_theme";

function applyTheme(t: "light" | "dark") {
  const root = document.documentElement;
  if (t === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem(KEY) as "light" | "dark" | null;
    const initial: "light" | "dark" =
      saved ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(KEY, next);
    applyTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-base hover:bg-ink-100 dark:hover:bg-ink-800"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
