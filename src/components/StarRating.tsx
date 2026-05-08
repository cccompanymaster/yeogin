export function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "text-lg" : size === "md" ? "text-sm" : "text-xs";
  return (
    <span className={`inline-flex items-center gap-0.5 ${sz} text-amber-400`} aria-label={`${rating}점`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? "" : "text-ink-200"}>
          ★
        </span>
      ))}
    </span>
  );
}
