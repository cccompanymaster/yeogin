"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ApplyModal({
  campaignId,
  channel,
  defaultUrl,
}: {
  campaignId: string;
  channel: string;
  defaultUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch(`/api/campaigns/${campaignId}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelUrl: url, message }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "신청에 실패했습니다.");
      return;
    }
    setOpen(false);
    router.refresh();
    router.push("/mypage");
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary w-full py-3 text-base">
        체험단 신청하기
      </button>
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/60 px-4">
          <div className="card w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">체험단 신청</h3>
              <button onClick={() => setOpen(false)} className="text-ink-400">
                ✕
              </button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="label">활동할 채널 URL ({channel})</label>
                <input
                  className="input"
                  required
                  type="url"
                  placeholder="https://blog.naver.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="label">자기소개 / 어필 (선택)</label>
                <textarea
                  className="input min-h-24"
                  placeholder="평소 작성하는 글 스타일, 강점 등을 적어주세요"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              {error && <div className="text-xs text-red-500">{error}</div>}
              <button disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? "신청 중..." : "신청 완료"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
