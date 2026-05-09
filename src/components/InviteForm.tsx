"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Campaign = { id: string; title: string; offer: string };

export function InviteForm({
  userId,
  nickname,
  campaigns,
}: {
  userId: string;
  nickname: string;
  campaigns: Campaign[];
}) {
  const router = useRouter();
  const [campaignId, setCampaignId] = useState<string>(campaigns[0]?.id ?? "");
  const [title, setTitle] = useState("저희 캠페인에 모셔보고 싶어요!");
  const [message, setMessage] = useState("");
  const [offerSummary, setOfferSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/advertiser/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        campaignId: campaignId || null,
        title: title.trim(),
        message: message.trim(),
        offerSummary: offerSummary.trim() || null,
      }),
    });
    setLoading(false);
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(d?.error || "초대 발송 실패");
      return;
    }
    router.push(`/advertiser/influencers/${userId}?sent=1`);
    router.refresh();
  };

  return (
    <div className="card p-5">
      <h2 className="text-base font-bold">📨 직접 초대 보내기</h2>
      <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
        <b>{nickname}</b>님에게 캠페인 참여 제안을 보냅니다. 인플루언서가 수락하면 즉시 선정 처리됩니다.
      </p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <div>
          <label className="label">캠페인 선택 (선택 안 하면 일반 제안)</label>
          {campaigns.length > 0 ? (
            <select
              className="input"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
            >
              <option value="">선택 안 함 (텍스트 제안만)</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          ) : (
            <div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              진행중인 캠페인이 없어 텍스트 제안만 가능합니다. 먼저{" "}
              <a href="/advertiser/campaigns/new" className="font-bold underline">
                캠페인을 등록
              </a>
              해주세요.
            </div>
          )}
        </div>
        <div>
          <label className="label">제목 *</label>
          <input
            className="input"
            required
            maxLength={80}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="label">제공 내역 요약 (선택)</label>
          <input
            className="input"
            maxLength={120}
            placeholder="예: 2인 코스 요리 + 와인 1잔"
            value={offerSummary}
            onChange={(e) => setOfferSummary(e.target.value)}
          />
        </div>
        <div>
          <label className="label">메시지 * (10자 이상)</label>
          <textarea
            className="input min-h-32"
            required
            minLength={10}
            maxLength={500}
            placeholder="안녕하세요! 후기를 정말 잘 써주셔서 인상깊었습니다. 저희 매장 분위기와 잘 맞을 것 같아 직접 모시고 싶어 연락드려요..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        {error && <div className="text-xs text-red-500">{error}</div>}
        <button disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? "발송 중..." : "초대 발송"}
        </button>
      </form>
      <p className="mt-3 text-[11px] text-ink-500 dark:text-ink-400">
        ※ 같은 인플루언서에게 14일 내 중복 초대는 차단됩니다. 무리한 일괄 발송 시 계정이 제한될 수 있습니다.
      </p>
    </div>
  );
}
