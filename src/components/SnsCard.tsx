"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Channel = "blog" | "insta" | "youtube" | "tiktok";

const META: Record<
  Channel,
  { name: string; metricLabel: string; color: string; icon: string; placeholder: string }
> = {
  blog: {
    name: "네이버 블로그",
    metricLabel: "일간 방문자",
    color: "#03c75a",
    icon: "B",
    placeholder: "https://blog.naver.com/...",
  },
  insta: {
    name: "인스타그램",
    metricLabel: "팔로워",
    color: "#e1306c",
    icon: "📷",
    placeholder: "https://instagram.com/...",
  },
  youtube: {
    name: "유튜브",
    metricLabel: "구독자",
    color: "#ff0000",
    icon: "▶",
    placeholder: "https://youtube.com/@...",
  },
  tiktok: {
    name: "틱톡",
    metricLabel: "팔로워",
    color: "#000000",
    icon: "♬",
    placeholder: "https://tiktok.com/@...",
  },
};

const fmt = (n: number) => {
  if (n >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, "")}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}천`;
  return n.toLocaleString();
};

export function SnsCard({
  channel,
  url,
  metric,
  youtubeAutoEnabled,
}: {
  channel: Channel;
  url: string | null;
  metric: number | null;
  youtubeAutoEnabled: boolean;
}) {
  const meta = META[channel];
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [u, setU] = useState(url ?? "");
  const [m, setM] = useState<string>(metric != null ? String(metric) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoTried, setAutoTried] = useState(false);

  const isAuto = channel === "youtube" && youtubeAutoEnabled;
  const connected = url && metric != null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setAutoTried(true);
    const payload: Record<string, unknown> = { channel, url: u };
    if (!isAuto) payload.metric = m === "" ? null : Number(m);
    const res = await fetch("/api/auth/sns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error || "저장에 실패했습니다.");
      return;
    }
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold text-white"
            style={{ background: meta.color }}
          >
            {meta.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-ink-500">{meta.metricLabel}</div>
            <div className="truncate text-base font-bold text-ink-900">
              {connected ? `${fmt(metric)}명` : "미등록"}
            </div>
          </div>
        </div>
        <div className="border-t border-ink-100 p-2">
          <button
            onClick={() => setOpen(true)}
            className={`w-full rounded-md py-2 text-xs font-bold ${
              connected
                ? "bg-ink-100 text-ink-700 hover:bg-ink-200"
                : "bg-brand-500 text-white hover:bg-brand-600"
            }`}
          >
            {connected ? "계정 변경" : "등록하기"}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/60 px-4">
          <div className="card w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">{meta.name} 연결</h3>
              <button onClick={() => setOpen(false)} className="text-ink-400">
                ✕
              </button>
            </div>
            {isAuto ? (
              <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                ✓ 유튜브는 채널 URL만 입력하면 구독자 수를 자동으로 가져옵니다.
              </p>
            ) : (
              <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                현재는 자동 인증이 어려워 직접 입력으로 등록합니다. 추후 인증샷 업로드 방식이 추가될 예정입니다.
              </p>
            )}
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="label">{meta.name} URL</label>
                <input
                  required
                  className="input"
                  type="url"
                  placeholder={meta.placeholder}
                  value={u}
                  onChange={(e) => setU(e.target.value)}
                />
              </div>
              {!isAuto && (
                <div>
                  <label className="label">{meta.metricLabel} 수</label>
                  <input
                    required
                    className="input"
                    type="number"
                    min={0}
                    value={m}
                    onChange={(e) => setM(e.target.value)}
                  />
                </div>
              )}
              {error && <div className="text-xs text-red-500">{error}</div>}
              <button disabled={loading} className="btn-primary w-full py-2.5">
                {loading
                  ? "저장 중..."
                  : isAuto && !autoTried
                    ? "자동 인증하기"
                    : "저장"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
