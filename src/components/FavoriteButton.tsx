"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function FavoriteButton({
  campaignId,
  initialFavorited,
  loggedIn,
  size = "md",
}: {
  campaignId: string;
  initialFavorited: boolean;
  loggedIn: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  const dim =
    size === "sm" ? "h-7 w-7 text-sm" : size === "lg" ? "h-11 w-11 text-xl" : "h-9 w-9 text-base";

  const click = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    const next = !favorited;
    setFavorited(next);
    startTransition(async () => {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId }),
      });
      if (!res.ok) setFavorited(!next);
    });
  };

  return (
    <button
      type="button"
      onClick={click}
      disabled={pending}
      aria-label={favorited ? "관심 해제" : "관심 등록"}
      className={`flex ${dim} items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-110 ${
        favorited ? "text-red-500" : "text-ink-400"
      }`}
    >
      {favorited ? "❤️" : "🤍"}
    </button>
  );
}
