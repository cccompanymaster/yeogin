"use client";

import { useState } from "react";

export function CopyInviteButton({ url, code }: { url: string; code: string }) {
  const [copied, setCopied] = useState<"url" | "code" | null>(null);

  const copy = async (text: string, kind: "url" | "code") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({
          title: "여긴 체험단",
          text: `${code} 코드로 가입하면 양쪽 1,000P!`,
          url,
        });
      } catch {
        // user cancelled
      }
    } else {
      copy(url, "url");
    }
  };

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-xs backdrop-blur">
        <span className="flex-1 truncate font-mono">{url}</span>
        <button
          type="button"
          onClick={() => copy(url, "url")}
          className="rounded bg-white/30 px-2 py-1 font-bold hover:bg-white/50"
        >
          {copied === "url" ? "복사됨!" : "복사"}
        </button>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => copy(code, "code")}
          className="flex-1 rounded-lg bg-white py-2 text-sm font-bold text-brand-700 hover:bg-white/95"
        >
          {copied === "code" ? "코드 복사됨!" : "코드만 복사"}
        </button>
        <button
          type="button"
          onClick={share}
          className="flex-1 rounded-lg border border-white/40 py-2 text-sm font-bold text-white hover:bg-white/15"
        >
          공유하기
        </button>
      </div>
    </div>
  );
}
