type Props = {
  size?: number;
  variant?: "full" | "icon" | "white";
};

export function Logo({ size = 28, variant = "full" }: Props) {
  const isWhite = variant === "white";
  const accent = isWhite ? "#ffffff" : "#f97316";
  const accentDark = isWhite ? "#ffe9d6" : "#c2410c";
  const text = isWhite ? "#ffffff" : "#0f172a";

  const Mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
    >
      {/* 핀 외곽 */}
      <path
        d="M16 2C9.92 2 5 6.85 5 12.83c0 7.4 9.04 15.5 10.13 16.45a1.3 1.3 0 0 0 1.74 0C17.96 28.33 27 20.23 27 12.83 27 6.85 22.08 2 16 2Z"
        fill={accent}
      />
      {/* 그림자 깊이 */}
      <path
        d="M16 30c-.34 0-.68-.13-.96-.39C13.96 28.55 5 20.5 5 12.83 5 12 5.06 11.2 5.18 10.4c.86 6.94 9.04 14.4 10.07 15.32a1.3 1.3 0 0 0 1.5 0c1.03-.92 9.21-8.38 10.07-15.32.12.8.18 1.6.18 2.43C27 20.5 18.04 28.55 17 29.61c-.28.26-.62.39-1 .39Z"
        fill={accentDark}
        opacity="0.25"
      />
      {/* 가운데 한글 'ㅇ' 모양 + 사람이 있는 위치 표시 느낌 */}
      <circle cx="16" cy="13" r="4.5" fill="#fff" />
      <circle cx="16" cy="13" r="2" fill={accent} />
    </svg>
  );

  if (variant === "icon") return Mark;

  return (
    <div className="flex items-center gap-1.5">
      {Mark}
      <div className="flex items-baseline gap-1">
        <span
          className="text-xl font-black leading-none tracking-tight"
          style={{ color: text }}
        >
          여긴
        </span>
        <span
          className="hidden text-[10px] font-bold tracking-[0.2em] sm:inline"
          style={{ color: isWhite ? "rgba(255,255,255,0.6)" : "#94a3b8" }}
        >
          YEOGIN
        </span>
      </div>
    </div>
  );
}
