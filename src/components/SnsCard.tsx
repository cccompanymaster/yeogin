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

type Props = {
  channel: Channel;
  url: string | null;
  metric: number | null;
  verifiedAt: Date | string | null;
  pendingVerification?: boolean;
  youtubeAutoEnabled: boolean;
};

export function SnsCard({
  channel,
  url,
  metric,
  verifiedAt,
  pendingVerification,
  youtubeAutoEnabled,
}: Props) {
  const meta = META[channel];
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"quick" | "verify">("quick");
  const [u, setU] = useState(url ?? "");
  const [m, setM] = useState<string>(metric != null ? String(metric) : "");
  const [imageData, setImageData] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuto = channel === "youtube" && youtubeAutoEnabled;
  const connected = url && metric != null;
  const verified = !!verifiedAt;

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.2 * 1024 * 1024) {
      setError("이미지는 1.2MB 이하로 업로드해주세요.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageData(String(reader.result));
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (mode === "verify") {
      const res = await fetch("/api/auth/sns-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          url: u,
          metric: Number(m || 0),
          imageData,
        }),
      });
      setLoading(false);
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(d?.error || "제출 실패");
        return;
      }
    } else {
      const payload: Record<string, unknown> = { channel, url: u };
      if (!isAuto) payload.metric = m === "" ? null : Number(m);
      const res = await fetch("/api/auth/sns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setLoading(false);
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(d?.error || "저장 실패");
        return;
      }
    }
    setOpen(false);
    router.refresh();
  };

  const badgeStyle = verified
    ? "bg-emerald-50 text-emerald-700"
    : pendingVerification
      ? "bg-amber-50 text-amber-800"
      : "";

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
            <div className="flex items-center gap-1 text-xs text-ink-500">
              {meta.metricLabel}
              {verified && (
                <span className={`badge ml-1 ${badgeStyle}`}>✓ 인증</span>
              )}
              {!verified && pendingVerification && (
                <span className={`badge ml-1 ${badgeStyle}`}>심사중</span>
              )}
            </div>
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
            {connected ? "변경/인증" : "등록하기"}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/60 px-4">
          <div className="card max-h-[90vh] w-full max-w-md overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">{meta.name} 연결</h3>
              <button onClick={() => setOpen(false)} className="text-ink-400">
                ✕
              </button>
            </div>

            {/* 방식 탭 */}
            <div className="mb-3 flex gap-1 rounded-lg bg-ink-100 p-1">
              <button
                type="button"
                onClick={() => setMode("quick")}
                className={`flex-1 rounded-md py-1.5 text-xs font-bold ${
                  mode === "quick" ? "bg-white shadow-sm" : "text-ink-500"
                }`}
              >
                {isAuto ? "자동 인증" : "빠른 등록"}
              </button>
              <button
                type="button"
                onClick={() => setMode("verify")}
                className={`flex-1 rounded-md py-1.5 text-xs font-bold ${
                  mode === "verify" ? "bg-white shadow-sm" : "text-ink-500"
                }`}
              >
                인증샷 인증
              </button>
            </div>

            {mode === "quick" ? (
              <p className="mb-4 rounded-md bg-ink-50 px-3 py-2 text-xs text-ink-700">
                {isAuto
                  ? "유튜브 채널 URL만 입력하면 구독자 수를 자동으로 가져옵니다."
                  : "URL과 수치를 직접 입력합니다. 인증 배지는 표시되지 않으며, 인증샷 인증을 하면 신뢰도가 올라갑니다."}
              </p>
            ) : (
              <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                통계 화면을 캡처해서 업로드하면 관리자가 검수 후 ✓ 인증 배지가
                부여됩니다. (1.2MB 이하 PNG/JPG)
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
              {(!isAuto || mode === "verify") && (
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
              {mode === "verify" && (
                <div>
                  <label className="label">인증샷 (PNG/JPG)</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    required
                    onChange={onPickImage}
                    className="input cursor-pointer file:mr-3 file:rounded file:border-0 file:bg-brand-500 file:px-3 file:py-1 file:text-xs file:font-bold file:text-white"
                  />
                  {imageData && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={imageData}
                      alt="미리보기"
                      className="mt-2 max-h-40 w-full rounded-md border border-ink-200 object-contain"
                    />
                  )}
                </div>
              )}
              {error && <div className="text-xs text-red-500">{error}</div>}
              <button disabled={loading} className="btn-primary w-full py-2.5">
                {loading
                  ? "처리 중..."
                  : mode === "verify"
                    ? "인증 요청 제출"
                    : isAuto
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
