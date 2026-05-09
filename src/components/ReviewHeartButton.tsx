"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ReviewHeartButton({
  reviewId,
  loggedIn,
}: {
  reviewId: string;
  loggedIn: boolean;
}) {
  const [hearted, setHearted] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const click = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    const next = !hearted;
    setHearted(next);
    startTransition(async () => {
      const res = await fetch(`/api/reviews/${reviewId}/heart`, {
        method: "POST",
      });
      if (!res.ok) {
        setHearted(!next);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={click}
      disabled={pending}
      className={`inline-flex items-center gap-1 text-[11px] font-bold transition ${
        hearted ? "text-red-500" : "text-ink-400 hover:text-red-400"
      }`}
      aria-label={hearted ? "좋아요 취소" : "좋아요"}
    >
      {hearted ? "❤️" : "🤍"} 좋아요
    </button>
  );
}
