"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdvertiserRatingModal({
  campaignId,
  campaignTitle,
  existing,
}: {
  campaignId: string;
  campaignTitle: string;
  existing?: { rating: number; comment: string | null } | null;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(existing?.rating || 5);
  const [comment, setComment] = useState(existing?.comment || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/advertiser-rating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId, rating, comment }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d?.error || "오류");
      return;
    }
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="badge bg-amber-100 text-amber-800 hover:bg-amber-200"
      >
        {existing ? `★${existing.rating} 수정` : "광고주 평가"}
      </button>
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/60 px-4">
          <div className="card w-full max-w-md p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold">광고주 평가</h3>
              <button onClick={() => setOpen(false)} className="text-ink-400">✕</button>
            </div>
            <p className="mb-3 text-xs text-ink-500">{campaignTitle}</p>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="label">매장·광고주 평점</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-2xl transition ${
                        rating >= n ? "scale-110 text-amber-400" : "text-ink-300 hover:text-ink-400"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">한 줄 평 (선택)</label>
                <textarea
                  className="input min-h-20"
                  maxLength={200}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="응대, 가이드 명확성, 매장 분위기 등을 평가해주세요"
                />
              </div>
              {error && <div className="text-xs text-red-500">{error}</div>}
              <button disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? "저장 중..." : existing ? "수정" : "평가 등록"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
