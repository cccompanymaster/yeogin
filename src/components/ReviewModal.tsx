"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewModal({ applicationId }: { applicationId: string }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [bodySnippet, setBodySnippet] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [highlight, setHighlight] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warn, setWarn] = useState<string[] | null>(null);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setWarn(null);
    setLoading(true);
    const res = await fetch(`/api/applications/${applicationId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, bodySnippet, rating, highlight }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data?.error || "등록에 실패했습니다.");
      return;
    }
    if (data.missingKeys?.length) {
      setWarn(data.missingKeys);
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
              <h3 className="text-lg font-bold">리뷰 등록</h3>
              <button
                onClick={() => {
                  setOpen(false);
                  setWarn(null);
                }}
                className="text-ink-400"
              >
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
              </div>
              <div>
                <label className="label">평점 (1~5점)</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-2xl transition ${
                        rating >= n ? "scale-110 text-amber-400" : "text-ink-300 hover:text-ink-400"
                      }`}
                      aria-label={`${n}점`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">한 줄 추천 (후기 갤러리 노출)</label>
                <input
                  className="input"
                  maxLength={60}
                  value={highlight}
                  onChange={(e) => setHighlight(e.target.value)}
                  placeholder="예: 데이트 코스로 강추! 분위기 끝내줘요"
                />
              </div>
              <div>
                <label className="label">본문 발췌 (선택, 키워드 자동 검수용)</label>
                <textarea
                  className="input min-h-24"
                  placeholder="본문 일부를 붙여넣으면 필수 키워드 포함 여부를 자동으로 검사합니다."
                  value={bodySnippet}
                  onChange={(e) => setBodySnippet(e.target.value)}
                />
              </div>
              {warn && (
                <div className="rounded-md bg-amber-50 p-3 text-xs text-amber-800">
                  <b>다음 키워드가 누락되었습니다:</b>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {warn.map((k) => (
                      <span key={k} className="badge bg-amber-100 text-amber-800">
                        #{k}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2">
                    그래도 등록하려면 한 번 더 [등록] 버튼을 눌러주세요. 광고주
                    검수 단계에서 반려될 수 있습니다.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setWarn(null);
                      setOpen(false);
                      router.refresh();
                    }}
                    className="mt-2 text-xs font-semibold text-amber-700 underline"
                  >
                    수정하지 않고 등록 완료
                  </button>
                </div>
              )}
              {error && <div className="text-xs text-red-500">{error}</div>}
              <button disabled={loading} className="btn-primary w-full">
                {loading ? "등록 중..." : warn ? "그대로 다시 등록" : "등록"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
