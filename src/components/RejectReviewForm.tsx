"use client";

import { useState } from "react";

export function RejectReviewForm({ reviewId }: { reviewId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="badge bg-red-50 text-red-700 hover:bg-red-100"
      >
        반려
      </button>
      {open && (
        <form
          action={`/api/advertiser/reviews/${reviewId}`}
          method="post"
          className="ml-2 flex items-center gap-1"
        >
          <input type="hidden" name="action" value="reject" />
          <input
            name="rejectReason"
            required
            placeholder="반려 사유"
            className="input w-44 py-1 text-xs"
          />
          <button className="badge bg-red-500 text-white">제출</button>
        </form>
      )}
    </>
  );
}
