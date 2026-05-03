"use client";

import { useState } from "react";

export function BroadcastForm({
  campaignId,
  selectedCount,
  totalCount,
}: {
  campaignId: string;
  selectedCount: number;
  totalCount: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-outline"
      >
        📢 메시지 보내기
      </button>
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/60 px-4">
          <div className="card w-full max-w-md p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold">신청자에게 메시지 발송</h3>
              <button onClick={() => setOpen(false)} className="text-ink-400">
                ✕
              </button>
            </div>
            <p className="mb-3 text-xs text-ink-500">
              알림함과 마이페이지에 동시 노출됩니다. 가이드 안내, 일정 변경 공지에 활용하세요.
            </p>
            <form
              action={`/api/advertiser/campaigns/${campaignId}/broadcast`}
              method="post"
              className="space-y-3"
            >
              <div>
                <label className="label">대상</label>
                <select name="target" className="input" defaultValue="SELECTED">
                  <option value="SELECTED">선정자만 ({selectedCount}명)</option>
                  <option value="ALL">전체 신청자 ({totalCount}명)</option>
                </select>
              </div>
              <div>
                <label className="label">제목 *</label>
                <input
                  className="input"
                  name="title"
                  required
                  maxLength={60}
                  placeholder="가이드 안내드립니다"
                />
              </div>
              <div>
                <label className="label">본문 * (5자 이상)</label>
                <textarea
                  className="input min-h-32"
                  name="body"
                  required
                  minLength={5}
                  maxLength={500}
                  placeholder="안녕하세요! ..."
                />
              </div>
              <button className="btn-primary w-full py-2.5">발송</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
