"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { REGION_QUICK } from "@/lib/format";

export function RegionQuickPicker() {
  const router = useRouter();
  const sp = useSearchParams();
  const [open, setOpen] = useState(true);
  const current = sp.get("region") ?? "";

  const apply = (key: string) => {
    const next = new URLSearchParams(sp.toString());
    if (current === key) next.delete("region");
    else next.set("region", key);
    router.push(`?${next.toString()}`);
  };

  return (
    <div className="card p-3 sm:p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-sm font-bold"
      >
        <span className="flex items-center gap-2">
          <span className="text-base">지역</span>
          <span className="text-xs font-normal text-ink-500 dark:text-ink-400">
            {current ? `· ${current}` : "· 지역을 선택해 주세요"}
          </span>
        </span>
        <span className={`text-ink-400 transition ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {REGION_QUICK.map((r) => {
            const active = current === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => apply(r.key)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900"
                    : "bg-ink-100 text-ink-700 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-200 dark:hover:bg-ink-700"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
