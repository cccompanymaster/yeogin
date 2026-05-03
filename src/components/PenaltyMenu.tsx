"use client";

import { useState } from "react";

const OPTIONS = [
  { value: "CANCEL_AFTER_SELECT", label: "선정 후 취소 (-500P)" },
  { value: "NO_REVIEW", label: "리뷰 미작성 (-1000P)" },
  { value: "BAD_REVIEW", label: "가이드 미준수 (-300P)" },
];

export function PenaltyMenu({ applicationId }: { applicationId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="badge bg-red-50 text-red-700 hover:bg-red-100"
      >
        패널티
      </button>
      {open && (
        <form
          action={`/api/advertiser/applications/${applicationId}/penalty`}
          method="post"
          className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-ink-200 bg-white p-2 shadow-lg"
        >
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              name="type"
              value={o.value}
              className="block w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-ink-100"
            >
              {o.label}
            </button>
          ))}
        </form>
      )}
    </div>
  );
}
