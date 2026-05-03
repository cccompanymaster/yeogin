"use client";

import { useState } from "react";

const REASONS = [
  { value: "FALSE_INFO", label: "허위/과장 정보" },
  { value: "BAD_TREATMENT", label: "매장에서 부당한 대우" },
  { value: "SPAM", label: "스팸/도배" },
  { value: "OTHER", label: "기타" },
];

export function ReportButton({
  campaignId,
  loggedIn,
}: {
  campaignId: string;
  loggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("FALSE_INFO");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loggedIn) {
    return (
      <a
        href="/login"
        className="text-xs text-ink-500 underline-offset-2 hover:underline"
      >
        🚩 신고하기
      </a>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId, reason, detail }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "신고 접수에 실패했습니다.");
      return;
    }
    setDone(true);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-ink-500 underline-offset-2 hover:underline"
      >
        🚩 신고하기
      </button>
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/60 px-4">
          <div className="card w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">캠페인 신고</h3>
              <button onClick={() => setOpen(false)} className="text-ink-400">
                ✕
              </button>
            </div>
            {done ? (
              <div className="space-y-3">
                <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
                  신고가 접수되었습니다. 관리자 검토 후 조치합니다.
                </div>
                <button onClick={() => setOpen(false)} className="btn-primary w-full">
                  닫기
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <div>
                  <label className="label">신고 사유</label>
                  <select
                    className="input"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    {REASONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">상세 내용 *</label>
                  <textarea
                    className="input min-h-28"
                    required
                    minLength={10}
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    placeholder="언제, 어떤 상황이었는지 구체적으로 적어주세요. (10자 이상)"
                  />
                </div>
                {error && <div className="text-xs text-red-500">{error}</div>}
                <button disabled={loading} className="btn-primary w-full">
                  {loading ? "접수 중..." : "신고 접수"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
