"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Option = { value: string; label: string };

export function FilterDropdown({
  label,
  options,
  paramKey,
  align = "left",
  showAll = true,
  allLabel = "전체",
}: {
  label: string;
  options: Option[];
  paramKey: string;
  align?: "left" | "right";
  showAll?: boolean;
  allLabel?: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const current = sp.get(paramKey) ?? "";
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = options.find((o) => o.value === current);
  const buttonText = selected ? selected.label : label;
  const active = !!selected;

  const apply = (value: string) => {
    const next = new URLSearchParams(sp.toString());
    if (!value) next.delete(paramKey);
    else next.set(paramKey, value);
    router.push(`?${next.toString()}`);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition ${
          active
            ? "border-ink-900 bg-ink-900 text-white"
            : "border-ink-300 bg-white text-ink-700 hover:border-ink-400"
        }`}
      >
        <span>{buttonText}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          className={`transition ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M3 4.5l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div
          className={`absolute top-full z-30 mt-1.5 max-h-80 min-w-[160px] overflow-auto rounded-xl border border-ink-200 bg-white py-1 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {showAll && (
            <button
              type="button"
              onClick={() => apply("")}
              className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-ink-50 ${
                !current ? "font-bold text-brand-600" : "text-ink-700"
              }`}
            >
              {allLabel}
              {!current && <span className="text-brand-500">✓</span>}
            </button>
          )}
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => apply(o.value)}
              className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-ink-50 ${
                current === o.value ? "font-bold text-brand-600" : "text-ink-700"
              }`}
            >
              {o.label}
              {current === o.value && <span className="text-brand-500">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function FilterToggleChip({
  label,
  paramKey,
  value,
}: {
  label: string;
  paramKey: string;
  value: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const active = sp.get(paramKey) === value;

  const toggle = () => {
    const next = new URLSearchParams(sp.toString());
    if (active) next.delete(paramKey);
    else next.set(paramKey, value);
    router.push(`?${next.toString()}`);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-medium transition ${
        active
          ? "border-brand-500 bg-brand-50 text-brand-700"
          : "border-ink-300 bg-white text-ink-700 hover:border-ink-400"
      }`}
    >
      {label}
    </button>
  );
}

export function FilterClearAll() {
  const router = useRouter();
  const sp = useSearchParams();
  const hasFilters = Array.from(sp.keys()).some((k) =>
    ["category", "channel", "type", "region", "sort", "fast", "nearby", "q"].includes(k)
  );
  if (!hasFilters) return null;
  return (
    <button
      type="button"
      onClick={() => router.push(window.location.pathname)}
      className="inline-flex h-9 items-center gap-1 rounded-full px-2 text-xs text-ink-500 hover:text-ink-700"
    >
      ↻ 초기화
    </button>
  );
}
