"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Slide = {
  eyebrow: string;
  title: string;
  desc: string;
  ctaLabel: string;
  href: string;
  bgFrom: string;
  bgTo: string;
  emoji: string;
};

const SLIDES: Slide[] = [
  {
    eyebrow: "여긴, 동네 단골이 시작되는 곳",
    title: "공짜로 먹고, 솔직하게 쓰고,\n진짜 단골이 되어보세요",
    desc: "맛집·카페·뷰티·여행 — 매일 새로 열리는 캠페인",
    ctaLabel: "오늘의 캠페인 보기 →",
    href: "/campaigns",
    bgFrom: "#f97316",
    bgTo: "#c2410c",
    emoji: "🍽️",
  },
  {
    eyebrow: "🎁 신규 가입 프로모션",
    title: "지금 가입하면\n5,000P 즉시 지급!",
    desc: "첫 캠페인 신청 시 +2,000P 추가 적립 · 6월 30일까지",
    ctaLabel: "5초 만에 가입하기 →",
    href: "/signup",
    bgFrom: "#7c3aed",
    bgTo: "#db2777",
    emoji: "🎉",
  },
  {
    eyebrow: "🌟 누구나 시작",
    title: "팔로워 100명도 OK!\n나도 인플루언서?!",
    desc: "구독자/팔로워 적어도 가능한 빠른선정 캠페인부터 시작",
    ctaLabel: "빠른선정 캠페인 보기 →",
    href: "/campaigns?fast=1",
    bgFrom: "#0ea5e9",
    bgTo: "#06b6d4",
    emoji: "✨",
  },
];

export function HeroRollingBanner() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setI((v) => (v + 1) % SLIDES.length);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused]);

  const go = (n: number) => setI((n + SLIDES.length) % SLIDES.length);

  return (
    <section
      className="card relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${i * 100}%)` }}
      >
        {SLIDES.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="flex w-full flex-shrink-0 cursor-pointer items-center"
            style={{
              background: `linear-gradient(135deg, ${s.bgFrom}, ${s.bgTo})`,
            }}
          >
            <div className="flex w-full flex-col gap-3 p-7 text-white md:flex-row md:items-center md:justify-between md:gap-6 md:p-10">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold opacity-90">{s.eyebrow}</div>
                <h2 className="mt-2 whitespace-pre-line text-2xl font-black leading-tight md:text-4xl">
                  {s.title}
                </h2>
                <p className="mt-3 text-sm opacity-90 md:text-base">{s.desc}</p>
                <div className="mt-5 inline-flex items-center rounded-lg bg-white/95 px-4 py-2 text-sm font-bold text-ink-900 transition group-hover:bg-white">
                  {s.ctaLabel}
                </div>
              </div>
              <div className="hidden text-[120px] leading-none opacity-30 md:block">
                {s.emoji}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 좌우 화살표 */}
      <button
        onClick={(e) => {
          e.preventDefault();
          go(i - 1);
        }}
        className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur transition hover:bg-white/40 md:block"
        aria-label="이전"
      >
        ‹
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          go(i + 1);
        }}
        className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur transition hover:bg-white/40 md:block"
        aria-label="다음"
      >
        ›
      </button>

      {/* 인디케이터 */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.preventDefault();
              go(idx);
            }}
            className={`h-1.5 rounded-full transition-all ${
              i === idx ? "w-8 bg-white" : "w-1.5 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`슬라이드 ${idx + 1}`}
          />
        ))}
      </div>

      <div className="absolute bottom-3 right-3 rounded-full bg-black/20 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
        {i + 1} / {SLIDES.length}
      </div>
    </section>
  );
}
