"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const RECENT_KEY = "yeogin_recent_searches";
const POPULAR = ["강남맛집", "데이트코스", "분위기맛집", "한남디저트", "비건뷰티", "마스크팩", "베이비물티슈", "스페셜티커피"];

export function SearchBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      if (Array.isArray(arr)) setRecent(arr.slice(0, 5));
    } catch {}
  }, []);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const apply = (term: string) => {
    const v = term.trim();
    setOpen(false);
    if (!v) {
      router.push("/search");
      return;
    }
    try {
      const next = [v, ...recent.filter((x) => x !== v)].slice(0, 8);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      setRecent(next);
    } catch {}
    setQ(v);
    router.push(`/search?q=${encodeURIComponent(v)}`);
  };

  const clearRecent = () => {
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {}
    setRecent([]);
  };

  const filteredPopular = q
    ? POPULAR.filter((p) => p.includes(q.trim())).slice(0, 5)
    : POPULAR.slice(0, 6);

  return (
    <div ref={ref} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply(q);
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="캠페인·매장·태그 검색"
          className="input h-9 pl-9 pr-3 text-sm"
        />
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
          🔍
        </span>
      </form>
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-96 overflow-auto rounded-xl border border-ink-200 bg-white py-2 shadow-lg dark:border-ink-700 dark:bg-ink-800">
          {recent.length > 0 && (
            <>
              <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold text-ink-400">
                <span>최근 검색</span>
                <button
                  type="button"
                  onClick={clearRecent}
                  className="font-normal hover:text-ink-700"
                >
                  전체 삭제
                </button>
              </div>
              <div className="px-2 pb-1">
                <div className="flex flex-wrap gap-1">
                  {recent.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => apply(r)}
                      className="badge bg-ink-100 px-2 py-1 text-ink-700 hover:bg-ink-200 dark:bg-ink-700 dark:text-ink-200"
                    >
                      {r} ↗
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          <div className="border-t border-ink-100 dark:border-ink-700">
            <div className="px-3 py-1.5 text-[10px] font-bold text-ink-400">
              {q ? "추천" : "🔥 인기 검색어"}
            </div>
            {filteredPopular.length === 0 ? (
              <div className="px-3 py-2 text-xs text-ink-500">
                결과 없음 — Enter로 검색
              </div>
            ) : (
              filteredPopular.map((p, i) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => apply(p)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-ink-50 dark:hover:bg-ink-700"
                >
                  {!q && (
                    <span
                      className={`text-[10px] font-bold ${
                        i < 3 ? "text-brand-500" : "text-ink-400"
                      }`}
                    >
                      {i + 1}
                    </span>
                  )}
                  <span>{p}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
