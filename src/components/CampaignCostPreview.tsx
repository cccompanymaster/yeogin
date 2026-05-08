"use client";

import { useEffect, useState } from "react";

const TYPE_MULT: Record<string, number> = {
  VISIT: 1.0,
  DELIVERY: 1.2,
  PURCHASE: 0.8,
  REPORTER: 0.5,
};

function calc(capacity: number, type: string, fast: boolean): number {
  const base = capacity * 3000;
  const mult = TYPE_MULT[type] ?? 1.0;
  const fastBonus = fast ? 10000 : 0;
  return Math.round(base * mult) + fastBonus;
}

export function CampaignCostPreview({ balance }: { balance: number }) {
  const [capacity, setCapacity] = useState(5);
  const [type, setType] = useState("VISIT");
  const [fast, setFast] = useState(false);

  useEffect(() => {
    const form = document.querySelector("form[action*='campaigns']") as HTMLFormElement | null;
    if (!form) return;

    const update = () => {
      const cap = Number((form.elements.namedItem("capacity") as HTMLInputElement)?.value || 0);
      const t = (form.elements.namedItem("type") as HTMLSelectElement)?.value || "VISIT";
      const f = (form.elements.namedItem("fastMatch") as HTMLInputElement)?.checked ?? false;
      setCapacity(cap);
      setType(t);
      setFast(f);
    };
    update();

    form.addEventListener("change", update);
    form.addEventListener("input", update);
    return () => {
      form.removeEventListener("change", update);
      form.removeEventListener("input", update);
    };
  }, []);

  const cost = calc(capacity, type, fast);
  const ok = balance >= cost;

  return (
    <div
      className={`card sticky bottom-4 z-10 mt-4 p-4 shadow-lg ${
        ok ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] text-ink-500">예상 등록 비용</div>
          <div
            className={`text-2xl font-black ${
              ok ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {cost.toLocaleString()}P
          </div>
          <div className="mt-1 text-[11px] text-ink-500">
            현재 잔액 {balance.toLocaleString()}P{" "}
            {!ok && (
              <span className="font-bold text-red-700">
                · {(cost - balance).toLocaleString()}P 부족
              </span>
            )}
          </div>
        </div>
        {!ok && (
          <a
            href={`/advertiser/billing/charge?need=${cost - balance}`}
            className="btn-primary py-2"
          >
            충전하러 가기
          </a>
        )}
      </div>
      <div className="mt-2 text-[11px] text-ink-500">
        모집 {capacity}명 × 3,000P × 타입가중치{" "}
        {(TYPE_MULT[type] ?? 1.0).toFixed(1)}
        {fast && " + 빠른선정 10,000P"}
      </div>
    </div>
  );
}
