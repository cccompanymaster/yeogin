"use client";

import { useEffect, useState } from "react";

const KEY = "yeogin_adv_popup_dismissed_at";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export function AdvertiserPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem(KEY);
    if (!t || Date.now() - Number(t) > COOLDOWN_MS) {
      const id = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(id);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(KEY, String(Date.now()));
    setOpen(false);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 px-4">
      <div className="card relative w-full max-w-md overflow-hidden">
        <button
          onClick={dismiss}
          aria-label="닫기"
          className="absolute right-3 top-3 rounded-md p-1 text-ink-400 hover:bg-ink-100"
        >
          ✕
        </button>
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-7 text-white">
          <div className="text-xs font-semibold opacity-90">광고주 전용</div>
          <div className="mt-1 text-2xl font-black leading-snug">
            매출이 오르는 체험단,<br />여긴 비즈센터에서 시작하세요
          </div>
          <div className="mt-2 text-sm opacity-90">
            5분 만에 캠페인 등록 · 첫 캠페인 등록비 무료
          </div>
        </div>
        <div className="space-y-2 p-6">
          <ul className="space-y-1.5 text-sm text-ink-700">
            <li>· 등록 즉시 노출, 24시간 내 신청자 매칭</li>
            <li>· 가이드 템플릿 / 리뷰 검수 / 패널티 자동 관리</li>
            <li>· 사업자번호로 간편 가입</li>
          </ul>
          <div className="mt-4 flex gap-2">
            <button onClick={dismiss} className="btn-outline flex-1">
              나중에
            </button>
            <a
              href="/advertiser"
              target="_blank"
              onClick={dismiss}
              className="btn-primary flex-1"
            >
              비즈센터 가기 →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
