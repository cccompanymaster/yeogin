"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AvatarUpload({
  initialUrl,
  nickname,
}: {
  initialUrl: string | null;
  nickname: string;
}) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 700 * 1024) {
      setError("700KB 이하 이미지를 사용해주세요.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result);
      setLoading(true);
      const res = await fetch("/api/auth/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: dataUrl }),
      });
      setLoading(false);
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(d?.error || "업로드 실패");
        return;
      }
      setUrl(dataUrl);
      router.refresh();
    };
    reader.readAsDataURL(file);
  };

  const remove = async () => {
    if (!url) return;
    setLoading(true);
    const res = await fetch("/api/auth/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove" }),
    });
    setLoading(false);
    if (res.ok) {
      setUrl(null);
      router.refresh();
    }
  };

  return (
    <div className="flex items-start gap-3">
      <label className="group relative inline-flex h-14 w-14 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-ink-100 dark:bg-ink-700">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={nickname} className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl">👤</span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100">
          업로드
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={onPick}
          disabled={loading}
        />
      </label>
      <div className="text-[11px] text-ink-500">
        {error && <div className="text-red-500">{error}</div>}
        {loading && <div className="text-ink-400">업로드 중...</div>}
        {url && !loading && (
          <button
            type="button"
            onClick={remove}
            className="mt-1 text-xs text-ink-500 underline-offset-2 hover:underline"
          >
            제거
          </button>
        )}
      </div>
    </div>
  );
}
