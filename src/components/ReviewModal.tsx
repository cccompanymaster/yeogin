"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewModal({ applicationId }: { applicationId: string }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch(`/api/applications/${applicationId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "등록에 실패했습니다.");
      return;
    }
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-outline">
        리뷰 URL 등록
      </button>
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/60 px-4">
          <div className="card w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">리뷰 URL 등록</h3>
              <button onClick={() => setOpen(false)} className="text-ink-400">
                ✕
              </button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="label">작성한 리뷰 게시물 URL</label>
                <input
                  className="input"
                  required
                  type="url"
                  placeholder="https://blog.naver.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <p className="mt-1 text-[11px] text-ink-500">
                  게시물이 공개 상태인지 확인 후 등록해주세요.
                </p>
              </div>
              {error && <div className="text-xs text-red-500">{error}</div>}
              <button disabled={loading} className="btn-primary w-full">
                {loading ? "등록 중..." : "등록"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
