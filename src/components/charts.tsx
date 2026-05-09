type Pt = { label: string; value: number };
type ColoredPt = Pt & { color?: string };

export function BarChart({
  data,
  height = 140,
  color = "#f97316",
  formatValue,
}: {
  data: Pt[];
  height?: number;
  color?: string;
  formatValue?: (n: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d) => {
          const h = (d.value / max) * (height - 24);
          return (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
              <div className="text-[10px] font-semibold text-ink-700 dark:text-ink-200">
                {formatValue ? formatValue(d.value) : d.value}
              </div>
              <div
                className="w-full rounded-t-md transition-all"
                style={{
                  height: Math.max(2, h),
                  background: color,
                  opacity: 0.4 + (d.value / max) * 0.6,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5 text-[10px] text-ink-500 dark:text-ink-400">
        {data.map((d) => (
          <div key={d.label} className="flex-1 text-center">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HBarChart({
  data,
  color = "#f97316",
  formatValue,
}: {
  data: Pt[];
  color?: string;
  formatValue?: (n: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2">
          <div className="w-20 truncate text-xs text-ink-700 dark:text-ink-200">{d.label}</div>
          <div className="flex h-5 flex-1 overflow-hidden rounded-md bg-ink-100 dark:bg-ink-700">
            <div
              className="h-full"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: color,
              }}
            />
          </div>
          <div className="w-12 text-right text-xs font-semibold text-ink-700 dark:text-ink-200">
            {formatValue ? formatValue(d.value) : d.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/** SVG 라인 차트 (시계열) */
export function LineChart({
  data,
  height = 180,
  color = "#f97316",
  showArea = true,
}: {
  data: Pt[];
  height?: number;
  color?: string;
  showArea?: boolean;
}) {
  const W = 600;
  const padX = 24;
  const padY = 16;
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = data.length > 1 ? (W - padX * 2) / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = padX + i * step;
    const y = height - padY - (d.value / max) * (height - padY * 2);
    return { x, y, ...d };
  });
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? padX} ${height - padY} L ${padX} ${height - padY} Z`;

  return (
    <div className="space-y-2">
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" preserveAspectRatio="none">
        {/* 격자 */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={padX}
            x2={W - padX}
            y1={padY + t * (height - padY * 2)}
            y2={padY + t * (height - padY * 2)}
            className="stroke-ink-200 dark:stroke-ink-700"
            strokeDasharray="2 4"
            strokeWidth={1}
          />
        ))}
        {showArea && (
          <path d={areaPath} fill={color} opacity={0.15} />
        )}
        <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p) => (
          <circle key={`${p.label}-${p.x}`} cx={p.x} cy={p.y} r={3} fill={color} />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-ink-500 dark:text-ink-400">
        {points
          .filter((_, i) => i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2))
          .map((p) => (
            <span key={p.label}>{p.label}</span>
          ))}
      </div>
    </div>
  );
}

/** 도넛(원형 비율) — 카테고리/등급 분포 */
export function DonutChart({
  data,
  size = 140,
  thickness = 22,
}: {
  data: ColoredPt[];
  size?: number;
  thickness?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="stroke-ink-100 dark:stroke-ink-700"
          strokeWidth={thickness}
        />
        {data.map((d, i) => {
          const dash = (d.value / total) * c;
          const seg = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color || "#f97316"}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return seg;
        })}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="0.35em"
          className="fill-ink-900 dark:fill-ink-100"
          fontSize={Math.round(size / 7)}
          fontWeight={800}
        >
          {total.toLocaleString()}
        </text>
      </svg>
      <ul className="flex-1 space-y-1.5 text-xs">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 flex-shrink-0 rounded-sm"
              style={{ background: d.color || "#f97316" }}
            />
            <span className="flex-1 text-ink-700 dark:text-ink-200">{d.label}</span>
            <span className="font-bold text-ink-900 dark:text-ink-100">
              {d.value} ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 퍼널 차트 — 단계별 전환 */
export function FunnelChart({
  steps,
}: {
  steps: { label: string; value: number; color?: string }[];
}) {
  const max = Math.max(1, ...steps.map((s) => s.value));
  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const widthPct = (s.value / max) * 100;
        const prev = i > 0 ? steps[i - 1].value : null;
        const conv = prev != null && prev > 0 ? Math.round((s.value / prev) * 100) : null;
        return (
          <div key={s.label} className="flex items-center gap-3">
            <div className="w-20 truncate text-xs font-semibold text-ink-700 dark:text-ink-200">
              {s.label}
            </div>
            <div className="relative flex h-9 flex-1 items-center overflow-hidden rounded-lg bg-ink-100 dark:bg-ink-700">
              <div
                className="absolute inset-y-0 left-0 flex items-center px-3 text-xs font-bold text-white"
                style={{
                  width: `${Math.max(8, widthPct)}%`,
                  background: s.color || "#f97316",
                }}
              >
                {s.value.toLocaleString()}
              </div>
            </div>
            <div className="w-14 text-right text-[11px] text-ink-500 dark:text-ink-400">
              {conv != null ? `${conv}%↓` : "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
