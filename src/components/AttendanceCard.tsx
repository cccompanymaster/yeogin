"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function bonusForLocal(streak: number): number {
  if (streak >= 30) return 500;
  if (streak >= 14) return 300;
  if (streak >= 7) return 200;
  if (streak >= 3) return 100;
  return 50;
}

export function AttendanceCard({
  streak,
  doneToday,
}: {
  streak: number;
  doneToday: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(
    doneToday ? "오늘 출석 완료" : null
  );

  const click = async () => {
    if (doneToday) return;
    setLoading(true);
    const res = await fetch("/api/auth/attend", { method: "POST" });
    setLoading(false);
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(d?.error || "오류");
      return;
    }
    setMsg(`+${d.bonus}P 적립! ${d.streak}일 연속`);
    router.refresh();
  };

  // 7일 진행바
  const dotIndex = streak % 7;
  return (
    <div className="card overflow-hidden">
      <div className="bg-gradient-to-br from-amber-400 to-orange-500 px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold opacity-90">출석체크</div>
            <div className="text-2xl font-black">🔥 {streak}일째</div>
          </div>
          <div className="text-[11px] opacity-90 text-right">
            오늘 +{bonusForLocal(streak + (doneToday ? 0 : 1))}P
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition ${
                i < (doneToday ? streak % 7 || 7 : dotIndex)
                  ? "bg-white"
                  : "bg-white/30"
              }`}
            />
          ))}
        </div>
        <div className="mt-1 text-[10px] opacity-80">
          7일 +200P · 14일 +300P · 30일 +500P
        </div>
      </div>
      <div className="p-3">
        <button
          onClick={click}
          disabled={doneToday || loading}
          className={`w-full rounded-md py-2 text-sm font-bold transition ${
            doneToday
              ? "bg-ink-100 text-ink-400"
              : "bg-brand-500 text-white hover:bg-brand-600"
          }`}
        >
          {loading ? "처리 중..." : doneToday ? "✓ 오늘 출석 완료" : "출석체크"}
        </button>
        {msg && (
          <p className="mt-1.5 text-center text-[11px] text-ink-600">{msg}</p>
        )}
      </div>
    </div>
  );
}
